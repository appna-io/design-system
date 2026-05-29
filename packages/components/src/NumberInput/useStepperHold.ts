'use client';

import { useCallback, useEffect, useRef } from 'react';

export interface UseStepperHoldOptions {
  /** Initial delay before the repeat starts (ms). @default 350 */
  initialDelayMs?: number;
  /** Repeat interval at the start of the hold (ms). @default 120 */
  initialIntervalMs?: number;
  /** Floor interval the ramp converges to (ms). @default 40 */
  minIntervalMs?: number;
  /** Multiplier applied to the interval on every tick. < 1 accelerates. @default 0.85 */
  accelerationFactor?: number;
}

export interface UseStepperHoldReturn {
  /** Fire on `pointerdown` — performs an immediate step + arms the accelerating timer. */
  onPointerDown: (event: { preventDefault?: () => void; pointerId?: number; currentTarget?: { setPointerCapture?: (id: number) => void } }) => void;
  /** Fire on `pointerup` / `pointercancel` / `pointerleave` — cancels any pending repeat. */
  onPointerUp: () => void;
}

/**
 * Mouse / touch / pen "press and hold to step" behavior with an **accelerating** repeat rate.
 * Same UX shape as the OS-level scroll arrows: one tick immediately, a pause, then ticks that
 * speed up the longer the user holds.
 *
 * Generic over the "step" action — the caller passes a `step()` callback (typically a `+= value`
 * or `-= value`) and the hook handles the timing. That keeps the hook reusable for any future
 * primitive whose increment isn't a simple number (range slider, ratings, quantity stepper).
 *
 * Cleans itself up on unmount + on pointer release. Honors a `disabled` flag because the consuming
 * stepper button may flip state mid-hold (e.g. value reaches `max`).
 */
export function useStepperHold(
  step: () => void,
  disabled: boolean,
  options: UseStepperHoldOptions = {},
): UseStepperHoldReturn {
  const {
    initialDelayMs = 350,
    initialIntervalMs = 120,
    minIntervalMs = 40,
    accelerationFactor = 0.85,
  } = options;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<number>(initialIntervalMs);
  // Keep the latest `step` in a ref so the timer always calls the freshest callback (avoids the
  // classic "captures stale state in a setTimeout" trap).
  const stepRef = useRef(step);
  stepRef.current = step;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (disabledRef.current) {
      clearTimer();
      return;
    }
    stepRef.current();
    // Ramp the next interval *after* the step so the first repeat fires at `initialIntervalMs`.
    intervalRef.current = Math.max(
      minIntervalMs,
      intervalRef.current * accelerationFactor,
    );
    timerRef.current = setTimeout(tick, intervalRef.current);
  }, [accelerationFactor, clearTimer, minIntervalMs]);

  const onPointerDown: UseStepperHoldReturn['onPointerDown'] = useCallback(
    (event) => {
      if (disabledRef.current) return;
      event.preventDefault?.();
      // Capture the pointer so we keep getting `pointerup` even if the user drifts off the
      // button while holding — matches what native scrollbar / spinbutton arrows do.
      try {
        if (typeof event.pointerId === 'number') {
          event.currentTarget?.setPointerCapture?.(event.pointerId);
        }
      } catch {
        // setPointerCapture can throw in some JSDOM setups; not fatal.
      }
      stepRef.current();
      intervalRef.current = initialIntervalMs;
      clearTimer();
      timerRef.current = setTimeout(tick, initialDelayMs);
    },
    [clearTimer, initialDelayMs, initialIntervalMs, tick],
  );

  const onPointerUp = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return { onPointerDown, onPointerUp };
}
