/**
 * Thin `Intl.NumberFormat` wrapper with a per-`(locale, options)` cache. Instantiating an
 * `Intl.NumberFormat` is one of the more expensive things you can do on a hot keystroke path
 * (~30µs+ per call on a typical machine), and a NumberInput formats on every committed change
 * — so the cache pays for itself the moment a user types a second character.
 */

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, options: Intl.NumberFormatOptions | undefined): Intl.NumberFormat {
  // Stable cache key. `JSON.stringify` is fine here — `Intl.NumberFormatOptions` is a flat record
  // of primitives, and the small allocation cost is dwarfed by the cost of instantiating the
  // formatter itself.
  const key = `${locale}|${options ? JSON.stringify(options) : ''}`;
  let formatter = formatterCache.get(key);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

/**
 * Format `value` per the given `locale` + `options`. Returns the empty string for `null` so the
 * input's `value` prop can pass through directly (`<input value={...} />` requires a string).
 */
export function formatNumber(
  value: number | null,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  if (value === null || !Number.isFinite(value)) return '';
  return getFormatter(locale, options).format(value);
}

/**
 * Drop the formatter cache. Exposed for tests so they can isolate the cache between runs;
 * production code doesn't need it.
 */
export function __resetFormatterCache(): void {
  formatterCache.clear();
}