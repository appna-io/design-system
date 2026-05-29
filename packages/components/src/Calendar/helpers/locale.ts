/**
 * Locale-driven helpers for `<Calendar>`. All output is generated via the platform `Intl` API
 * — we don't ship locale data ourselves.
 *
 * `getFirstDayOfWeek` prefers `Intl.Locale.prototype.getWeekInfo()` (Chrome 130+, Safari 16.4+,
 * Firefox 138+). For older runtimes we fall back to a small static table covering ~14
 * locale-region clusters; everything else defaults to Monday (the global ISO 8601 default).
 */

/** 0 = Sunday … 6 = Saturday. Matches `Date.prototype.getDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Resolve the first day of the week for `locale`. Uses native `Intl.Locale.weekInfo` when
 * available; otherwise consults the fallback table; otherwise defaults to Monday.
 */
export function getFirstDayOfWeek(locale: string): Weekday {
  try {
    const lc = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const info = lc.getWeekInfo?.() ?? lc.weekInfo;
    if (info && typeof info.firstDay === 'number') {
      // `Intl` uses 1=Mon … 7=Sun. Translate to JS `getDay()` (0=Sun … 6=Sat).
      return (info.firstDay % 7) as Weekday;
    }
  } catch {
    /* fall through */
  }
  return fallbackFirstDayOfWeek(locale);
}

/** Tiny hand-curated fallback. Only covers regions the DS officially exercises in tests. */
function fallbackFirstDayOfWeek(locale: string): Weekday {
  const region = (locale.split(/[-_]/)[1] ?? '').toUpperCase();
  switch (region) {
    case 'US':
    case 'CA':
    case 'JP':
    case 'IL':
    case 'BR':
    case 'MX':
    case 'AU':
    case 'PH':
    case 'TH':
      return 0; // Sunday
    case 'AE':
    case 'EG':
    case 'SA':
    case 'QA':
      return 6; // Saturday
    default:
      return 1; // Monday — ISO 8601 default for most of Europe + Asia
  }
}

/**
 * Build the 7-entry weekday-name array, rotated so index 0 is the active `weekStartsOn`.
 * Three forms are returned per weekday (short/long/narrow) so consumers pick whichever fits
 * the available space.
 *
 * The reference date is January 7 2024 (a Sunday) — any Sunday in modern history works; we
 * pick one that's easy to read in the source.
 */
export function getWeekdayNames(
  locale: string,
  weekStartsOn: Weekday,
): ReadonlyArray<{ short: string; long: string; narrow: string; weekday: Weekday }> {
  const fmtShort = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const fmtLong = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  const fmtNarrow = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  const ref = new Date(2024, 0, 7); // Sunday
  const out: { short: string; long: string; narrow: string; weekday: Weekday }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ref);
    d.setDate(ref.getDate() + ((i + weekStartsOn) % 7));
    out.push({
      short: fmtShort.format(d),
      long: fmtLong.format(d),
      narrow: fmtNarrow.format(d),
      weekday: ((i + weekStartsOn) % 7) as Weekday,
    });
  }
  return out;
}

/** Localised month name. Used by the header title and the year-jump menu. */
export function getMonthName(date: Date, locale: string, length: 'short' | 'long' = 'long'): string {
  return new Intl.DateTimeFormat(locale, { month: length }).format(date);
}

/** Localised `MMMM yyyy` (e.g. "May 2026"). */
export function getMonthYearTitle(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

/** Long-form day label used for screen-reader `aria-label`. */
export function getLongDayLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
