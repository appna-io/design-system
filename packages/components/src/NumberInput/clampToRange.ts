/**
 * Snap `value` into `[min, max]`. Either bound can be omitted.
 *
 * Implemented as pure math so it is trivial to unit-test without a DOM and so it can be reused
 * by future numeric primitives (Slider, NumberRangeInput) without re-instantiating any state.
 */
export function clampToRange(value: number, min?: number, max?: number): number {
  let next = value;
  if (typeof min === 'number' && next < min) next = min;
  if (typeof max === 'number' && next > max) next = max;
  return next;
}

/**
 * Round a `value` to `precision` decimal places. Skip rounding when `precision` is undefined or
 * negative — keeps the consumer's untouched number flowing through (important for integer-only
 * flows where rounding would otherwise mask off-by-one bugs upstream).
 */
export function roundToPrecision(value: number, precision: number | undefined): number {
  if (precision === undefined || precision < 0 || !Number.isFinite(value)) return value;
  // Multiplier round-trip — accurate enough for the precisions a UI ever needs (≤ ~15 digits).
  // Avoids `toFixed` which returns a string and re-introduces locale concerns.
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}