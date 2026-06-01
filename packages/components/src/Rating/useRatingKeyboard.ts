'use client';

import { useCallback, type KeyboardEvent } from 'react';

import type { RatingChangeHandler } from './Rating.types';

export interface UseRatingKeyboardArgs {
  value: number;
  max: number;
  precision: 1 | 0.5;
  allowClear: boolean;
  dir: 'ltr' | 'rtl';
  disabled: boolean;
  readOnly: boolean;
  onChange: RatingChangeHandler;
}

/**
 * W3C Slider keyboard pattern mapped to rating semantics. Returns a stable `KeyboardEventHandler`
 * suitable for attaching to the root `role="slider"` element.
 *
 * | Key                | Action                                                                  |
 * | ------------------ | ----------------------------------------------------------------------- |
 * | `ArrowRight`       | LTR: +precision step · RTL: −precision step                              |
 * | `ArrowLeft`        | LTR: −precision step · RTL: +precision step                              |
 * | `ArrowUp`          | +precision step (direction-agnostic)                                     |
 * | `ArrowDown`        | −precision step                                                          |
 * | `Home`             | 0 when `allowClear`, otherwise the smallest selectable value (precision) |
 * | `End`              | `max`                                                                    |
 * | `PageUp`           | +1 whole star (regardless of precision)                                 |
 * | `PageDown`         | −1 whole star                                                            |
 * | digit `0`..`9`     | Jump to the digit when within `[allowClear ? 0 : precision, max]`        |
 *
 * Every committed change fires `onChange(next, { source: 'keyboard' })` — or, when Home clears
 * to 0 with `allowClear=true`, `onChange(0, { source: 'clear' })`.
 */
export function useRatingKeyboard(args: UseRatingKeyboardArgs) {
  const { value, max, precision, allowClear, dir, disabled, readOnly, onChange } = args;

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (disabled || readOnly) return;
      const min = allowClear ? 0 : precision;

      const commit = (next: number, source: 'keyboard' | 'clear' = 'keyboard') => {
        const clamped = clamp(next, 0, max);
        // Step quantisation: lock to the precision grid so arrow-stepping past a half doesn't
        // accidentally produce 0.4999 from float math.
        const stepped = snapToStep(clamped, precision);
        if (stepped === value) return;
        event.preventDefault();
        onChange(stepped, { source });
      };

      switch (event.key) {
        case 'ArrowRight':
          commit(value + (dir === 'rtl' ? -precision : precision));
          return;
        case 'ArrowLeft':
          commit(value + (dir === 'rtl' ? precision : -precision));
          return;
        case 'ArrowUp':
          commit(value + precision);
          return;
        case 'ArrowDown':
          commit(value - precision);
          return;
        case 'Home':
          commit(allowClear ? 0 : min, allowClear ? 'clear' : 'keyboard');
          return;
        case 'End':
          commit(max);
          return;
        case 'PageUp':
          commit(value + 1);
          return;
        case 'PageDown':
          commit(value - 1);
          return;
        default: {
          // Digit shortcut. `0` only fires when `allowClear` is on.
          if (event.key.length === 1 && event.key >= '0' && event.key <= '9') {
            const digit = Number(event.key);
            if (digit === 0 && !allowClear) return;
            if (digit > max) return;
            commit(digit, digit === 0 ? 'clear' : 'keyboard');
          }
        }
      }
    },
    [value, max, precision, allowClear, dir, disabled, readOnly, onChange],
  );
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function snapToStep(n: number, step: 1 | 0.5): number {
  if (step === 1) return Math.round(n);
  // Lock to half-step grid; rounding factor of 2 keeps float drift at bay.
  return Math.round(n * 2) / 2;
}