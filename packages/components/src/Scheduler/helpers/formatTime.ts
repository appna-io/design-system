import type { SchedulerTimeFormat, SchedulerView } from '../Scheduler.types';

/**
 * Locale-aware time / date formatting helpers — all backed by `Intl`. No external library.
 *
 * The helpers cache `Intl.DateTimeFormat` instances per (locale, options) pair because
 * `new Intl.DateTimeFormat(...)` is on the order of 100µs per call and the Scheduler can
 * format hundreds of values per render.
 */

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}::${JSON.stringify(options)}`;
  let cached = formatterCache.get(key);
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, cached);
  }
  return cached;
}

/** "9:00" / "9:00 AM" / "9 AM" depending on `format` and `withMinutes`. */
export function formatTime(
  date: Date,
  locale: string,
  format: SchedulerTimeFormat,
  withMinutes = true,
): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: withMinutes ? '2-digit' : undefined,
    hour12: format === '12h',
  };
  return getFormatter(locale, options).format(date);
}

/** "Mon, Jan 5" — used by event tooltips and the agenda view. */
export function formatDayMonth(date: Date, locale: string): string {
  return getFormatter(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/** "Monday, January 5" — the toolbar centre title for day view. */
export function formatLongDayDate(date: Date, locale: string): string {
  return getFormatter(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/** "January 2026" — toolbar title for month view. */
export function formatMonthYear(date: Date, locale: string): string {
  return getFormatter(locale, { month: 'long', year: 'numeric' }).format(date);
}

/** "2026" — toolbar title for year view. */
export function formatYear(date: Date, locale: string): string {
  return getFormatter(locale, { year: 'numeric' }).format(date);
}

/** Weekday name in the requested width. */
export function formatWeekday(
  date: Date,
  locale: string,
  width: 'narrow' | 'short' | 'long' = 'short',
): string {
  return getFormatter(locale, { weekday: width }).format(date);
}

/** "5" → numeric day-of-month. Used in month cells. */
export function formatDayNumber(date: Date, locale: string): string {
  return getFormatter(locale, { day: 'numeric' }).format(date);
}

/**
 * Resolve the toolbar centre title for the given view + anchor. The Scheduler's default
 * Toolbar reads this; consumers can pass `<Scheduler.Toolbar>` and override.
 */
export interface FormatRangeTitleOptions {
  view: SchedulerView;
  anchor: Date;
  range: { start: Date; end: Date };
  locale: string;
}

export function formatRangeTitle(opts: FormatRangeTitleOptions): string {
  const { view, anchor, range, locale } = opts;
  switch (view) {
    case 'month':
      return formatMonthYear(anchor, locale);
    case 'year':
      return formatYear(anchor, locale);
    case 'day': {
      return formatLongDayDate(anchor, locale);
    }
    case 'week':
    case 'workWeek': {
      const startMonth = getFormatter(locale, { month: 'short' }).format(range.start);
      const endMonth = getFormatter(locale, { month: 'short' }).format(range.end);
      const startDay = range.start.getDate();
      const endDay = range.end.getDate();
      const year = range.end.getFullYear();
      if (range.start.getMonth() === range.end.getMonth()) {
        return `${startMonth} ${startDay} – ${endDay}, ${year}`;
      }
      return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
    }
    case 'multiDay':
    case 'agenda': {
      // Drop the weekday — it's already shown in each day-column header below — and
      // collapse same-month ranges ("May 24 – 27, 2026") so the toolbar isn't crowded.
      const startMonth = getFormatter(locale, { month: 'short' }).format(range.start);
      const endMonth = getFormatter(locale, { month: 'short' }).format(range.end);
      const startDay = range.start.getDate();
      const endDay = range.end.getDate();
      const year = range.end.getFullYear();
      if (range.start.getMonth() === range.end.getMonth()) {
        return `${startMonth} ${startDay} – ${endDay}, ${year}`;
      }
      return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
    }
    case 'resource':
      return formatLongDayDate(anchor, locale);
    default:
      return formatLongDayDate(anchor, locale);
  }
}

/** Drag-mode announcement helper — "9:00 AM to 10:30 AM". */
export function formatTimeRange(
  start: Date,
  end: Date,
  locale: string,
  format: SchedulerTimeFormat,
): string {
  return `${formatTime(start, locale, format)} – ${formatTime(end, locale, format)}`;
}