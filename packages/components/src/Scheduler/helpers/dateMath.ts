/**
 * Local, dependency-free date math.
 *
 * Phase 33's `dateMath.ts` is the canonical home for these helpers, but Phase 33 has not
 * shipped yet. We ship a focused subset here (everything the Scheduler needs) and annotate
 * each export so the eventual Phase 33 promotion is a mechanical move (delete the body,
 * re-export from `@apx-ui/components/Calendar`).
 *
 * Conventions:
 * - Everything operates on the local timezone (DST-aware via the JS `Date` arithmetic).
 *   Multi-timezone rendering is explicitly out of scope for V1 of the Scheduler.
 * - "Day key" is the ISO `YYYY-MM-DD` string of `start` rendered in the local timezone.
 *   This is the stable key used for `Map<dayKey, ...>` indexing across the view.
 * - All helpers are pure. None mutate their inputs.
 */

export const MS_PER_MINUTE = 60_000;
export const MS_PER_HOUR = 3_600_000;
export const MS_PER_DAY = 86_400_000;
export const MINUTES_PER_DAY = 1_440;
export const MINUTES_PER_HOUR = 60;

/** Pad a 1-2-digit number with a leading zero. */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Inclusive local-time day key in ISO `YYYY-MM-DD`. Stable across DST boundaries. */
export function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Parse an ISO `YYYY-MM-DD` day key back into a local-midnight `Date`. */
export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

/** A new `Date` clamped to local midnight at the start of the day `date` falls into. */
export function startOfDay(date: Date): Date {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
}

/** A new `Date` clamped to the last millisecond before the next local midnight. */
export function endOfDay(date: Date): Date {
  const d = new Date(date.getTime());
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Add (or subtract, if negative) whole days. DST-safe — uses `setDate`, not ms math. */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

/** Add (or subtract) whole minutes. ms math — fast, DST-safe at this granularity. */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MS_PER_MINUTE);
}

export function addHours(date: Date, hours: number): Date {
  return addMinutes(date, hours * MINUTES_PER_HOUR);
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  // Handle end-of-month overflow: e.g. Jan 31 + 1 month should land on Feb 28/29, not Mar 3.
  if (d.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    d.setDate(0);
  }
  return d;
}

export function addYears(date: Date, years: number): Date {
  const d = new Date(date.getTime());
  d.setFullYear(d.getFullYear() + years);
  return d;
}

/** True iff `a` and `b` fall on the same local calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isSameYear(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear();
}

/**
 * The local-midnight Date of the start of the week containing `date`.
 *
 * `weekStartsOn` is the same vocabulary `Intl.Locale.weekInfo.firstDay` uses
 * (0 = Sunday … 6 = Saturday).
 */
export function startOfWeek(date: Date, weekStartsOn: number = 0): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  return addDays(d, -diff);
}

export function endOfWeek(date: Date, weekStartsOn: number = 0): Date {
  return endOfDay(addDays(startOfWeek(date, weekStartsOn), 6));
}

/** Local-midnight Date of the first of `date`'s month. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

export function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

/**
 * Difference in calendar days between `b` and `a` (b - a). Both are interpreted at local
 * midnight to avoid off-by-one near DST boundaries.
 */
export function differenceInDays(a: Date, b: Date): number {
  const sa = startOfDay(a).getTime();
  const sb = startOfDay(b).getTime();
  return Math.round((sb - sa) / MS_PER_DAY);
}

/** Inclusive minutes from local midnight to `date`. */
export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * MINUTES_PER_HOUR + date.getMinutes() + date.getSeconds() / 60;
}

/** Build a new `Date` on the same calendar day as `dayAnchor` with the given local time. */
export function withTime(dayAnchor: Date, hours: number, minutes: number, seconds = 0): Date {
  return new Date(
    dayAnchor.getFullYear(),
    dayAnchor.getMonth(),
    dayAnchor.getDate(),
    hours,
    minutes,
    seconds,
    0,
  );
}

/** Snap `minute` to the nearest multiple of `snap` (within [0, MINUTES_PER_DAY]). */
export function snapMinute(minute: number, snap: number): number {
  if (snap <= 0) return Math.max(0, Math.min(MINUTES_PER_DAY, Math.round(minute)));
  const snapped = Math.round(minute / snap) * snap;
  return Math.max(0, Math.min(MINUTES_PER_DAY, snapped));
}

/** True iff `date` is within the closed interval `[start, end]`. */
export function isWithin(date: Date, start: Date, end: Date): boolean {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

/** True iff the two intervals overlap at all (half-open: `end` exclusive, `start` inclusive). */
export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

/** Returns each calendar day key that the interval `[start, end]` covers, inclusive. */
export function eachDayKeyInRange(start: Date, end: Date): string[] {
  if (end.getTime() < start.getTime()) return [];
  const keys: string[] = [];
  let cur = startOfDay(start);
  const last = startOfDay(end).getTime();
  // Guard against pathological inputs — cap at ~3 years of days.
  let safetyLimit = 1100;
  while (cur.getTime() <= last && safetyLimit-- > 0) {
    keys.push(toDayKey(cur));
    cur = addDays(cur, 1);
  }
  return keys;
}

/** Each Date (at local midnight) covered by `[start, end]`. */
export function eachDayInRange(start: Date, end: Date): Date[] {
  if (end.getTime() < start.getTime()) return [];
  const days: Date[] = [];
  let cur = startOfDay(start);
  const last = startOfDay(end).getTime();
  let safetyLimit = 1100;
  while (cur.getTime() <= last && safetyLimit-- > 0) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

/**
 * Build the 6-row × 7-col grid for a calendar month, padded with leading/trailing days
 * from the adjacent months. Always returns exactly 42 entries.
 */
export function computeMonthGrid(
  monthAnchor: Date,
  weekStartsOn: number = 0,
): Date[] {
  const firstOfMonth = startOfMonth(monthAnchor);
  const gridStart = startOfWeek(firstOfMonth, weekStartsOn);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(addDays(gridStart, i));
  }
  return cells;
}

/** Build N consecutive day Dates starting at `start`. */
export function rangeOfDays(start: Date, days: number): Date[] {
  const out: Date[] = [];
  const base = startOfDay(start);
  for (let i = 0; i < days; i++) {
    out.push(addDays(base, i));
  }
  return out;
}

/**
 * ISO 8601 week number — used by `<Scheduler>`'s "Show week numbers" toggle. Always
 * computes against the ISO weekStartsOn=1 calendar regardless of the user's locale.
 */
export function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7);
}

/** "HH:MM" → minutes-since-midnight. Tolerates "H:M" too. */
export function parseHHMM(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return (h || 0) * MINUTES_PER_HOUR + (m || 0);
}

/** minutes-since-midnight → "HH:MM" (24h). */
export function formatHHMM(minutes: number): string {
  const m = Math.max(0, Math.min(MINUTES_PER_DAY - 1, Math.round(minutes)));
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
}

/** True iff `date`'s weekday (`Sun=0`…`Sat=6`) is in `workingDays`. */
export function isWorkingDay(date: Date, workingDays: number[]): boolean {
  return workingDays.includes(date.getDay());
}

/** Earlier of two Dates. */
export function min(a: Date, b: Date): Date {
  return a.getTime() <= b.getTime() ? a : b;
}

/** Later of two Dates. */
export function max(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b;
}

/** Whether `value` is a real, finite `Date`. */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}