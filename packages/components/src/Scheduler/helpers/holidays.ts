import type { Holiday } from '../Scheduler.types';

import { toDayKey } from './dateMath';

/**
 * Built-in holiday set. Deliberately small — covers the most-used regions Google Calendar
 * shows by default. Consumers needing more accuracy should pass `holidays` or
 * `holidaysProvider` explicitly. The data is regenerated locally at runtime (no network).
 *
 * Algorithm: each entry is a `(month, day, region, name)` tuple, expanded for the
 * requested year. Easter-derived holidays use the Anonymous Gregorian algorithm.
 */

interface FixedHolidayEntry {
  month: number;
  day: number;
  region: string;
  name: string;
  type: Holiday['type'];
}

const FIXED_HOLIDAYS: FixedHolidayEntry[] = [
  // International
  { month: 1, day: 1, region: 'INT', name: 'New Year’s Day', type: 'public' },
  { month: 12, day: 25, region: 'INT', name: 'Christmas Day', type: 'religious' },
  { month: 12, day: 26, region: 'INT', name: 'Boxing Day', type: 'public' },
  // US
  { month: 7, day: 4, region: 'US', name: 'Independence Day', type: 'public' },
  { month: 11, day: 11, region: 'US', name: 'Veterans Day', type: 'public' },
  { month: 12, day: 24, region: 'US', name: 'Christmas Eve', type: 'observance' },
  { month: 12, day: 31, region: 'US', name: 'New Year’s Eve', type: 'observance' },
  // UK
  { month: 5, day: 1, region: 'UK', name: 'Early May bank holiday', type: 'public' },
  // IL — Israeli civic
  { month: 5, day: 1, region: 'IL', name: 'Labor Day', type: 'public' },
  // SA — Saudi National Day
  { month: 9, day: 23, region: 'SA', name: 'Saudi National Day', type: 'public' },
  // FR — Bastille Day
  { month: 7, day: 14, region: 'FR', name: 'Bastille Day', type: 'public' },
  // DE — German Unity Day
  { month: 10, day: 3, region: 'DE', name: 'Tag der Deutschen Einheit', type: 'public' },
  // ES — Constitution Day
  { month: 12, day: 6, region: 'ES', name: 'Día de la Constitución', type: 'public' },
  // IT — Republic Day
  { month: 6, day: 2, region: 'IT', name: 'Festa della Repubblica', type: 'public' },
  // JP — Constitution Memorial Day
  { month: 5, day: 3, region: 'JP', name: '憲法記念日', type: 'public' },
  // CN — Spring Festival placeholder (lunar — we ship a fixed Jan-1 placeholder; consumers
  // should pass `holidays` explicitly for lunar accuracy)
  { month: 10, day: 1, region: 'CN', name: 'National Day', type: 'public' },
  // IN — Republic Day
  { month: 1, day: 26, region: 'IN', name: 'Republic Day', type: 'public' },
  { month: 8, day: 15, region: 'IN', name: 'Independence Day', type: 'public' },
  // BR — Independence Day
  { month: 9, day: 7, region: 'BR', name: 'Independência do Brasil', type: 'public' },
  // CA — Canada Day
  { month: 7, day: 1, region: 'CA', name: 'Canada Day', type: 'public' },
  // AU — Australia Day
  { month: 1, day: 26, region: 'AU', name: 'Australia Day', type: 'public' },
];

/**
 * Generate a default holiday set for `year`, filtered to `regions` (defaulting to `['INT']`).
 *
 * Locale shortcut: `localeToRegions('en-US')` returns `['INT', 'US']` so passing `locale`
 * to `getBuiltInHolidays('2026', { locale: 'en-US' })` Does The Right Thing for the most
 * common locales without forcing the consumer to learn the region codes.
 */
export interface GetBuiltInHolidaysOptions {
  regions?: string[];
  locale?: string;
}

export function getBuiltInHolidays(
  year: number,
  opts: GetBuiltInHolidaysOptions = {},
): Holiday[] {
  const regions = opts.regions ?? (opts.locale ? localeToRegions(opts.locale) : ['INT']);
  const out: Holiday[] = [];
  for (const entry of FIXED_HOLIDAYS) {
    if (!regions.includes(entry.region)) continue;
    const date = new Date(year, entry.month - 1, entry.day, 0, 0, 0, 0);
    out.push({
      id: `${entry.region}-${year}-${entry.month}-${entry.day}`,
      date: toDayKey(date),
      name: entry.name,
      region: entry.region,
      type: entry.type ?? 'public',
    });
  }
  // Easter-derived (US: Good Friday observance; INT: Easter Sunday)
  const easter = computeEasterDate(year);
  if (regions.includes('INT')) {
    out.push({
      id: `INT-${year}-easter`,
      date: toDayKey(easter),
      name: 'Easter Sunday',
      region: 'INT',
      type: 'religious',
    });
  }
  // US observed shift: Independence Day on a Sat → observe Fri; on a Sun → observe Mon.
  // We omit the shift in V1; consumers needing it pass `holidays` explicitly.
  return out;
}

/** Map a BCP-47 locale tag to the built-in region set. */
export function localeToRegions(locale: string): string[] {
  const region = locale.split('-')[1]?.toUpperCase();
  if (!region) return ['INT'];
  if (FIXED_HOLIDAYS.some((h) => h.region === region)) return ['INT', region];
  return ['INT'];
}

/**
 * Bin holidays by their day-key for O(1) lookup at render time. Multi-day holidays expand
 * into one entry per day (via `endDate`).
 */
export function indexHolidaysByDay(
  holidays: readonly Holiday[],
): Map<string, Holiday[]> {
  const out = new Map<string, Holiday[]>();
  for (const h of holidays) {
    const dates: string[] = [h.date];
    if (h.endDate && h.endDate > h.date) {
      const start = new Date(`${h.date}T00:00:00`);
      const end = new Date(`${h.endDate}T00:00:00`);
      let cur = new Date(start);
      // hard cap at ~40 days for sanity
      let safety = 40;
      while (cur.getTime() < end.getTime() && safety-- > 0) {
        cur = new Date(cur.getTime() + 86_400_000);
        dates.push(toDayKey(cur));
      }
    }
    for (const key of dates) {
      const bucket = out.get(key);
      if (bucket) bucket.push(h);
      else out.set(key, [h]);
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*  internals                                                                  */
/* -------------------------------------------------------------------------- */

/** Anonymous Gregorian algorithm — Easter Sunday for a given year. */
function computeEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}