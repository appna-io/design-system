import type { Direction } from '../direction';
import type { LocaleTag } from './types';

/**
 * BCP 47 primary language subtags that read right-to-left. Covers Hebrew (`he` + the
 * deprecated `iw` alias), Arabic (`ar`), Persian/Farsi (`fa`), Urdu (`ur`), Pashto (`ps`),
 * Divehi (`dv`), Kurdish (`ku`), Sindhi (`sd`), and Yiddish (`yi`).
 *
 * Exported as a `Set` for O(1) lookup; deliberately not exported as a type so consumers
 * can pass any string into `inferDirection` without an `as` cast.
 */
const RTL_PRIMARY_SUBTAGS: ReadonlySet<string> = new Set([
  'ar',
  'dv',
  'fa',
  'he',
  'iw',
  'ku',
  'ps',
  'sd',
  'ur',
  'yi',
]);

/**
 * Derive a reading direction from a locale tag.
 *
 * Splits on `-` and inspects the primary language subtag (so `he-IL`, `ar-EG`, `fa-AF`
 * all return `'rtl'`). Returns `'ltr'` for unrecognized or malformed input — never throws.
 */
export function inferDirection(locale: LocaleTag): Direction {
  if (!locale) return 'ltr';
  const primary = locale.toLowerCase().split('-')[0] ?? '';
  return RTL_PRIMARY_SUBTAGS.has(primary) ? 'rtl' : 'ltr';
}