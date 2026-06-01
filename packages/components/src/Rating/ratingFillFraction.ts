/**
 * How filled is star `starIndex` (0-based) under the given `value`?
 *
 * Returns a number in `[0, 1]` representing the fraction of the star that should be painted in
 * the filled color. Pure O(1) — the only piece of `<Rating>` that needs to know this math.
 *
 * @example
 *   ratingFillFraction(3.5, 0)  // 1   (star #1 is fully filled)
 *   ratingFillFraction(3.5, 2)  // 1   (star #3 is fully filled)
 *   ratingFillFraction(3.5, 3)  // 0.5 (star #4 is half filled)
 *   ratingFillFraction(3.5, 4)  // 0   (star #5 is empty)
 *   ratingFillFraction(3.71, 3) // 0.71 (star #4 is 71% filled — `precision="exact"`)
 */
export function ratingFillFraction(value: number, starIndex: number): number {
  if (!Number.isFinite(value)) return 0;
  const delta = value - starIndex;
  if (delta <= 0) return 0;
  if (delta >= 1) return 1;
  return delta;
}