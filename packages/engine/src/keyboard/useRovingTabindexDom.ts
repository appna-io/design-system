'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type RefObject,
} from 'react';

import {
  isElementRtl,
  resolveRovingNextIndex,
  type RovingItem,
  type RovingTabindexBaseOptions,
} from './_rovingShared';

/**
 * Default focusable-item selector. Mirrors the toolbar's existing list:
 *
 *  - Native focusables that are enabled and visible.
 *  - ARIA-styled focusables (`role="button"` etc.) that are not `aria-disabled`.
 *  - Anything with an explicit positive (or zero) `tabindex`.
 *
 * Hidden inputs are excluded (no visible focus target). Items with `tabindex="-1"` are excluded
 * because they're programmatically-only focusable and the consumer didn't opt them in.
 */
export const DEFAULT_ROVING_ITEM_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [role="button"]:not([aria-disabled="true"]), [role="switch"]:not([aria-disabled="true"]), [role="checkbox"]:not([aria-disabled="true"]), [role="radio"]:not([aria-disabled="true"]), [role="menuitem"]:not([aria-disabled="true"]), [role="tab"]:not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"])';

export interface UseRovingTabindexDomOptions extends RovingTabindexBaseOptions {
  /**
   * Ref to the root element whose descendants form the roving set. Provided as a ref rather
   * than a callback so the consumer can keep its own existing ref pipeline (forwardRef, etc.).
   */
  rootRef: RefObject<HTMLElement | null>;
  /**
   * CSS selector for focusable items inside the root. Defaults to a conservative list of
   * native + ARIA focusables. Override to broaden or narrow (e.g. `'[role="treeitem"]'` for
   * a TreeView).
   */
  itemSelector?: string;
  /**
   * If set, candidates with an ancestor matching this selector are excluded from the roving
   * set. Toolbar uses `'[data-toolbar-skip="true"]'` to opt-out its overflow menu trigger and
   * separators / spacers. Pass `null` (not `undefined`) to disable boundary filtering.
   */
  skipBoundarySelector?: string | null;
  /**
   * Install a `MutationObserver` that re-asserts `tabindex` on the items when the subtree
   * changes (attribute or childList). Useful when child components (e.g. ToggleGroup single
   * mode) overwrite `tabindex` with their own value. @default true
   */
  observe?: boolean;
  /**
   * A token that bumps when the consumer renders fresh children. Causes the roving-tabindex
   * pass to re-run synchronously after that render. Use any monotonically-changing value
   * (children count, a version counter). Optional — the `MutationObserver` (when enabled)
   * catches most cases.
   */
  renderToken?: unknown;
  /**
   * Whether the hook should bail out early when the keydown target is a text input. Defaults
   * to `true`. Toolbar relies on this so an inline search filter inside a toolbar still gets
   * native arrow-key cursor navigation.
   */
  ignoreTextInputs?: boolean;
}

export interface UseRovingTabindexDomReturn {
  /**
   * Capture-phase keydown handler to attach via `onKeyDownCapture` on the root element.
   *
   * Capture phase is intentional: nested controls (e.g. `<ToggleGroup.Item>`) listen on bubble
   * and may call `preventDefault` on arrows to drive their own internal nav. Capturing first
   * gives the toolbar / outer roving region authority over the flat order — the canonical W3C
   * Toolbar guidance for nested toolbar items.
   */
  onKeyDownCapture: KeyboardEventHandler<HTMLElement>;
}

/**
 * Text input detection. Toolbars sometimes embed an inline filter or search input; arrow keys
 * inside such a field must navigate the cursor, not the toolbar. This list mirrors what the
 * toolbar already exempted in its local implementation.
 */
function isTextInput(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag !== 'INPUT') return false;
  const type = (el as HTMLInputElement).type;
  return (
    type === 'text' ||
    type === 'search' ||
    type === 'email' ||
    type === 'url' ||
    type === 'tel' ||
    type === 'password' ||
    type === 'number'
  );
}

