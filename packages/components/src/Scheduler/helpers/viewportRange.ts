import type { SchedulerView } from '../Scheduler.types';

import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from './dateMath';

/**
 * Resolve the visible date range for a (view, anchor) pair.
 *
 * The "visible range" is what the Scheduler queries for events — it's deliberately a
 * *superset* of the rendered cells for month/year views so events that bleed into the
 * leading/trailing padding days don't pop in/out as the user navigates by week.
 *
 * `multiDayCount` only affects `multiDay`. Default 3 matches Google Calendar's "X Days"
 * preset.
 */
export interface ViewportRangeOptions {
  view: SchedulerView;
  anchor: Date;
  weekStartsOn?: number;
  multiDayCount?: number;
  workingDays?: number[];
}

export function viewportRange(opts: ViewportRangeOptions): { start: Date; end: Date } {
  const {
    view,
    anchor,
    weekStartsOn = 0,
    multiDayCount = 3,
    workingDays = [1, 2, 3, 4, 5],
  } = opts;

  switch (view) {
    case 'month': {
      // 6-week grid superset — start of the week containing the 1st through the week
      // containing the last day.
      const monthStart = startOfMonth(anchor);
      const monthEnd = endOfMonth(anchor);
      return {
        start: startOfWeek(monthStart, weekStartsOn),
        end: endOfWeek(monthEnd, weekStartsOn),
      };
    }
    case 'week':
      return {
        start: startOfWeek(anchor, weekStartsOn),
        end: endOfWeek(anchor, weekStartsOn),
      };
    case 'workWeek': {
      // Work-week is "the contiguous run of workingDays from the start of the week".
      // If workingDays is non-contiguous (rare), we just clip to the first/last working day.
      const weekStart = startOfWeek(anchor, weekStartsOn);
      let firstIdx = -1;
      let lastIdx = -1;
      for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i).getDay();
        if (workingDays.includes(day)) {
          if (firstIdx === -1) firstIdx = i;
          lastIdx = i;
        }
      }
      if (firstIdx === -1) {
        // Fallback when no working days configured — render full week.
        return { start: weekStart, end: endOfWeek(weekStart, weekStartsOn) };
      }
      return {
        start: startOfDay(addDays(weekStart, firstIdx)),
        end: endOfDay(addDays(weekStart, lastIdx)),
      };
    }
    case 'day':
      return { start: startOfDay(anchor), end: endOfDay(anchor) };
    case 'multiDay':
      return {
        start: startOfDay(anchor),
        end: endOfDay(addDays(anchor, Math.max(1, multiDayCount) - 1)),
      };
    case 'agenda':
      // 30-day rolling window. Matches Google Calendar's "Schedule" view default.
      return { start: startOfDay(anchor), end: endOfDay(addDays(anchor, 29)) };
    case 'year':
      return { start: startOfYear(anchor), end: endOfYear(anchor) };
    case 'resource':
      // Resource view follows the day-grid; defaults to the same range as the day view but
      // the Scheduler can be configured with `resourceGranularity` for week/day. PR 1
      // ships the day-granularity behaviour.
      return { start: startOfDay(anchor), end: endOfDay(anchor) };
    default:
      return { start: startOfDay(anchor), end: endOfDay(anchor) };
  }
}

/**
 * Move the anchor date by one "page" in the given view's direction. Used by the
 * Toolbar's prev / next buttons.
 */
export function shiftAnchor(
  view: SchedulerView,
  anchor: Date,
  direction: -1 | 1,
  opts: { multiDayCount?: number } = {},
): Date {
  const { multiDayCount = 3 } = opts;
  switch (view) {
    case 'month':
      return addMonths(anchor, direction);
    case 'week':
    case 'workWeek':
      return addDays(anchor, 7 * direction);
    case 'day':
      return addDays(anchor, direction);
    case 'multiDay':
      return addDays(anchor, Math.max(1, multiDayCount) * direction);
    case 'agenda':
      return addDays(anchor, 30 * direction);
    case 'year':
      return new Date(anchor.getFullYear() + direction, 0, 1);
    case 'resource':
      return addDays(anchor, direction);
    default:
      return addDays(anchor, direction);
  }
}
