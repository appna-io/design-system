import type {
  RecurrenceRule,
  SchedulerEvent,
  Weekday,
} from '../Scheduler.types';

import {
  addDays,
  addMonths,
  addYears,
  intervalsOverlap,
  startOfDay,
  isSameDay,
} from './dateMath';

/**
 * RRULE-lite expansion. Returns the synthetic instances of `event` that fall within
 * `[rangeStart, rangeEnd]`. Pure — no side effects, no DOM access.
 *
 * Performance: capped at 1,000 expansions per event per range. This is well past anything
 * a UI viewport needs (a year of daily events = 366; a year of weekly = 52), and prevents
 * pathological `count` / `until` inputs from locking the thread.
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

export function weekdayFromDate(date: Date): Weekday {
  return WEEKDAYS_BY_INDEX[date.getDay()]!;
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

  const duration = event.end.getTime() - event.start.getTime();
  const interval = Math.max(1, rule.interval ?? 1);
  const exceptions = new Set((rule.exceptions ?? []).map((d) => startOfDay(d).getTime()));
  const instances: SchedulerEvent[] = [];

  let cursor = new Date(event.start.getTime());
  let yielded = 0;
  let safety = maxInstances + 50;

  const yieldInstance = (start: Date) => {
    if (exceptions.has(startOfDay(start).getTime())) return false;
    const end = new Date(start.getTime() + duration);
    if (rule.until && start.getTime() > rule.until.getTime()) return true;
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

  while (safety-- > 0 && instances.length < maxInstances) {
    if (cursor.getTime() > rangeEnd.getTime()) break;
    if (rule.until && cursor.getTime() > rule.until.getTime()) break;
    if (rule.count !== undefined && yielded >= rule.count) break;

    switch (rule.freq) {
      case 'daily': {
        if (yieldInstance(cursor)) return instances;
        cursor = addDays(cursor, interval);
        break;
      }
      case 'weekly': {
        const byDay = rule.byDay && rule.byDay.length > 0
          ? rule.byDay
          : [weekdayFromDate(event.start)];

        // Yield each `byDay` within the cursor's week.
        for (const wd of byDay) {
          const wdIdx = WEEKDAY_INDEX[wd]!;
          const cursorIdx = cursor.getDay();
          const delta = (wdIdx - cursorIdx + 7) % 7;
          const target = addDays(cursor, delta);
          if (target.getTime() < event.start.getTime()) continue;
          if (target.getTime() > rangeEnd.getTime()) continue;
          if (yieldInstance(target)) return instances;
          if (instances.length >= maxInstances) break;
        }
        cursor = addDays(cursor, 7 * interval);
        // Reset cursor to the start of its week so the next iteration walks `byDay` fresh.
        cursor = addDays(cursor, -cursor.getDay() + event.start.getDay());
        break;
      }
      case 'monthly': {
        if (rule.byMonthDay && rule.byMonthDay.length > 0) {
          for (const dayOfMonth of rule.byMonthDay) {
            const target = new Date(
              cursor.getFullYear(),
              cursor.getMonth(),
              dayOfMonth,
              event.start.getHours(),
              event.start.getMinutes(),
            );
            if (target.getMonth() !== cursor.getMonth()) continue;
            if (target.getTime() < event.start.getTime()) continue;
            if (yieldInstance(target)) return instances;
            if (instances.length >= maxInstances) break;
          }
        } else if (rule.bySetPos && rule.byDay && rule.byDay.length > 0) {
          // E.g. "last Thursday of the month" = { bySetPos: -1, byDay: ['TH'] }.
          const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
          const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
          const matches: Date[] = [];
          for (let d = new Date(monthStart); d.getTime() <= monthEnd.getTime(); d = addDays(d, 1)) {
            if (rule.byDay.some((wd) => WEEKDAY_INDEX[wd] === d.getDay())) {
              matches.push(
                new Date(
                  d.getFullYear(),
                  d.getMonth(),
                  d.getDate(),
                  event.start.getHours(),
                  event.start.getMinutes(),
                ),
              );
            }
          }
          const idx = rule.bySetPos > 0 ? rule.bySetPos - 1 : matches.length + rule.bySetPos;
          const target = matches[idx];
          if (target && target.getTime() >= event.start.getTime()) {
            if (yieldInstance(target)) return instances;
          }
        } else {
          if (yieldInstance(cursor)) return instances;
        }
        cursor = addMonths(cursor, interval);
        cursor = new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          event.start.getDate(),
          event.start.getHours(),
          event.start.getMinutes(),
        );
        break;
      }
      case 'yearly': {
        if (yieldInstance(cursor)) return instances;
        cursor = addYears(cursor, interval);
        break;
      }
      default:
        return instances;
    }
  }

  return instances;
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