/**
 * Read the live focusable descendants of `root` under the given selector, applying the skip
 * boundary if any. Each item is wrapped in a `{ id: HTMLElement }` shape so the pure resolver
 * can treat both registry and DOM-walk modes uniformly.
 */
function queryItems(
  root: HTMLElement,
  selector: string,
  skipBoundarySelector: string | null,
): HTMLElement[] {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector));
  return nodes.filter((el) => {
    if (el === root) return false;
    if (skipBoundarySelector && el.closest(skipBoundarySelector)) return false;
    return true;
  });
}

/**
 * Find the item that owns the currently-focused element. Handles the case where focus lives
 * on a *descendant* of an item (e.g. a `<span>` inside a button); we walk up to find the
 * matching enclosing item.
 */
function findOwningItemIndex(items: HTMLElement[], focused: Element | null): number {
  if (!focused) return -1;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it) continue;
    if (it === focused || it.contains(focused)) return i;
  }
  return -1;
}

/**
 * DOM-walk roving tabindex.
 *
 * The owning component just wires a `ref` to the root and (optionally) overrides the item
 * selector. The hook discovers items via `querySelectorAll` on each key press, manages the
 * `tabindex` attribute on those items (only one is `0`; the rest are `-1`), and re-asserts
 * the assignment when the subtree mutates.
 *
 * **When to choose DOM-walk over registry**:
 *
 *  - Children are *arbitrary* (consumer composes the toolbar with any mix of Buttons,
 *    Toggles, Menus, third-party widgets).
 *  - You don't want to thread `(id, ref)` registration through every direct child.
 *  - The set size is small (typical toolbar: < 20 items) so `querySelectorAll` is cheap.
 *  - You need the engine to defend against children that re-claim `tabindex=0` themselves
 *    (Toolbar's chief reason — `<ToggleGroup.Item>` in single mode does this on each press).
 *
 * Used today by: Toolbar. Future consumers: Carousel Indicators.
 *
 * @example
 *   const rootRef = useRef<HTMLDivElement>(null);
 *   const { onKeyDownCapture } = useRovingTabindexDom({
 *     rootRef,
 *     orientation: 'horizontal',
 *     loop: true,
 *     skipBoundarySelector: '[data-toolbar-skip="true"]',
 *   });
 *   return <div ref={rootRef} role="toolbar" onKeyDownCapture={onKeyDownCapture}>…</div>
 */
