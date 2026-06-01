'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Owns the open / close timer state for the NavigationMenu's hover transitions.
 *
 * The shape is parallel to Tooltip's `useTooltipDelay` — two refs (one per timer)
 * so a re-render mid-delay doesn't restart them — but the surface is wider:
 * NavigationMenu has *many* hover targets (one trigger per Item) and the open
 * action takes an `id` argument so the root knows *which* dropdown to open.
 *
 * Behaviour notes:
 *  - When sweeping across triggers within `openDelay`, the root cancels the
 *    pending open (via `cancelPendingOpen`) and re-schedules with the new id.
 *    This avoids the "nervous flicker" you get with naive hover handling.
 *  - The Content panel calls `cancelClose()` on pointer-enter and `scheduleClose`
 *    on pointer-leave so users can sweep from trigger → content without the
 *    panel disappearing.
 *  - Both timers are cleared on unmount to avoid setting state on an unmounted
 *    component.
 *
 * **DRY note** — Tooltip's `useTooltipDelay` is a single-target, single-id
 * variant of this hook. The Phase 52 plan calls out promotion of `useHoverDelay`
 * to the engine when HoverCard (Phase 54) lands a third consumer — at that point
 * Tooltip / HoverCard / NavigationMenu all converge on a shared timer engine
 * with an `id` parameter. Until then this lives component-local.
 */
export interface UseHoverDelayOptions {
  /** Delay (ms) before opening on pointer-enter. */
  openDelay: number;
  /** Delay (ms) before closing after pointer-leave. */
  closeDelay: number;
  /** Called when the open delay elapses with the requested id. */
  onOpen: (id: string) => void;
  /** Called when the close delay elapses. */
  onClose: () => void;
}

export interface UseHoverDelayReturn {
  /** Schedule opening dropdown `id` after `openDelay`. Cancels any pending close. */
  scheduleOpen: (id: string) => void;
  /** Schedule a close after `closeDelay`. Cancels any pending open. */
  scheduleClose: () => void;
  /** Cancel any in-flight close (called when pointer enters Content). */
  cancelClose: () => void;
  /** Cancel any in-flight open (used when an unrelated event closes the menu). */
  cancelOpen: () => void;
  /** Imperatively flush both timers (used on unmount). */
  clearAll: () => void;
}

export function useHoverDelay(opts: UseHoverDelayOptions): UseHoverDelayReturn {
  const { openDelay, closeDelay, onOpen, onClose } = opts;

  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** The id queued to open. Refreshed on every `scheduleOpen` so sweeping works. */
  const queuedId = useRef<string | null>(null);

  // Stash callbacks in refs so the schedule helpers don't need to depend on them
  // (would otherwise re-create the callbacks every render and re-arm the timers).
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const cancelOpen = useCallback(() => {
    if (openTimer.current !== null) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    queuedId.current = null;
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(
    (id: string) => {
      // Cancel any pending close — sweeping into a new trigger should "win".
      cancelClose();
      // Cancel any pending open with a different id — the LATEST hover target wins.
      if (openTimer.current !== null && queuedId.current !== id) {
        clearTimeout(openTimer.current);
        openTimer.current = null;
      }
      // Don't schedule if we're already queued for this id.
      if (openTimer.current !== null && queuedId.current === id) return;
      queuedId.current = id;
      openTimer.current = setTimeout(() => {
        openTimer.current = null;
        const next = queuedId.current;
        queuedId.current = null;
        if (next !== null) onOpenRef.current(next);
      }, openDelay);
    },
    [openDelay, cancelClose],
  );

  const scheduleClose = useCallback(() => {
    cancelOpen();
    if (closeTimer.current !== null) return; // already scheduled
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      onCloseRef.current();
    }, closeDelay);
  }, [closeDelay, cancelOpen]);

  const clearAll = useCallback(() => {
    cancelOpen();
    cancelClose();
  }, [cancelOpen, cancelClose]);

  useEffect(() => clearAll, [clearAll]);

  return { scheduleOpen, scheduleClose, cancelClose, cancelOpen, clearAll };
}