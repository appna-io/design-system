'use client';

import { useEscapeStack } from '@apx-ui/engine';
import { useCallback, useId, useMemo, useRef } from 'react';
import type { ReactElement, RefCallback } from 'react';

import { HoverCardContext } from './HoverCardContext';
import type { HoverCardContextValue, HoverCardProps } from './HoverCard.types';
import { useTooltipDelay } from '../Tooltip/useTooltipDelay';

/**
 * The compound root. `<HoverCard>` owns the open/close timer state, the trigger interaction
 * mode, the trigger DOM ref, and the position-reference plumbing for Floating UI. Subparts
 * (`Trigger`, `Content`, `Arrow`) read the same root context.
 *
 * **Why `useTooltipDelay` is the engine** — we deliberately consume Tooltip's hover-delay hook
 * via a relative import (the second consumer of the same timer state-machine after Tooltip
 * itself). The hook's bridge logic (hovering the surface cancels the close timer) is exactly the
 * mechanic HoverCard needs to let users move from trigger → content without the card vanishing.
 *
 * Promotion to `@apx-ui/engine` is a Phase-52 NavigationMenu concern — that becomes the
 * third consumer and triggers the standard "extract on the third consumer" rule. Until then we
 * import directly to avoid a write-lock collision with the Tooltip lane.
 *
 * **Position-reference architecture** — same shape as Popover (Phase 18 + the Phase-19 renderer
 * positioning bug fix). Floating UI's `setReference` callback is registered via a mutable ref so
 * the trigger DOM node always reaches the positioning engine the moment it mounts, regardless
 * of which sibling commits first.
 */
export function HoverCard(props: HoverCardProps): ReactElement {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    openDelay = 700,
    closeDelay = 300,
    trigger = 'hover-focus',
    closeOnEscape = true,
    children,
  } = props;

  // Borrow Tooltip's open/close timer state-machine. The hook owns:
  // - controllable open state (forwards `onOpenChange` notifications)
  // - schedule/cancel logic with separate open + close timers
  // - bridge surface handlers (cancel close on surface enter, re-arm on surface leave)
  // We don't use the surface handlers' object directly because HoverCard's surface lives in a
  // sibling component (`<HoverCard.Content>`); instead we expose `cancelClose` / `scheduleClose`
  // through context so Content can register its own pointer handlers in the same state machine.
  const delay = useTooltipDelay({
    openDelay,
    closeDelay,
    open: openProp,
    defaultOpen,
    onOpenChange,
    disabled: false,
  });

  // Surface bridge handlers come from the same hook; expose a thin pair that calls the right
  // ones for HoverCard's Content. (The hook's `surfaceHandlers` already implement
  // cancel-close-on-enter / re-arm-on-leave; we wrap them as named callbacks for clarity.)
  const cancelClose = useCallback(() => {
    delay.surfaceHandlers.onPointerEnter();
  }, [delay.surfaceHandlers]);
  const scheduleClose = useCallback(() => {
    delay.surfaceHandlers.onPointerLeave();
  }, [delay.surfaceHandlers]);
  const scheduleOpen = useCallback(() => {
    delay.triggerHandlers.onPointerEnter();
  }, [delay.triggerHandlers]);

  // Stable ids for trigger ↔ content `aria-describedby` pairing. `useId` is SSR-safe.
  const contentId = useId();
  const triggerId = useId();

  // Trigger node ref captured via callback so the value is live (no re-render on attach). Used by
  // any future close-on-outside-click follow-up and (via `positionReferenceRef`) by
  // `<HoverCard.Content>`'s `usePosition` so the trigger registers with the positioning engine.
  const triggerNodeRef = useRef<HTMLElement | null>(null);
  const positionReferenceRef = useRef<RefCallback<HTMLElement | null> | null>(null);
  const registerPositionReference = useCallback(
    (cb: RefCallback<HTMLElement | null> | null) => {
      positionReferenceRef.current = cb;
      // Replay the current trigger node if one is already attached so Floating UI sees the
      // reference without waiting for the next ref-callback cycle. Same fix as Popover.
      if (cb && triggerNodeRef.current) cb(triggerNodeRef.current);
    },
    [],
  );
  const triggerRef = useCallback<RefCallback<HTMLElement | null>>((node) => {
    triggerNodeRef.current = node;
    positionReferenceRef.current?.(node);
  }, []);

  // Esc closes the topmost HoverCard. `active: open` not `mounted` — the handler unsubscribes
  // the moment we set `open: false`, even while the AnimatePresence exit animation is still
  // running. Same lesson Tooltip / Popover documented.
  const onEscape = useCallback(() => delay.closeImmediately(), [delay]);
  useEscapeStack({ active: delay.open && closeOnEscape, onEscape });

  const ctxValue = useMemo<HoverCardContextValue>(
    () => ({
      open: delay.open,
      scheduleOpen,
      scheduleClose,
      cancelClose,
      closeImmediately: delay.closeImmediately,
      trigger,
      triggerRef,
      triggerNodeRef,
      positionReferenceRef,
      registerPositionReference,
      contentId,
      triggerId,
    }),
    [
      delay.open,
      delay.closeImmediately,
      scheduleOpen,
      scheduleClose,
      cancelClose,
      trigger,
      triggerRef,
      registerPositionReference,
      contentId,
      triggerId,
    ],
  );

  return <HoverCardContext.Provider value={ctxValue}>{children}</HoverCardContext.Provider>;
}

HoverCard.displayName = 'HoverCard';
