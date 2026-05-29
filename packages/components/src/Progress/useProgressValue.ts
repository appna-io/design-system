/**
 * Tiny pure helper shared by `<Progress />` and `<CircularProgress />`. Clamps the consumer's
 * `value` into `[min, max]` and returns the percentage along with the clamped value so the two
 * components don't re-derive the math separately.
 *
 * **Not** a React hook — no state, no effects. Named `useProgressValue` purely for symmetry with
 * the surrounding component layer; keeping it as a plain function avoids paying React's hook
 * dispatcher cost on every value update (and lets it be called from the recipe sketches in
 * stories without a render context).
 *
 * Stays Progress-local — no engine promotion until a third consumer needs the same math.
 */
export interface UseProgressValueOptions {
  value?: number | undefined;
  min?: number | undefined;
  max?: number | undefined;
  indeterminate?: boolean | undefined;
}

export interface UseProgressValueReturn {
  /** Value clamped into `[min, max]` (or `min` when `indeterminate` is true). */
  clampedValue: number;
  /** Percentage 0–100. `0` when `indeterminate` (the keyframe owns the painted position). */
  percent: number;
}

export function useProgressValue(opts: UseProgressValueOptions): UseProgressValueReturn {
  const { value = 0, min = 0, max = 100, indeterminate } = opts;
  if (indeterminate) return { clampedValue: min, percent: 0 };
  // `range` cannot be 0 — that would divide-by-zero into NaN. We treat a degenerate `min === max`
  // as a single-point range so `value === max` shows 100%.
  const range = Math.max(max - min, Number.EPSILON);
  const clamped = Math.min(Math.max(value, min), max);
  const percent = ((clamped - min) / range) * 100;
  return { clampedValue: clamped, percent };
}
