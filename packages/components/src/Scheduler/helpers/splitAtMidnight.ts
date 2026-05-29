import type { SchedulerEvent } from '../Scheduler.types';

import {
  addDays,
  endOfDay,
  isSameDay,
  startOfDay,
} from './dateMath';

/**
 * Split a multi-day event into per-day segments so each view's day column / row gets a
 * piece. Carries `continuesFrom` / `continuesTo` flags so the renderer can draw the
 * "continues into next day" cap (typically a chevron or border-radius change).
 *
 * Single-day events (where `isSameDay(start, end)` is true) return as a single segment
 * with both flags `false`.
 */
export interface EventSegment {
  event: SchedulerEvent;
  start: Date;
  end: Date;
  continuesFrom: boolean;
  continuesTo: boolean;
}

export function splitAtMidnight(event: SchedulerEvent): EventSegment[] {
  if (event.allDay || isSameDay(event.start, event.end)) {
    return [
      {
        event,
        start: event.start,
        end: event.end,
        continuesFrom: false,
        continuesTo: false,
      },
    ];
  }

  const segments: EventSegment[] = [];
  let cursor = event.start;
  const eventStart = event.start.getTime();
  const eventEnd = event.end.getTime();

  // Hard cap at 366 segments — a multi-year event would otherwise lock the thread.
  let safety = 366;
  while (cursor.getTime() < eventEnd && safety-- > 0) {
    const dayEnd = endOfDay(cursor);
    const segEnd = dayEnd.getTime() < eventEnd ? dayEnd : event.end;
    segments.push({
      event,
      start: cursor,
      end: segEnd,
      continuesFrom: cursor.getTime() > eventStart,
      continuesTo: segEnd.getTime() < eventEnd,
    });
    cursor = startOfDay(addDays(cursor, 1));
  }

  return segments;
}
