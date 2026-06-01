'use client';

import {
  useControllableState,
  useEscapeStack,
  useOutsideClick,
} from '@apx-ui/engine';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactElement, RefCallback } from 'react';

import { MenuContext } from './MenuContext';
import type {
  MenuContextValue,
  MenuItemRecord,
  MenuItemRegistration,
  MenuProps,
  MenuVirtualAnchor,
} from './Menu.types';

/**
 * The compound root. `<Menu>` owns:
 *
 *  - The open/close state via `useControllableState` (same shape as Popover / Switch / Toggle).
 *  - The item registry: a `Map<id, { node, textValue, disabled }>` walked in DOM order by the
 *    keyboard hook. Items register themselves with their resolved id, text (for type-ahead) and
 *    disabled flag; the registry is the single source of truth for "what items exist right now".
 *  - The keyboard-highlight signal (`highlightedId`): the id of the item the keyboard nav is
 *    currently focused on. Driven by the keyboard hook on Content; read by Items via context.
 *  - Lifecycle hooks: `useEscapeStack` (close on Esc, top-of-stack only) and `useOutsideClick`
 *    (close on pointer-down outside trigger + content). Same `active: open` discipline Popover
 *    documented — tied to `open`, not `mounted`, so the handlers detach the moment we flip closed.
 *  - The context-menu virtual anchor: when `trigger="context"`, the Trigger's onContextMenu
 *    populates a `MenuVirtualAnchor` (a 1px rect at the cursor); Content reads it via context and
 *    feeds Floating UI a `setReference(virtualEl)` instead of the trigger node.
 *
 * The split between root state and Content visuals matches Popover's contract: the consumer
 * controls "is it open" and "what closes it" at the root, the visual axes (`variant` / `size` /
 * `color` / `placement` / `offset`) sit on `<Menu.Content>` because they're surface-level
 * decisions and Content might want them themed independently from `<Menu>`.
 */
export function Menu(props: MenuProps): ReactElement {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    trigger = 'click',
    closeOnEscape = true,
    closeOnOutsideClick = true,
    closeOnSelect = true,
    openDelay = 120,
    closeDelay = 180,
    children,
  } = props;

  const [openRaw, setOpenInternal] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange ?? undefined,
  });
  const open = openRaw ?? false;

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenInternal(next);
    },
    [setOpenInternal],
  );

  // Pairing ids for `aria-controls` / `aria-labelledby`. `useId` keeps SSR-safe.
  const contentId = useId();
  const triggerId = useId();

  // Trigger element — captured via callback ref so the value is live (no re-render on attach).
  // Floating UI's `setReference` (forwarded by `usePosition` inside Content) is composed via
  // `mergeRefs` so the trigger registers with both Menu (outside-click + return-focus) and the
  // positioning engine.
  const triggerNodeRef = useRef<HTMLElement | null>(null);
  const triggerRef = useCallback<RefCallback<HTMLElement | null>>((node) => {
    triggerNodeRef.current = node;
  }, []);

  // Floating element — captured via callback so `useOutsideClick` can check `contains()` against
  // the latest portalled node without forcing a re-render.
  const floatingNodeRef = useRef<HTMLElement | null>(null);
  const registerContent = useCallback((node: HTMLElement | null) => {
    floatingNodeRef.current = node;
  }, []);

  // Item registry: an ordered `Map<id, MenuItemRecord>`. Insertion order is the registration
  // order, which for items rendered top-to-bottom in JSX *is* DOM order. (Items mounted out of
  // tree order via `<Menu.Sub>` register inside their own SubContent's MenuContext, not this one,
  // so they don't interfere.)
  const itemsRef = useRef<Map<string, MenuItemRecord>>(new Map());

  const registerItem = useCallback(
    (id: string, node: HTMLElement | null, opts: MenuItemRegistration) => {
      const map = itemsRef.current;
      if (node === null) {
        map.delete(id);
        return;
      }
      map.set(id, { id, node, textValue: opts.textValue, disabled: opts.disabled });
    },
    [],
  );

  const getEnabledItems = useCallback((): MenuItemRecord[] => {
    // Walk the registry in insertion order. Items are inserted as they mount; React mounts in
    // tree order, so this is DOM order. We re-sort via `compareDocumentPosition` only if the
    // registry contains nodes whose DOM order differs from mount order (rare; happens for
    // dynamically reordered lists). Keep it cheap on the hot path.
    const list: MenuItemRecord[] = [];
    for (const rec of itemsRef.current.values()) {
      if (rec.disabled) continue;
      list.push(rec);
    }
    // Best-effort DOM-order sort. Falls back to insertion order if any compare throws (e.g.
    // detached nodes during unmount races).
    try {
      list.sort((a, b) => {
        const pos = a.node.compareDocumentPosition(b.node);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
    } catch {
      // ignore; insertion order remains.
    }
    return list;
  }, []);

  // Keyboard-highlight target. `null` when nothing is highlighted (e.g. just opened and waiting
  // for the first ArrowDown). The keyboard hook sets this; items render `data-highlighted="true"`
  // when their id matches.
  const [highlightedId, setHighlightedIdState] = useState<string | null>(null);
  const setHighlightedId = useCallback((id: string | null) => {
    setHighlightedIdState(id);
  }, []);

  // Context-menu virtual anchor. `null` for non-context modes; populated by the Trigger's
  // onContextMenu when in context mode.
  const [contextAnchor, setContextAnchor] = useState<MenuVirtualAnchor | null>(null);

  // Esc closes the topmost menu. The escape stack ordering means a Submenu (which also calls
  // useEscapeStack internally) closes first; the outer Menu only receives the next press.
  const onEscape = useCallback(() => setOpen(false), [setOpen]);
  useEscapeStack({ active: open && closeOnEscape, onEscape });

  // Outside-click. Both the trigger and the (portaled) content are "inside" — pointer-down on
  // either is treated as an in-menu interaction. Hook is paused entirely when closed.
  useOutsideClick({
    active: open && closeOnOutsideClick,
    refs: [triggerNodeRef, floatingNodeRef],
    onOutside: () => setOpen(false),
  });

  // Clear highlight + context anchor when the menu closes so re-opens start fresh.
  useEffect(() => {
    if (!open) {
      setHighlightedIdState(null);
      // Keep the context anchor alive while open so re-renders during the same session don't
      // jump the menu around; clear on close.
      setContextAnchor(null);
    }
  }, [open]);

  const ctxValue = useMemo<MenuContextValue>(
    () => ({
      open,
      setOpen,
      triggerRef,
      triggerNodeRef,
      floatingNodeRef,
      registerContent,
      registerItem,
      getEnabledItems,
      highlightedId,
      setHighlightedId,
      contentId,
      triggerId,
      triggerKind: trigger,
      closeOnSelect,
      contextAnchor,
      setContextAnchor,
      openDelay,
      closeDelay,
    }),
    [
      open,
      setOpen,
      triggerRef,
      registerContent,
      registerItem,
      getEnabledItems,
      highlightedId,
      setHighlightedId,
      contentId,
      triggerId,
      trigger,
      closeOnSelect,
      contextAnchor,
      openDelay,
      closeDelay,
    ],
  );

  return <MenuContext.Provider value={ctxValue}>{children}</MenuContext.Provider>;
}

Menu.displayName = 'Menu';