import { clampToStep } from './clampValue';

/**
 * Pure pointer-to-value conversion. **No DOM access, no React.** The caller (the interaction
 * hook) reads the track's `getBoundingClientRect()` once per pointerdown and passes it in here
 * for every subsequent pointermove — avoiding a layout-thrashing rect read per move event.
 *
 * Coordinate system mapping:
 *
 *   horizontal LTR : x grows left-to-right, min on the left.        frac = (x - left) / width
 *   horizontal RTL : x grows left-to-right, min on the right.       frac = 1 - (x - left) / width
 *   vertical       : y grows top-to-bottom, max on the top.         frac = 1 - (y - top) / height
 *
 * (Vertical orientation is direction-agnostic: top is always max in both LTR and RTL. RTL only
 * affects horizontal orientation. This matches W3C ARIA Slider conventions.)
 *
 * The returned value is already step-snapped via `clampToStep` so consumers receive a final
 * value, not a raw fractional intermediate.
 */
export interface ComputeValueFromPointerOptions {
  /** `event.clientX` from the pointer event. */
  clientX: number;
  /** `event.clientY` from the pointer event. */
  clientY: number;
  /** The track element's bounding rect, captured at drag start. */
  trackRect: { left: number; top: number; width: number; height: number };
  /** Slider scale lower bound. */
  min: number;
  /** Slider scale upper bound. */
  max: number;
  /** Discrete step (or `null` for continuous). */
  step: number | null | undefined;
  /** `'horizontal'` or `'vertical'`. */
  orientation: 'horizontal' | 'vertical';
  /** `'ltr'` or `'rtl'`. Only consulted in horizontal orientation. */
  dir: 'ltr' | 'rtl';
}

export function computeValueFromPointer(opts: ComputeValueFromPointerOptions): number {
  const { clientX, clientY, trackRect, min, max, step, orientation, dir } = opts;

  let frac: number;
  if (orientation === 'horizontal') {
    const width = trackRect.width || 1;
    const raw = (clientX - trackRect.left) / width;
    frac = dir === 'rtl' ? 1 - raw : raw;
  } else {
    const height = trackRect.height || 1;
    const raw = (clientY - trackRect.top) / height;
    frac = 1 - raw;
  }
  frac = Math.min(Math.max(frac, 0), 1);

  const value = min + frac * (max - min);
  return clampToStep(value, min, max, step);
}

/**
 * Forward: convert a slider value to a percentage along the track (0 → 100). Used for the
 * thumb's `inset-inline-start` / `bottom` positioning and the fill's `width` / `height`.
 *
 * In RTL horizontal mode the percentage **stays the same** at this layer — the recipe paints
 * the thumb with logical `start-` / `inset-inline-start` so the browser flips visually. Vertical
 * orientation always uses `bottom` (max-at-top), which is direction-agnostic.
 *
 * This is the inverse of `computeValueFromPointer` and lives here so both directions of the
 * mapping share the same `min/max → [0,1]` formula and can't drift out of sync.
 */
export function valueToPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  const clamped = Math.min(Math.max(value, min), max);
  return ((clamped - min) / (max - min)) * 100;
}
