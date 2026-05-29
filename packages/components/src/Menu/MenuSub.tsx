'use client';

import { useControllableState, useEscapeStack } from '@apx-ui/engine';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ReactElement,
} from 'react';

import { MenuSubContext } from './MenuContext';
import type { MenuSubContextValue, MenuSubProps } from './Menu.types';

/**
 * Submenu root. Owns the nested open state for its `SubTrigger` + `SubContent` pair, plus the
 * hover-delay timers (open/close). The escape-stack registration here is what makes
 * "Esc closes innermost only" work — the SubContent's entry sits *on top* of the root Menu's
 * entry in the stack, so the first Esc dismisses the sub and the next Esc dismisses the parent.
 *
 * Submenus do **not** register themselves with the outer Menu's item registry — they're nested
 * by tree (the SubContent renders its own MenuContext) so the outer keyboard hook never sees the
 * sub's items.
 */
export function MenuSub(props: MenuSubProps): ReactElement {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    openDelay = 120,
    closeDelay = 220,
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

  const contentId = useId();
  const triggerId = useId();

  const triggerNodeRef = useRef<HTMLElement | null>(null);
  const floatingNodeRef = useRef<HTMLElement | null>(null);

  const registerContent = useCallback((node: HTMLElement | null) => {
    floatingNodeRef.current = node;
  }, []);

  // Hover-delay timers
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPending = useCallback(() => {
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (open || openTimerRef.current !== null) return;
    openTimerRef.current = setTimeout(() => {
      setOpen(true);
      openTimerRef.current = null;
    }, openDelay);
  }, [open, openDelay, setOpen]);

  const scheduleClose = useCallback(() => {
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (!open || closeTimerRef.current !== null) return;
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, closeDelay);
  }, [open, closeDelay, setOpen]);

  useEffect(() => () => cancelPending(), [cancelPending]);

  // Sub uses escape-stack just like the root — its entry sits above the root's, so the first
  // Esc closes the sub. We don't wire `closeOnOutsideClick` here: outside-click on the parent's
  // menu is handled by the root; outside-click outside *both* menus collapses everything via the
  // root's own outside-click effect (the sub closes when the root closes, see effect below).
  const onEscape = useCallback(() => setOpen(false), [setOpen]);
  useEscapeStack({ active: open, onEscape });

  const ctxValue = useMemo<MenuSubContextValue>(
    () => ({
      open,
      setOpen,
      triggerNodeRef,
      floatingNodeRef,
      registerContent,
      contentId,
      triggerId,
      openDelay,
      closeDelay,
      scheduleOpen,
      scheduleClose,
      cancelPending,
    }),
    [
      open,
      setOpen,
      registerContent,
      contentId,
      triggerId,
      openDelay,
      closeDelay,
      scheduleOpen,
      scheduleClose,
      cancelPending,
    ],
  );

  return <MenuSubContext.Provider value={ctxValue}>{children}</MenuSubContext.Provider>;
}

MenuSub.displayName = 'Menu.Sub';
