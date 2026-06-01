import type { TimelineTimestampFormat } from './Timeline.types';

export interface FormatTimestampOptions {
  value: Date | string | null | undefined;
  format?: TimelineTimestampFormat;
  locale?: string;
  /** Injectable "now" — keeps `relative` output deterministic in tests. */
  now?: Date;
}

export interface FormattedTimestamp {
  /** Display string. `null` when no timestamp should render. */
  text: string | null;
  /** ISO-8601 string for `<time dateTime={...}>` — `null` for string passthroughs. */
  isoDateTime: string | null;
}

/**
 * Pure, deterministic formatter. Strings pass through verbatim (so consumers can pre-format
 * exotic patterns like `"Yesterday"` themselves); `Date` values route through `Intl` based on
 * `format`. The `null` shortcut hides the timestamp slot entirely so the indicator + content
 * grid collapses cleanly.
 *
 * Why no `i18nLocale` fallback? Timeline takes `locale` straight from props today — there's no
 * `<I18nProvider>` yet. When the provider lands (Phase 27), the prop becomes a per-instance
 * override on top of the context locale. The change is additive; the function signature stays.
 */
export function formatTimestamp({
  value,
  format = 'relative',
  locale,
  now = new Date(),
}: FormatTimestampOptions): FormattedTimestamp {
  if (value === null || value === undefined) {
    return { text: null, isoDateTime: null };
  }

  if (typeof value === 'string') {
    return { text: value, isoDateTime: null };
  }

  // Guard against invalid Dates so we don't emit "Invalid Date" into the UI.
  if (Number.isNaN(value.getTime())) {
    return { text: null, isoDateTime: null };
  }

  const isoDateTime = value.toISOString();

  if (typeof format === 'function') {
    return { text: format(value), isoDateTime };
  }

  if (format === 'relative') {
    return { text: relative(value, now, locale), isoDateTime };
  }

  // Absolute — locale-aware short date+time. `2-digit` minute keeps the colon padded.
  const text = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);

  return { text, isoDateTime };
}

/**
 * Largest-unit relative-time formatter. `Intl.RelativeTimeFormat` already speaks every locale
 * we ship — English: "3 days ago"; German: "vor 3 Tagen"; Hebrew: "לפני 3 ימים".
 *
 * We pick the biggest unit whose magnitude is ≥ 1 so "30 seconds" doesn't accidentally read as
 * "0 minutes ago". The `numeric: 'auto'` option lets the formatter say "yesterday" instead of
 * "1 day ago" when the locale supports it.
 */
function relative(value: Date, now: Date, locale?: string): string {
  const diffSeconds = (value.getTime() - now.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const units: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }

  return rtf.format(0, 'second');
}