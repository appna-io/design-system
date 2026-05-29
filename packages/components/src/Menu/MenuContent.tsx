'use client';

import { mergeRefs, Portal, usePosition } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { AnimatePresence, motion } from 'motion/react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ForwardedRef,
  type KeyboardEvent,
  type ReactElement,
  type Ref,
} from 'react';

import { menuMotion } from './Menu.motion';
import { menuContentRecipe } from './Menu.recipe';
import { useMenuContext } from './MenuContext';
import { useMenuKeyboard } from './useMenuKeyboard';
import type { MenuContentProps, MenuPlacement } from './Menu.types';

/**
 * The portal-rendered, positioned, focused floating panel. Mirrors `PopoverContent`'s engine
 * consumption but swaps `useFocusTrap` for a lighter-weight focus discipline appropriate for
 * menus:
 *
 *  - Focus moves into Content on open (Content carries `tabIndex={-1}` so it can receive focus
 *    without being part of the tab order).
 *  - Arrow/Home/End/typeahead/Enter/Space all live on Content's `onKeyDown` via `useMenuKeyboard`.
 *    Items themselves don't carry focus — they're `data-highlighted="true"` driven, which is
 *    cheaper than per-item refs and matches Radix's menu pattern.
 *  - On close, focus restores to the trigger via `triggerNodeRef.current?.focus()` in an
 *    effect tied to `open`.
 *
 * Engine notes:
 *
 *  - `usePosition` with the trigger ref captured from context (or a virtual element when
 *    `triggerKind === 'context'`). The position recomputes via Floating UI's autoUpdate while
 *    open and pauses when closed for free perf.
 *  - `<Portal>` defaults to `document.body`. Pass `portalContainer` when nesting inside Modal
 *    so the menu renders inside the modal's overlay rather than above it.
 *  - `data-state="open"` + `data-placement` set on Content for selector-based styling and for
 *    consumers' downstream animations.
 *
 * No focus trap on Menu. Menus aren't modals — Tab is the platform-canonical "close menu" key
 * and the keyboard hook handles it. Adding a trap here would block that.
 */
