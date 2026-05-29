/**
 * Pure, dependency-free date math.
 *
 * This is the canonical home for these helpers (Phase 33). The Scheduler currently keeps a
 * parallel copy under `Scheduler/helpers/dateMath.ts` for historical reasons; that file is
 * scheduled to be replaced by a re-export from this module once the Scheduler refactor lands.
 *
 * Conventions:
 * - Everything operates on the **local timezone** (DST-aware via the JS `Date` arithmetic).
 *   Multi-timezone rendering is intentionally out of scope.
 * - "Day key" is the ISO `YYYY-MM-DD` string of the date rendered in the local timezone. This
 *   is the stable identifier used for `Map<dayKey, ...>` indexing.
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

/** Strict ISO `YYYY-MM-DD` parser. Returns `null` for malformed / impossible dates (e.g. `2026-02-31`). */
export function parseIsoDate(s: string): Date | null {
  if (typeof s !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d, 0, 0, 0, 0);
  // Reject overflow (e.g. Feb 31 → Mar 3).
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

/** Format a Date as ISO `YYYY-MM-DD` (date-only, local timezone). Alias of `toDayKey`. */
export function formatIsoDate(date: Date): string {
  return toDayKey(date);
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
 * `weekStartsOn` follows `Intl.Locale.weekInfo.firstDay` vocabulary (0 = Sunday … 6 = Saturday).
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
 * Build the 6-row × 7-col grid for a calendar month, padded with leading/trailing days from
 * the adjacent months. Always returns exactly 42 entries.
 */
export function computeMonthGrid(monthAnchor: Date, weekStartsOn: number = 0): Date[] {
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
 * ISO 8601 week number. Always computes against the ISO `weekStartsOn=1` calendar regardless
 * of the user's locale — that's the contract of ISO 8601.
 */
export function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7);
}

/** Earlier of two Dates. */
export function min(a: Date, b: Date): Date {
  return a.getTime() <= b.getTime() ? a : b;
}

/** Later of two Dates. */
export function max(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b;
}

/** Clamp `d` to the inclusive `[min, max]` interval. Either bound may be omitted. */
export function clampDate(d: Date, lo?: Date, hi?: Date): Date {
  if (lo && d.getTime() < lo.getTime()) return new Date(lo.getTime());
  if (hi && d.getTime() > hi.getTime()) return new Date(hi.getTime());
  return new Date(d.getTime());
}

/** Whether `value` is a real, finite `Date`. */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}
