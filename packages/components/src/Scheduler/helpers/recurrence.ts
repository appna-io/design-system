import type {
  RecurrenceFreq,
  RecurrenceRule,
  SchedulerEvent,
  Weekday,
} from '../Scheduler.types';

import {
  addDays,
  differenceInDays,
  intervalsOverlap,
  startOfDay,
  startOfMonth,
  startOfWeek,
  isSameDay,
} from './dateMath';

/**
 * RRULE-lite expansion. Returns the synthetic instances of `event` that fall within
 * `[rangeStart, rangeEnd]`, in ascending `start` order. Pure — no side effects, no DOM access.
 *
 * The walk is period-anchored: `cursor` is always the start of a period (the day, the week,
 * the 1st of the month, Jan 1 of the year) and each step asks that period for its targets.
 * Anchoring this way is what keeps a "monthly on the 31st" rule from drifting into the
 * following month, and lets an unbounded series skip straight to the requested range instead
 * of walking every occurrence since it began.
 *
 * Performance: capped at 1,000 yielded instances per event per range. This is well past
 * anything a UI viewport needs (a year of daily events = 366; a year of weekly = 52).
 */
export interface ExpandOptions {
  rangeStart: Date;
  rangeEnd: Date;
  /** Hard cap on yielded instances. Default 1,000. */
  maxInstances?: number;
}

const WEEKDAY_INDEX: Record<Weekday, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

const WEEKDAYS_BY_INDEX: Weekday[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

const SUPPORTED_FREQ: RecurrenceFreq[] = ['daily', 'weekly', 'monthly', 'yearly'];

/**
 * Backstop against a cursor that fails to advance. Not a business limit — the walk already
 * terminates on `rangeEnd`, and `maxInstances` caps what is yielded.
 */
const MAX_PERIOD_STEPS = 10_000;

export function weekdayFromDate(date: Date): Weekday {
  return WEEKDAYS_BY_INDEX[date.getDay()]!;
}

/** A new Date on `day`'s calendar date carrying `seriesStart`'s local time-of-day. */
function atSeriesTime(day: Date, seriesStart: Date): Date {
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    seriesStart.getHours(),
    seriesStart.getMinutes(),
    seriesStart.getSeconds(),
    seriesStart.getMilliseconds(),
  );
}

/** The period boundary the walk starts from, for a series beginning at `seriesStart`. */
function periodAnchor(seriesStart: Date, freq: RecurrenceFreq): Date {
  switch (freq) {
    case 'weekly':
      return startOfWeek(seriesStart);
    case 'monthly':
      return startOfMonth(seriesStart);
    case 'yearly':
      return new Date(seriesStart.getFullYear(), 0, 1, 0, 0, 0, 0);
    default:
      return startOfDay(seriesStart);
  }
}

/** The next period boundary after `anchor`. Always strictly later, since `interval >= 1`. */
function nextPeriod(anchor: Date, freq: RecurrenceFreq, interval: number): Date {
  switch (freq) {
    case 'weekly':
      return addDays(anchor, 7 * interval);
    case 'monthly':
      return new Date(anchor.getFullYear(), anchor.getMonth() + interval, 1, 0, 0, 0, 0);
    case 'yearly':
      return new Date(anchor.getFullYear() + interval, 0, 1, 0, 0, 0, 0);
    default:
      return addDays(anchor, interval);
  }
}

/**
 * Skip whole periods so the walk starts near the requested range rather than at the series
 * start. Without this a daily event begun years ago exhausts the step budget before it ever
 * reaches the viewport, and silently renders nothing.
 *
 * Only safe when the rule is not `count`-bounded — a `count` rule needs every occurrence
 * counted from the true start, and is inherently short anyway.
 */
