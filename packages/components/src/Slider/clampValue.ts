/**
 * Pure clamp + step-snapping helpers. **No React, no DOM.** All Slider state mutations route
 * through here so the math is unit-testable in isolation (`Slider.interaction.test.ts`).
 *
 * Two helpers:
 *  - `clampToStep`  — single-value snap-to-step within `[min, max]`.
 *  - `clampThumb`   — N-thumb constraint solver (preserves ordering + `minStepsBetweenThumbs`).
 *
 * Both are deliberately allocation-light: `clampThumb` returns a fresh array only when the new
 * thumb value actually differs from the old one. Drag handlers compare reference equality to
 * skip redundant React commits.
 */

/**
 * Snap `value` to the nearest multiple of `step` within `[min, max]`. Continuous mode
 * (`step === null`) disables snapping and just clamps to the range.
 *
 * Step alignment is anchored at `min` (not at 0), so a slider with `min=3, step=0.5` snaps to
 * `3, 3.5, 4, 4.5, …` rather than `0, 0.5, 1, …`. This matches W3C `<input type="range">`.
 */
export function clampToStep(
  value: number,
  min: number,
  max: number,
  step: number | null | undefined,
): number {
  if (Number.isNaN(value)) return min;
  const clamped = Math.min(Math.max(value, min), max);
  if (step == null) return clamped;
  if (step <= 0) return clamped;
  const stepped = Math.round((clamped - min) / step) * step + min;
  // Snap-then-re-clamp because rounding can push the value one step outside `[min, max]` when
  // the range is not an integer multiple of step (e.g. min=0, max=10, step=3).
  const reClamped = Math.min(Math.max(stepped, min), max);
  // Trim float drift introduced by repeated `+ step` arithmetic (0.1 + 0.2 = 0.30000000000000004).
  // The precision target is the step's decimal length plus one safety digit.
  return roundToStepPrecision(reClamped, step);
}

/**
 * Update one thumb in a sorted N-thumb array, respecting:
 *
 *   1. The active thumb cannot cross its neighbors (it can only push up to `prev + minGap` or
 *      down to `next - minGap`).
 *   2. The active thumb is then step-snapped within that local sub-range.
 *
 * Returns the **same array reference** when the snap is a no-op, so React state setters short-
 * circuit cleanly and `onChange` doesn't fire on every redundant pointermove event.
 *
 * `minStepsBetweenThumbs` is interpreted in step units when `step != null` and ignored otherwise
 * (continuous sliders allow overlap; that's the contract spelled out in `Slider.types.ts`).
 */
export function clampThumb(
  values: readonly number[],
  thumbIndex: number,
  nextValue: number,
  min: number,
  max: number,
  step: number | null | undefined,
  minStepsBetweenThumbs: number,
): number[] {
  const stepSize = step ?? 0;
  const minGap = step != null && stepSize > 0 ? stepSize * Math.max(0, minStepsBetweenThumbs) : 0;

  const lowerBound = thumbIndex > 0 ? values[thumbIndex - 1]! + minGap : min;
  const upperBound =
    thumbIndex < values.length - 1 ? values[thumbIndex + 1]! - minGap : max;

  const snapped = clampToStep(nextValue, lowerBound, upperBound, step);
  if (snapped === values[thumbIndex]) {
    return values as number[];
  }
  const next = values.slice();
  next[thumbIndex] = snapped;
  return next;
}

/**
 * Find the thumb closest to a candidate value. Used by the track-click handler to decide which
 * thumb jumps when the consumer clicks an empty stretch of the track.
 *
 * Tie-breaks by **lowest index** to make the behavior deterministic when two thumbs are equally
 * far (e.g. range mode at midpoint click; the left thumb wins).
 */
export function nearestThumbIndex(values: readonly number[], target: number): number {
  let best = 0;
  let bestDist = Math.abs(values[0]! - target);
  for (let i = 1; i < values.length; i++) {
    const d = Math.abs(values[i]! - target);
    if (d < bestDist) {
      best = i;
      bestDist = d;
    }
  }
  return best;
}

/**
 * Round `value` to the same decimal precision as `step` (plus one safety digit). Eliminates
 * float drift like `0.1 + 0.2 = 0.30000000000000004` that's visible in the value-label bubble.
 *
 * Integer step → integer result. Step of `0.5` → 1 decimal. Step of `0.05` → 2 decimals.
 */
function roundToStepPrecision(value: number, step: number): number {
  if (Number.isInteger(step)) return Math.round(value);
  const stepStr = String(step);
  const dotIdx = stepStr.indexOf('.');
  const decimals = dotIdx === -1 ? 0 : stepStr.length - dotIdx - 1;
  const factor = 10 ** Math.min(decimals + 1, 12);
  return Math.round(value * factor) / factor;
}
