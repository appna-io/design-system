import { useCallback, useEffect, useRef } from 'react';
import { useControllableState } from '@apx-ui/engine';

export interface UseTooltipDelayOptions {
  openDelay: number;
  closeDelay: number;
  open: boolean | undefined;
  defaultOpen: boolean | undefined;
  onOpenChange: ((open: boolean) => void) | undefined;
  disabled: boolean;
}

export interface TriggerHandlers {
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

export interface SurfaceHandlers {
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

export interface UseTooltipDelayReturn {
  open: boolean;
  /** Spread on the trigger element. Pointer / focus events schedule open / close with delays. */
  triggerHandlers: TriggerHandlers;
  /** Spread on the floating surface. Hovering it cancels the close timer (so users can move onto it). */
  surfaceHandlers: SurfaceHandlers;
  /** Force-close immediately. Used by the Esc handler. */
  closeImmediately: () => void;
}

/**
 * Owns the open / close timer state for `<Tooltip />`. Two timers (open and close) live in refs
 * so a re-render mid-delay doesn't restart them; a single helper cancels both when state flips.
 *
 * Behaviour notes:
 * - `disabled=true` short-circuits everything and forces `open` to `false`.
 * - Hovering the surface cancels the close timer (so users can move from trigger → tooltip
 *   without it disappearing). Leaving the surface re-arms the close timer.
 * - Focus opens immediately on a `0ms openDelay` would feel jarring, so we use the same delay
 *   for focus as for hover. Reach the same UX as Radix.
 * - Both timers are cleared on unmount to avoid setting state on an unmounted component.
 */
export function useTooltipDelay({
  openDelay,
  closeDelay,
  open: openProp,
  defaultOpen,
  onOpenChange,
  disabled,
}: UseTooltipDelayOptions): UseTooltipDelayReturn {
  const [openRaw, setOpenInternal] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange ?? undefined,
  });
  const open = openRaw ?? false;

  // Two refs (one per timer) so we can clear them by id without React rebinds.
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current !== null) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const setOpenStable = useRef(setOpenInternal);
  setOpenStable.current = setOpenInternal;

  const scheduleOpen = useCallback(
    (delay: number) => {
      if (disabled) return;
      if (closeTimer.current !== null) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      if (openTimer.current !== null) return; // already scheduled
      openTimer.current = setTimeout(() => {
        openTimer.current = null;
        setOpenStable.current(true);
      }, delay);
    },
    [disabled],
  );

  const scheduleClose = useCallback((delay: number) => {
    if (openTimer.current !== null) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current !== null) return; // already scheduled
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      setOpenStable.current(false);
    }, delay);
  }, []);

  const closeImmediately = useCallback(() => {
    clearTimers();
    setOpenStable.current(false);
  }, [clearTimers]);

  // Ensure the visible state is `false` whenever `disabled` flips on. We don't want a stuck-open
  // tooltip on a disabled trigger.
  useEffect(() => {
    if (disabled && open) {
      clearTimers();
      setOpenStable.current(false);
    }
  }, [disabled, open, clearTimers]);

  // Cleanup on unmount.
  useEffect(() => clearTimers, [clearTimers]);

  const triggerHandlers: TriggerHandlers = {
    onPointerEnter: () => scheduleOpen(openDelay),
    onPointerLeave: () => scheduleClose(closeDelay),
    onFocus: () => scheduleOpen(openDelay),
    onBlur: () => scheduleClose(0),
  };

  const surfaceHandlers: SurfaceHandlers = {
    // Cancel the in-flight close when the cursor enters the floating surface.
    onPointerEnter: () => {
      if (closeTimer.current !== null) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    },
    onPointerLeave: () => scheduleClose(closeDelay),
  };

  return {
    open,
    triggerHandlers,
    surfaceHandlers,
    closeImmediately,
  };
}
