import type { I18nFormatters, LocaleTag } from './types';

/**
 * Coerce `Date | number | string` into a `Date` for `Intl.DateTimeFormat.format`. The native
 * APIs accept all three, but their auto-coercion treats numeric strings inconsistently
 * across runtimes; centralizing the coercion here removes that surprise.
 */
function toDate(value: Date | number | string): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  return new Date(value);
}

/**
 * Construct the `I18nFormatters` bag for a locale. Each formatter is lazy in that the
 * underlying `Intl.NumberFormat` / `Intl.DateTimeFormat` etc. is constructed *inside* the
 * call; this trades a few-microseconds-per-call against an N-ms construction cost the
 * consumer would otherwise pay upfront for formatters they may never reach.
 *
 * To reuse formatters at the call site (e.g. a Table column renderer that formats every
 * row), the caller should hoist the `Intl.*` instance into a `useMemo` keyed by the locale
 * — the provider hands out a shared `formatters` object across consumers of `useI18n()`
 * already, so all callers in the same provider share the same `Intl.Collator` instance.
 *
 * The `overrides` parameter lets a `<I18nProvider>` substitute a custom formatter (e.g. a
 * test fake or a consumer-supplied currency formatter that adds a non-standard separator).
 * Anything not in `overrides` falls back to the locale-driven `Intl.*` implementation.
 */
export function buildFormatters(
  locale: LocaleTag,
  overrides?: Partial<I18nFormatters>,
): I18nFormatters {
  // `Intl.Collator` is intentionally constructed once per locale and shared — `localeCompare`
  // hot paths (DataGrid sort) read it directly.
  const collator = overrides?.collator ?? new Intl.Collator(locale);

  const number: I18nFormatters['number'] =
    overrides?.number ??
    ((value, opts) => new Intl.NumberFormat(locale, opts).format(value));

  const currency: I18nFormatters['currency'] =
    overrides?.currency ??
    ((value, currencyCode, opts) =>
      new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, ...opts }).format(
        value,
      ));

  const percent: I18nFormatters['percent'] =
    overrides?.percent ??
    ((value, opts) =>
      new Intl.NumberFormat(locale, { style: 'percent', ...opts }).format(value));

  const date: I18nFormatters['date'] =
    overrides?.date ??
    ((value, opts) =>
      new Intl.DateTimeFormat(locale, { dateStyle: 'medium', ...opts }).format(toDate(value)));

  const time: I18nFormatters['time'] =
    overrides?.time ??
    ((value, opts) =>
      new Intl.DateTimeFormat(locale, { timeStyle: 'short', ...opts }).format(toDate(value)));

  const dateTime: I18nFormatters['dateTime'] =
    overrides?.dateTime ??
    ((value, opts) =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...opts,
      }).format(toDate(value)));

  const relativeTime: I18nFormatters['relativeTime'] =
    overrides?.relativeTime ??
    ((value, unit, opts) =>
      new Intl.RelativeTimeFormat(locale, { numeric: 'auto', ...opts }).format(value, unit));

  const list: I18nFormatters['list'] =
    overrides?.list ??
    ((items, opts) => new Intl.ListFormat(locale, opts).format(items));

  const plural: I18nFormatters['plural'] =
    overrides?.plural ?? ((value, opts) => new Intl.PluralRules(locale, opts).select(value));

  return {
    number,
    currency,
    percent,
    date,
    time,
    dateTime,
    relativeTime,
    list,
    collator,
    plural,
  };
}
