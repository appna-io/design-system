export interface RatingPointerArgs {
  /** `event.clientX` of the pointer / click event. */
  pointerX: number;
  /** Bounding rect of the rating track. Only `left` + `width` matter. */
  rect: { left: number; width: number };
  /** Number of stars in the scale. */
  max: number;
  /** Selection granularity. `'exact'` is read-only and never reaches this helper. */
  precision: 1 | 0.5;
  /** Document / element text direction. */
  dir: 'ltr' | 'rtl';
}

/**
 * Translate a pointer x-coordinate into a rating value, honoring direction and precision.
 *
 * - In LTR, x grows left → right; the leftmost half-star is 0.5 (or 1 at whole-step precision),
 *   the rightmost edge is `max`.
 * - In RTL, the geometry mirrors: pointer near the rect's right edge = 0.5 / 1, near the left
 *   edge = `max`.
 * - Half-step precision rounds to the nearest 0.5 (with a floor of 0.5 so a click always
 *   registers — clearing happens via the `allowClear` "click-same-value" path or via the
 *   keyboard Home key, never via geometry).
 * - Whole-step precision uses `Math.ceil` so any pixel of star N maps to value N.
 *
 * Pure. Unit-tested across LTR / RTL × precisions × clamp boundaries.
 */
export function ratingValueFromPointer(args: RatingPointerArgs): number {
  const { pointerX, rect, max, precision, dir } = args;
  if (rect.width <= 0) return precision === 0.5 ? 0.5 : 1;

  const offset =
    dir === 'rtl' ? rect.left + rect.width - pointerX : pointerX - rect.left;
  const ratio = Math.min(Math.max(offset / rect.width, 0), 1);
  const raw = ratio * max;

  if (precision === 0.5) {
    return Math.min(max, Math.max(0.5, Math.round(raw * 2) / 2));
  }
  return Math.min(max, Math.max(1, Math.ceil(raw)));
}