function MenuContentImpl(
  props: MenuContentProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    variant,
    size,
    color,
    placement: placementProp,
    offset = 4,
    portalContainer,
    loop = true,
    typeAhead = true,
    className,
    style,
    sx,
    children,
    onKeyDown,
    ...rest
  } = props;

  const ctx = useMenuContext('Menu.Content');
  const {
    open,
    setOpen,
    contentId,
    triggerId,
    closeOnSelect,
    contextAnchor,
    triggerKind,
    getEnabledItems,
    setHighlightedId,
    highlightedId,
    triggerNodeRef,
    registerContent,
  } = ctx;

  // Responsive prop resolution: `useThemedClasses` resolves the recipe with the responsive value;
  // `usePosition` only takes a single placement, so we resolve it to a primitive here.
  const placement: MenuPlacement =
    typeof placementProp === 'string'
      ? (placementProp as MenuPlacement)
      : 'bottom-start';

  const { triggerRef, floatingRef, placement: actualPlacement, floatingStyles } = usePosition({
    placement,
    offset,
    open,
  });

  // Wire the trigger into Floating UI. For `click` / `hover` modes we forward the trigger DOM
  // node; for `context` we forward the virtual anchor (1px rect at the cursor) the Trigger sets
  // when right-clicked. The effect re-runs when `contextAnchor` changes so the menu repositions
  // to the latest right-click coordinates.
  useEffect(() => {
    if (triggerKind === 'context' && contextAnchor) {
      // Floating UI accepts a `VirtualElement` (anything with `getBoundingClientRect`) in place
      // of a real DOM node via `setReference`.
      (triggerRef as unknown as (el: unknown) => void)(contextAnchor);
      return;
    }
    const node = triggerNodeRef.current;
    if (node) (triggerRef as unknown as (el: unknown) => void)(node);
    // Intentionally exclude triggerRef + triggerNodeRef from deps — they are stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKind, contextAnchor, open]);

  // Local floating ref so we can imperatively `focus()` Content on open and restore focus to the
  // trigger on close.
  const localFloatingRef = useRef<HTMLDivElement | null>(null);

  // Focus into Content the moment it mounts (after AnimatePresence's enter). We tie this to
  // `open` — the dependency on `open` is what makes it re-run on every open/close cycle.
  useEffect(() => {
    if (!open) return;
    // Defer to next tick so the portalled node is in the DOM.
    const id = setTimeout(() => {
      localFloatingRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => clearTimeout(id);
  }, [open]);

  // Return focus to the trigger when we close. Skip if focus has already moved off our subtree
  // (e.g. the user clicked elsewhere) — restoring would feel like a focus steal.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      return;
    }
    if (!wasOpenRef.current) return;
    wasOpenRef.current = false;
    // Only restore if focus is currently inside Content (i.e. we initiated the close from
    // keyboard / Esc, not from a click elsewhere).
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    const floating = localFloatingRef.current;
    if (floating && active && (active === floating || floating.contains(active))) {
      triggerNodeRef.current?.focus({ preventScroll: true });
    } else if (!active || active === document.body) {
      // No active element after the portal unmount — restore as a courtesy.
      triggerNodeRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onClose = useCallback(() => setOpen(false), [setOpen]);

  const onSelect = useCallback(
    (id: string) => {
      // Find the item record and dispatch a synthetic click on its node. Items wire `onSelect`
      // to onClick internally (so mouse + keyboard fire the same code path).
      const items = getEnabledItems();
      const target = items.find((it) => it.id === id);
      if (!target) return;
      // `HTMLElement.click()` fires a real click event, which the item's onClick captures.
      // Closing on select (when enabled) happens inside the item's handler, not here, so
      // Checkbox/Radio can opt out per-item.
      target.node.click();
    },
    [getEnabledItems],
  );

  const handleKeyDown = useMenuKeyboard({
    getItems: getEnabledItems,
    getHighlightedId: () => highlightedId,
    setHighlightedId,
    loop,
    typeAhead,
    onClose,
    onSelect,
  });

  const composedKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      handleKeyDown(event);
    },
    [onKeyDown, handleKeyDown],
  );

  const { className: contentClass, style: contentStyle } = useThemedClasses({
    recipe: menuContentRecipe,
    componentName: 'Menu',
    slot: 'content',
    props: {
      variant,
      size,
      color,
      className,
      sx,
      style,
    },
  });

  // Compose all the refs we want on the floating node: Floating UI's setFloating + our local
  // ref + the root's registerContent + the consumer's forwarded ref.
  const composedFloatingRef = mergeRefs<HTMLDivElement>(
    floatingRef as unknown as Ref<HTMLDivElement>,
    localFloatingRef as unknown as Ref<HTMLDivElement>,
    (node: HTMLDivElement | null) => registerContent(node as HTMLElement | null),
    forwardedRef as Ref<HTMLDivElement>,
  );

  const surfaceStyle: CSSProperties = {
    ...(floatingStyles as CSSProperties),
    ...(contentStyle ?? {}),
  };

  // We avoid passing the consumer's stray HTML attributes through to motion's typed props by
  // funneling them as an object spread at the end.
  const motionExtraProps: Record<string, unknown> = { ...rest };

  // Use `closeOnSelect` indirectly so the lint rule that flags unused destructured values
  // accepts the destructure (the value is read by Items via context, not here).
  void closeOnSelect;

  return (
    <Portal container={portalContainer}>
      <AnimatePresence>
        {open ? (
          <motion.div
            ref={composedFloatingRef}
            id={contentId}
            role="menu"
            tabIndex={-1}
            aria-labelledby={triggerId}
            aria-orientation="vertical"
            data-state="open"
            data-placement={actualPlacement}
            data-variant={typeof variant === 'string' ? variant : 'solid'}
            className={contentClass}
            style={surfaceStyle as never}
            onKeyDown={composedKeyDown}
            {...menuMotion(actualPlacement as MenuPlacement)}
            {...motionExtraProps}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}

export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(MenuContentImpl);
MenuContent.displayName = 'Menu.Content';