function fastForward(
  anchor: Date,
  freq: RecurrenceFreq,
  interval: number,
  notBefore: Date,
): Date {
  if (notBefore.getTime() <= anchor.getTime()) return anchor;

  switch (freq) {
    case 'weekly': {
      const periods = Math.floor(differenceInDays(anchor, notBefore) / (7 * interval));
      return periods > 0 ? addDays(anchor, periods * 7 * interval) : anchor;
    }
    case 'monthly': {
      const months =
        (notBefore.getFullYear() - anchor.getFullYear()) * 12 +
        (notBefore.getMonth() - anchor.getMonth());
      const periods = Math.floor(months / interval);
      return periods > 0
        ? new Date(anchor.getFullYear(), anchor.getMonth() + periods * interval, 1, 0, 0, 0, 0)
        : anchor;
    }
    case 'yearly': {
      const periods = Math.floor(
        (notBefore.getFullYear() - anchor.getFullYear()) / interval,
      );
      return periods > 0
        ? new Date(anchor.getFullYear() + periods * interval, 0, 1, 0, 0, 0, 0)
        : anchor;
    }
    default: {
      const periods = Math.floor(differenceInDays(anchor, notBefore) / interval);
      return periods > 0 ? addDays(anchor, periods * interval) : anchor;
    }
  }
}

/** Candidate starts inside the week beginning at `weekAnchor`, ascending. */
function weeklyTargets(weekAnchor: Date, rule: RecurrenceRule, seriesStart: Date): Date[] {
  const byDay =
    rule.byDay && rule.byDay.length > 0 ? rule.byDay : [weekdayFromDate(seriesStart)];

  return byDay
    .map((wd) => atSeriesTime(addDays(weekAnchor, WEEKDAY_INDEX[wd]!), seriesStart))
    .sort((a, b) => a.getTime() - b.getTime());
}

/** The dates in `[monthStart, monthEnd]` whose weekday is in `byDay`, ascending. */
function weekdayMatchesInMonth(monthAnchor: Date, byDay: Weekday[]): Date[] {
  const wanted = new Set(byDay.map((wd) => WEEKDAY_INDEX[wd]!));
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const matches: Date[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (wanted.has(date.getDay())) matches.push(date);
  }
  return matches;
}

/**
 * Starts on the given days-of-month within `(year, month)`, ascending.
 *
 * A day the month doesn't have is SKIPPED, not clamped — the 31st of February is no date at
 * all (RFC 5545 §3.3.10). `new Date(2024, 1, 31)` rolls forward into March, so the month has
 * to be re-checked after construction.
 */
function datesOnDaysOfMonth(
  year: number,
  month: number,
  daysOfMonth: number[],
  seriesStart: Date,
): Date[] {
  return daysOfMonth
    .map((day) => atSeriesTime(new Date(year, month, day), seriesStart))
    .filter((target) => target.getMonth() === month)
    .sort((a, b) => a.getTime() - b.getTime());
}

/** Candidate starts inside the month beginning at `monthAnchor`, ascending. */
function monthlyTargets(monthAnchor: Date, rule: RecurrenceRule, seriesStart: Date): Date[] {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();

  if (rule.byMonthDay && rule.byMonthDay.length > 0) {
    return datesOnDaysOfMonth(year, month, rule.byMonthDay, seriesStart);
  }

  // E.g. "last Thursday of the month" = { bySetPos: -1, byDay: ['TH'] }.
  if (rule.bySetPos && rule.byDay && rule.byDay.length > 0) {
    const matches = weekdayMatchesInMonth(monthAnchor, rule.byDay);
    const index = rule.bySetPos > 0 ? rule.bySetPos - 1 : matches.length + rule.bySetPos;
    const match = matches[index];
    return match ? [atSeriesTime(match, seriesStart)] : [];
  }

  // Plain monthly: the series' own day-of-month, on every month that has one.
  return datesOnDaysOfMonth(year, month, [seriesStart.getDate()], seriesStart);
}

/** The single candidate start inside the year beginning at `yearAnchor`. Empty on Feb 29. */
function yearlyTargets(yearAnchor: Date, seriesStart: Date): Date[] {
  return datesOnDaysOfMonth(
    yearAnchor.getFullYear(),
    seriesStart.getMonth(),
    [seriesStart.getDate()],
    seriesStart,
  );
}