export function useRovingTabindexDom(
  opts: UseRovingTabindexDomOptions,
): UseRovingTabindexDomReturn {
  const {
    rootRef,
    orientation,
    loop = true,
    rtlAware = true,
    itemSelector = DEFAULT_ROVING_ITEM_SELECTOR,
    skipBoundarySelector,
    observe = true,
    renderToken,
    ignoreTextInputs = true,
  } = opts;

  // Resolve the skip selector default once — `undefined` means "use the toolbar-style default"
  // because that's the most common consumer; `null` opts out explicitly.
  const resolvedSkip =
    skipBoundarySelector === undefined ? '[data-toolbar-skip="true"]' : skipBoundarySelector;

  /**
   * The currently active item (the one with `tabindex=0`). We track via a ref because the
   * DOM attribute is the source of truth; bumping React state on every focus move would
   * cause cascading re-renders for no visual change.
   */
  const activeItemRef = useRef<HTMLElement | null>(null);

  // Manage the roving tabindex on items. The pass runs after every commit (via the effect)
  // and again whenever the MutationObserver sees a subtree change. The observer is the
  // defense against children that overwrite `tabindex` themselves between our passes.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const applyRovingOrder = () => {
      const items = queryItems(root, itemSelector, resolvedSkip);
      if (items.length === 0) {
        activeItemRef.current = null;
        return;
      }

      // Decide which item is the entry point:
      //  1. If the previously-active item is still in the list, keep it.
      //  2. Else if focus already lives inside an item, that item becomes active.
      //  3. Else the first item is the entry.
      let active: HTMLElement | null = null;
      const previous = activeItemRef.current;
      if (previous && items.includes(previous)) {
        active = previous;
      } else if (
        typeof document !== 'undefined' &&
        document.activeElement instanceof HTMLElement &&
        root.contains(document.activeElement)
      ) {
        const idx = findOwningItemIndex(items, document.activeElement);
        if (idx >= 0) active = items[idx] ?? null;
      }
      if (!active) active = items[0] ?? null;
      activeItemRef.current = active;

      for (const item of items) {
        const desired = item === active ? '0' : '-1';
        // Only touch the attribute when it would actually change. Cuts MutationObserver
        // chatter and keeps the DOM mutation count to a minimum.
        if (item.getAttribute('tabindex') !== desired) {
          item.setAttribute('tabindex', desired);
        }
      }
    };

    applyRovingOrder();

    // Track focus moves into the toolbar — clicks, programmatic focus, and Tab-in all land
    // on a child; promote that child to the entry point so subsequent Tab-out and Tab-in
    // remembers the user's last position (W3C-recommended behavior).
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const items = queryItems(root, itemSelector, resolvedSkip);
      const idx = findOwningItemIndex(items, target);
      if (idx < 0) return;
      const match = items[idx];
      if (!match || match === activeItemRef.current) return;
      activeItemRef.current = match;
      for (const item of items) {
        const desired = item === match ? '0' : '-1';
        if (item.getAttribute('tabindex') !== desired) {
          item.setAttribute('tabindex', desired);
        }
      }
    };

    root.addEventListener('focusin', handleFocusIn);

    let observer: MutationObserver | null = null;
    if (observe && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver((mutations) => {
        // Avoid reasserting on attribute mutations that *we just caused* — `applyRovingOrder`
        // sets `tabindex` directly. We can't easily distinguish source, so we conservatively
        // re-run only when the mutation isn't already in line with our desired state. The
        // `getAttribute !== desired` guard inside `applyRovingOrder` keeps this idempotent.
        let needsReassert = false;
        for (const m of mutations) {
          if (m.type === 'attributes' && m.attributeName === 'tabindex') {
            needsReassert = true;
            break;
          }
          if (m.type === 'childList') {
            needsReassert = true;
            break;
          }
        }
        if (needsReassert) applyRovingOrder();
      });
      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['tabindex', 'disabled', 'aria-disabled'],
      });
    }

    return () => {
      root.removeEventListener('focusin', handleFocusIn);
      observer?.disconnect();
    };
  }, [rootRef, itemSelector, resolvedSkip, observe, renderToken]);

  const onKeyDownCapture = useCallback<KeyboardEventHandler<HTMLElement>>(
    (event: KeyboardEvent<HTMLElement>) => {
      if (ignoreTextInputs && isTextInput(event.target as Element)) return;

      const root = rootRef.current;
      if (!root) return;

      const items = queryItems(root, itemSelector, resolvedSkip);
      if (items.length === 0) return;

      const focused = event.target instanceof HTMLElement ? event.target : null;
      const focusedIndex = findOwningItemIndex(items, focused);

      const rovingItems: RovingItem[] = items.map((el) => ({
        id: el,
        // DOM-level disabled state — both the native attribute and ARIA disabled count. The
        // selector already excludes these in most cases but `[tabindex]` matches can sneak
        // through, so we double-check here for correctness.
        disabled:
          el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true',
      }));

      const isRtl = rtlAware ? isElementRtl(focused ?? root) : false;

      const nextIndex = resolveRovingNextIndex({
        items: rovingItems,
        focusedIndex,
        key: event.key,
        orientation,
        isRtl,
        loop,
      });

      if (nextIndex < 0) return;

      // Always preventDefault for navigation keys we own. This stops the browser from
      // scrolling on arrow keys and stops nested roving regions from also responding.
      event.preventDefault();

      const next = items[nextIndex];
      if (!next || next === focused) return;

      // stopPropagation ensures a parent roving region doesn't also act on the same key.
      // Rare in practice (nested toolbars are unusual) but cheap to guarantee.
      event.stopPropagation();
      next.focus();
    },
    [rootRef, orientation, loop, rtlAware, itemSelector, resolvedSkip, ignoreTextInputs],
  );

  return { onKeyDownCapture };
}