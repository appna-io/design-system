'use client';

import { useCallback, type KeyboardEvent, type KeyboardEventHandler } from 'react';

import {
  indexOfRovingId,
  isElementRtl,
  resolveRovingNextIndex,
  type RovingItem,
  type RovingTabindexBaseOptions,
} from './_rovingShared';

export interface UseRovingTabindexRegistryOptions extends RovingTabindexBaseOptions {
  /**
   * Returns the current items in *visual / document* order. Re-queried on every key press so
   * dynamic lists (filter results, conditional mounts) stay correct without effects.
   */
  getItems: () => ReadonlyArray<RovingItem>;
  /**
   * Reads the currently-focused item id. Often equal to the "active" id but not always — in
   * `activation: 'manual'` mode focus can advance ahead of activation. Returning `null` is
   * fine; the resolver falls back to index 0.
   */
  getFocusedId: () => string | HTMLElement | null;
  /**
   * Imperatively focus the item with this id. Implementation is the consumer's responsibility
   * (it owns the (id → DOM element) mapping). Called on every arrow / Home / End that
   * resolves to a different index than the current focused one.
   */
  focusItem: (id: string | HTMLElement) => void;
  /**
   * Called when `Enter` / `Space` activates the focused item in manual mode. Ignored in
   * automatic mode because focus movement already activates there. Optional — only set this
   * if your component has a distinct "activate" step (Tabs: panel select, Menu: command run).
   */
  onActivate?: (id: string | HTMLElement) => void;
}

export interface UseRovingTabindexRegistryReturn {
  /**
   * The keydown handler to attach at every roving item. Bind via `onKeyDown` on each item's
   * rendered element. Reads the focused id from `getFocusedId()` so a single handler instance
   * can serve every item — but it is safe to call the hook per-item too (each call is cheap
   * because we only return `useCallback`-wrapped references).
   */
  onKeyDown: KeyboardEventHandler<Element>;
  /**
   * Compute the `tabIndex` attribute value for a given item id.
   *
   *  - Returns `0` if the id matches `getFocusedId()`.
   *  - Returns `-1` otherwise.
   *
   * Use this in render to apply the roving order: exactly one item has `tabIndex={0}` (the
   * entry point), all others have `tabIndex={-1}`. The browser then only includes that one
   * item in the Tab cycle, and arrow keys (via `onKeyDown`) move focus within the set.
   */
  getTabIndex: (id: string | HTMLElement) => 0 | -1;
}

/**
 * Registry-mode roving tabindex.
 *
 * The owning component maintains its own list of items — typically via a context-backed
 * registry where each rendered child calls `register(id, ref)` on mount. The hook reads that
 * list via `getItems()` on every key press, resolves the next index via the pure resolver,
 * and calls `focusItem(nextId)` to move focus.
 *
 * **When to choose registry over DOM-walk**:
 *
 *  - Items are *defined* by your component (e.g. `<Tabs.Trigger value="…">` — Tabs knows
 *    what its triggers are).
 *  - You need to filter / re-order items by criteria the DOM can't easily express (e.g.
 *    disabled state derived from props).
 *  - Items live across a portal boundary (overflow menus, Dialog-hosted tab strips).
 *  - You want O(1) focus moves without `querySelectorAll`.
 *
 * Used today by: Tabs. Future consumers: TreeView, NavigationMenu (Menubar pattern).
 *
 * @example
 *   const { onKeyDown, getTabIndex } = useRovingTabindexRegistry({
 *     orientation: 'horizontal',
 *     activation: 'automatic',
 *     getItems: () => ctx.values.map(v => ({ id: v, disabled: ctx.isDisabled(v) })),
 *     getFocusedId: () => ctx.value ?? null,
 *     focusItem: id => ctx.focusValue(id as string),
 *     onActivate: id => ctx.setValue(id as string),
 *   });
 *
 *   // In each item:
 *   <button tabIndex={getTabIndex(value)} onKeyDown={onKeyDown}>…</button>
 */
export function useRovingTabindexRegistry(
  opts: UseRovingTabindexRegistryOptions,
): UseRovingTabindexRegistryReturn {
  const {
    orientation,
    loop = true,
    rtlAware = true,
    activation = 'automatic',
    getItems,
    getFocusedId,
    focusItem,
    onActivate,
  } = opts;

  const onKeyDown = useCallback<KeyboardEventHandler<Element>>(
    (event: KeyboardEvent<Element>) => {
      // Handle manual-mode activation first — Enter / Space should commit the *focused* item
      // (which may differ from the currently active item). In automatic mode the focus
      // movement that arrow keys cause has already activated; nothing to do here.
      if (event.key === 'Enter' || event.key === ' ') {
        if (activation !== 'manual') return;
        const focusedId = getFocusedId();
        if (focusedId == null) return;
        event.preventDefault();
        onActivate?.(focusedId);
        return;
      }

      const items = getItems();
      if (items.length === 0) return;

      const focusedId = getFocusedId();
      const focusedIndex = indexOfRovingId(items, focusedId);

      const target = event.currentTarget as HTMLElement | null;
      const isRtl = rtlAware ? isElementRtl(target) : false;

      const nextIndex = resolveRovingNextIndex({
        items,
        focusedIndex,
        key: event.key,
        orientation,
        isRtl,
        loop,
      });

      if (nextIndex < 0) return;
      const next = items[nextIndex];
      if (!next) return;

      // Always preventDefault on a key we own — even when the resolved next index equals the
      // current one (boundary, no-loop). That stops the browser from scrolling on Arrow keys
      // and stops parent roving regions from also responding.
      event.preventDefault();

      if (nextIndex === focusedIndex) return;

      focusItem(next.id);
      // In automatic mode, focus movement IS activation. Call `onActivate` so consumers don't
      // need a separate effect to sync the active value with focus.
      if (activation === 'automatic') {
        onActivate?.(next.id);
      }
    },
    [orientation, loop, rtlAware, activation, getItems, getFocusedId, focusItem, onActivate],
  );

  const getTabIndex = useCallback<UseRovingTabindexRegistryReturn['getTabIndex']>(
    (id) => {
      const focused = getFocusedId();
      // `null` focused id means "no item is the entry yet" — first enabled item becomes the
      // entry point so the toolbar/list/tab strip remains keyboard reachable. Consumers can
      // override this by always returning a specific id from `getFocusedId`.
      if (focused == null) {
        const items = getItems();
        const firstEnabled = items.findIndex((it) => !it.disabled);
        const firstId = firstEnabled >= 0 ? items[firstEnabled]?.id : undefined;
        return firstId === id ? 0 : -1;
      }
      return focused === id ? 0 : -1;
    },
    [getFocusedId, getItems],
  );

  return { onKeyDown, getTabIndex };
}