/** Candidate starts inside the period beginning at `anchor`, ascending. */
function targetsInPeriod(anchor: Date, rule: RecurrenceRule, seriesStart: Date): Date[] {
  switch (rule.freq) {
    case 'weekly':
      return weeklyTargets(anchor, rule, seriesStart);
    case 'monthly':
      return monthlyTargets(anchor, rule, seriesStart);
    case 'yearly':
      return yearlyTargets(anchor, seriesStart);
    default:
      return [atSeriesTime(anchor, seriesStart)];
  }
}

export function expandRecurrence(
  event: SchedulerEvent,
  opts: ExpandOptions,
): SchedulerEvent[] {
  const { rangeStart, rangeEnd, maxInstances = 1_000 } = opts;
  const rule = event.recurrence;

  // Non-recurring: include the base event if it overlaps the range.
  if (!rule) {
    return intervalsOverlap(event.start, event.end, rangeStart, rangeEnd) ? [event] : [];
  }
  if (!SUPPORTED_FREQ.includes(rule.freq)) return [];

  const duration = event.end.getTime() - event.start.getTime();
  const interval = Math.max(1, rule.interval ?? 1);
  const exceptions = new Set((rule.exceptions ?? []).map((d) => startOfDay(d).getTime()));
  const instances: SchedulerEvent[] = [];

  let yielded = 0;
  let exhausted = false;

  /** Record `start` if it overlaps the range. Returns true once the series is exhausted. */
  const yieldInstance = (start: Date): boolean => {
    if (exceptions.has(startOfDay(start).getTime())) return false;
    if (rule.until && start.getTime() > rule.until.getTime()) return true;

    const end = new Date(start.getTime() + duration);
    if (intervalsOverlap(start, end, rangeStart, rangeEnd)) {
      instances.push({
        ...event,
        id: `${event.id}::${start.toISOString()}`,
        start,
        end,
      });
    }
    yielded++;
    return rule.count !== undefined && yielded >= rule.count;
  };

  let cursor = periodAnchor(event.start, rule.freq);
  if (rule.count === undefined) {
    // An instance starting at or before this cannot reach into the range.
    const notBefore = new Date(rangeStart.getTime() - duration);
    cursor = fastForward(cursor, rule.freq, interval, notBefore);
  }

  let steps = MAX_PERIOD_STEPS;
  while (steps-- > 0 && !exhausted && instances.length < maxInstances) {
    if (cursor.getTime() > rangeEnd.getTime()) break;
    if (rule.until && cursor.getTime() > rule.until.getTime()) break;

    for (const target of targetsInPeriod(cursor, rule, event.start)) {
      if (target.getTime() < event.start.getTime()) continue;
      if (target.getTime() > rangeEnd.getTime()) continue;
      if (yieldInstance(target)) {
        exhausted = true;
        break;
      }
      if (instances.length >= maxInstances) break;
    }

    cursor = nextPeriod(cursor, rule.freq, interval);
  }

  return instances.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Apply a "this instance only" exception — useful when the consumer wants to delete a
 * single occurrence of a recurring event without breaking the rule. Returns the rule
 * with `exceptions` appended.
 */
export function addRecurrenceException(rule: RecurrenceRule, date: Date): RecurrenceRule {
  const existing = rule.exceptions ?? [];
  if (existing.some((d) => isSameDay(d, date))) return rule;
  return { ...rule, exceptions: [...existing, date] };
}

/**
 * Friendly string description of a rule, intended for the toolbar "Doesn't repeat" /
 * "Daily" / "Weekly on Monday" affordance. Locale-aware via the passed-in formatter map.
 */
export function describeRecurrence(
  rule: RecurrenceRule | undefined,
  labels: {
    none: string;
    daily: string;
    weekly: string;
    monthly: string;
    yearly: string;
    custom: string;
  },
): string {
  if (!rule) return labels.none;
  const isSimple =
    (rule.interval ?? 1) === 1 &&
    !rule.byDay &&
    !rule.byMonthDay &&
    !rule.bySetPos &&
    !rule.count &&
    !rule.until;
  if (!isSimple) return labels.custom;
  switch (rule.freq) {
    case 'daily':
      return labels.daily;
    case 'weekly':
      return labels.weekly;
    case 'monthly':
      return labels.monthly;
    case 'yearly':
      return labels.yearly;
    default:
      return labels.custom;
  }
}
