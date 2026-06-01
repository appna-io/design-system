'use client';

import {
  useControllableState,
  useEscapeStack,
  useScrollLock,
} from '@apx-ui/engine';
import { useCallback, useId, useMemo, useRef } from 'react';
import type { ReactElement } from 'react';

import { DrawerContext } from './DrawerContext';
import type { DrawerContextValue, DrawerProps, DrawerSize } from './Drawer.types';

/**
 * Compound root. Drawer is Modal-with-an-edge — same lifecycle hooks, same context shape, same
 * controllable state pattern. The only structural difference lives downstream in `<Drawer.Content>`
 * (which uses `side` instead of `placement` and `drawerContentMotion()` instead of
 * `modalContentMotion()`).
 *
 * `<Drawer>` owns:
 *  - **State** — controlled / uncontrolled `open` via the engine's `useControllableState`.
 *  - **Lifecycle** — `useEscapeStack` (Esc → close, with nested-overlay ordering) and
 *    `useScrollLock` (engine, reference-counted). Drawer is the **second consumer** of
 *    `useScrollLock`, validating its reference-count discipline (Modal-over-Drawer = single
 *    lock + unlock pair).
 *  - **IDs** — `triggerId` / `titleId` / `descId` so Header's title + description elements wire
 *    into Content's `aria-labelledby` / `aria-describedby` automatically.
 *  - **Refs** — trigger and content node refs for return-focus and the
 *    `e.target === e.currentTarget` backdrop-sentinel check inside `<Drawer.Content>`.
 *
 * @example
 *   <Drawer>
 *     <Drawer.Trigger><Button>Open menu</Button></Drawer.Trigger>
 *     <Drawer.Content side="right" size="md">
 *       <Drawer.Close />
 *       <Drawer.Header title="Settings" description="Preferences for this account." />
 *       <Drawer.Body>…</Drawer.Body>
 *       <Drawer.Footer><Drawer.Close asChild><Button>Done</Button></Drawer.Close></Drawer.Footer>
 *     </Drawer.Content>
 *   </Drawer>
 */
export function Drawer(props: DrawerProps): ReactElement {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    closeOnEscape = true,
    closeOnBackdropClick = true,
    trapFocus = true,
    preventScroll = true,
    initialFocus,
    finalFocus,
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

  // Ids paired across Trigger ↔ Content (labelledby) and Header (title/desc) ↔ Content
  // (labelledby/describedby). `useId` is SSR-safe.
  const triggerId = useId();
  const titleId = useId();
  const descId = useId();

  // Trigger node ref captured via callback — needed for return-focus on close.
  const triggerNodeRef = useRef<HTMLElement | null>(null);
  const triggerRef = useCallback((node: HTMLElement | null) => {
    triggerNodeRef.current = node;
  }, []);

  // Content node ref — used by `<Drawer.Content>` for focus-trap container + (separately) by the
  // backdrop click sentinel.
  const contentNodeRef = useRef<HTMLElement | null>(null);
  const registerContent = useCallback((node: HTMLElement | null) => {
    contentNodeRef.current = node;
  }, []);

  const onEscape = useCallback(() => setOpen(false), [setOpen]);
  useEscapeStack({ active: open && closeOnEscape, onEscape });

  // Second consumer of `useScrollLock` (Modal was first). The reference count means a
  // Modal-over-Drawer combo collapses to a single lock + unlock pair without per-component
  // coordination.
  useScrollLock(open && preventScroll);

  // Default size for context — Header / Footer / Body read this so per-slot padding follows
  // Content's `size` axis. The actual ResponsiveValue is resolved inside Content via
  // `useThemedClasses`; the context-level value is the primitive default for child slots.
  const defaultSize: DrawerSize = 'md';

  const ctxValue = useMemo<DrawerContextValue>(
    () => ({
      open,
      setOpen,
      triggerRef,
      triggerNodeRef,
      contentNodeRef,
      registerContent,
      triggerId,
      titleId,
      descId,
      size: defaultSize,
      trapFocus,
      closeOnBackdropClick,
      initialFocus,
      finalFocus,
    }),
    [
      open,
      setOpen,
      triggerRef,
      registerContent,
      triggerId,
      titleId,
      descId,
      trapFocus,
      closeOnBackdropClick,
      initialFocus,
      finalFocus,
    ],
  );

  return <DrawerContext.Provider value={ctxValue}>{children}</DrawerContext.Provider>;
}

Drawer.displayName = 'Drawer';