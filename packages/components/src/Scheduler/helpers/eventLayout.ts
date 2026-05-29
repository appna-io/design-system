import type { PositionedEvent, SchedulerEvent } from '../Scheduler.types';

import {
  intervalsOverlap,
  minutesSinceMidnight,
  startOfDay,
} from './dateMath';
import { splitAtMidnight } from './splitAtMidnight';

/**
 * Overlap-packing for hour-grid views (week / workWeek / day / multiDay).
 *
 * Algorithm:
 *
 *  1. Per-day, gather the timed (non-all-day) events that fall on that day. Multi-day
 *     events are split via `splitAtMidnight` so each day gets its own segment.
 *  2. Sort by `start` ASC, tiebreak by longer `duration` first (longer events get the
 *     leftmost column → better visual hierarchy).
 *  3. Greedy column assignment: each event picks the first column whose last event ends
 *     before it begins. If no column is free, allocate a new one.
 *  4. Group events into "overlap clusters" (transitive overlap chains) — `columnSpan`
 *     for an event is `clusterColumns - column` because Google Calendar fills the right
 *     side of the row with the rightmost event.
 *
 * Returns a `Map<dayKey, PositionedEvent[]>` for O(1) per-day lookup at render time.
 */
export interface LayoutOptions {
  events: readonly SchedulerEvent[];
  days: readonly Date[];
}

export function layoutTimedEvents(opts: LayoutOptions): Map<string, PositionedEvent[]> {
  const { events, days } = opts;
  const result = new Map<string, PositionedEvent[]>();

  for (const day of days) {
    const dayKey = toLocalKey(day);
    result.set(dayKey, []);
  }

  // 1. Split + bin per-day.
  const perDay = new Map<string, EventSegmentLike[]>();
  for (const event of events) {
    if (event.allDay) continue;
    const segments = splitAtMidnight(event);
    for (const seg of segments) {
      const key = toLocalKey(seg.start);
      if (!perDay.has(key)) perDay.set(key, []);
      perDay.get(key)!.push({
        event,
        start: seg.start,
        end: seg.end,
        continuesFrom: seg.continuesFrom,
        continuesTo: seg.continuesTo,
      });
    }
  }

  // 2 + 3 + 4. Pack each day independently.
  for (const day of days) {
    const dayKey = toLocalKey(day);
    const segs = perDay.get(dayKey);
    if (!segs || segs.length === 0) continue;

    segs.sort((a, b) => {
      const startDiff = a.start.getTime() - b.start.getTime();
      if (startDiff !== 0) return startDiff;
      return b.end.getTime() - a.end.getTime() - (a.end.getTime() - b.end.getTime());
    });

    // Greedy columns: `columnEnds[i]` = last `end` placed in column `i`.
    const columnEnds: number[] = [];
    const assignedCol: number[] = [];
    for (const seg of segs) {
      let placed = false;
      for (let c = 0; c < columnEnds.length; c++) {
        if (seg.start.getTime() >= columnEnds[c]!) {
          columnEnds[c] = seg.end.getTime();
          assignedCol.push(c);
          placed = true;
          break;
        }
      }
      if (!placed) {
        assignedCol.push(columnEnds.length);
        columnEnds.push(seg.end.getTime());
      }
    }

    // Cluster events for `columnSpan`. A cluster is a maximal run of events that
    // transitively overlap; within a cluster, total columns = max(column) + 1.
    const clusterIdx = computeClusters(segs);
    const clusterColumns = new Map<number, number>();
    for (let i = 0; i < segs.length; i++) {
      const ci = clusterIdx[i]!;
      const cols = (clusterColumns.get(ci) ?? 0) > assignedCol[i]!
        ? clusterColumns.get(ci)!
        : assignedCol[i]! + 1;
      clusterColumns.set(ci, cols);
    }

    const positioned: PositionedEvent[] = segs.map((seg, i) => {
      const col = assignedCol[i]!;
      const cluster = clusterIdx[i]!;
      const colTotal = clusterColumns.get(cluster)!;
      const columnSpan = Math.max(1, colTotal - col);

      // Minute coordinates relative to local midnight of this day. Segments that span
      // midnight get clipped to `[0, MINUTES_PER_DAY]`.
      const dayStart = startOfDay(seg.start).getTime();
      const segStartMs = seg.start.getTime();
      const segEndMs = seg.end.getTime();
      const startMinute = Math.max(0, (segStartMs - dayStart) / 60_000);
      const endMinute = Math.min(1_440, (segEndMs - dayStart) / 60_000);

      return {
        event: seg.event,
        startMinute,
        endMinute,
        column: col,
        columnSpan,
        resourceId: seg.event.resourceId ?? null,
        continuesFrom: seg.continuesFrom,
        continuesTo: seg.continuesTo,
      };
    });

    result.set(dayKey, positioned);
  }

  return result;
}

/**
 * All-day events get their own packing pass: they stack vertically by `row` (one slot per
 * non-overlapping event) so the all-day band fills top-down without horizontal splits.
 *
 * The output uses the `column` field as "row index" (we reuse `PositionedEvent` to keep the
 * downstream renderer single-shape).
 */
export function layoutAllDayEvents(opts: LayoutOptions): Map<string, PositionedEvent[]> {
  const { events, days } = opts;
  const result = new Map<string, PositionedEvent[]>();

  for (const day of days) result.set(toLocalKey(day), []);

  const allDayEvents = events.filter((e) => e.allDay);

  // Sort by start, then by longest first.
  const sorted = allDayEvents.slice().sort((a, b) => {
    const startDiff = a.start.getTime() - b.start.getTime();
    if (startDiff !== 0) return startDiff;
    return b.end.getTime() - b.start.getTime() - (a.end.getTime() - a.start.getTime());
  });

  // Greedy row assignment, but rows persist across days (so a 3-day event keeps the same row).
  const rowEnds: number[] = [];
  const assignedRow = new Map<string, number>();
  for (const event of sorted) {
    let placed = false;
    for (let r = 0; r < rowEnds.length; r++) {
      if (event.start.getTime() >= rowEnds[r]!) {
        rowEnds[r] = event.end.getTime();
        assignedRow.set(event.id, r);
        placed = true;
        break;
      }
    }
    if (!placed) {
      assignedRow.set(event.id, rowEnds.length);
      rowEnds.push(event.end.getTime());
    }
  }

  for (const day of days) {
    const dayKey = toLocalKey(day);
    const dayStart = startOfDay(day).getTime();
    const dayEnd = dayStart + 86_399_999;
    const bucket: PositionedEvent[] = [];
    for (const event of sorted) {
      if (!intervalsOverlap(event.start, event.end, new Date(dayStart), new Date(dayEnd))) continue;
      const row = assignedRow.get(event.id) ?? 0;
      bucket.push({
        event,
        startMinute: 0,
        endMinute: 1_440,
        column: row,
        columnSpan: 1,
        resourceId: event.resourceId ?? null,
        continuesFrom: event.start.getTime() < dayStart,
        continuesTo: event.end.getTime() > dayEnd,
      });
    }
    result.set(dayKey, bucket);
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/*  internals                                                                  */
/* -------------------------------------------------------------------------- */

interface EventSegmentLike {
  event: SchedulerEvent;
  start: Date;
  end: Date;
  continuesFrom: boolean;
  continuesTo: boolean;
}

function computeClusters(segs: EventSegmentLike[]): number[] {
  const cluster = new Array<number>(segs.length).fill(-1);
  let nextCluster = 0;
  for (let i = 0; i < segs.length; i++) {
    if (cluster[i] !== -1) continue;
    cluster[i] = nextCluster;
    // Sweep forward; extend cluster while overlap persists transitively.
    let frontier = segs[i]!.end.getTime();
    for (let j = i + 1; j < segs.length; j++) {
      if (segs[j]!.start.getTime() < frontier) {
        cluster[j] = nextCluster;
        if (segs[j]!.end.getTime() > frontier) frontier = segs[j]!.end.getTime();
      } else {
        break;
      }
    }
    nextCluster++;
  }
  return cluster;
}

function toLocalKey(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d}`;
}

/* -------------------------------------------------------------------------- */
/*  Inline-style helpers used by view renderers                                */
/* -------------------------------------------------------------------------- */

/**
 * Convert a `PositionedEvent` + the row's hourHeight into the `top` / `height` / `left` /
 * `width` CSS values for absolute positioning inside an hour-grid column.
 *
 * Returns percentages where appropriate so the renderer doesn't need to know the column
 * width.
 */
export function positionedToStyle(
  pos: PositionedEvent,
  hourHeight: number,
): {
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
} {
  const top = (pos.startMinute / 60) * hourHeight;
  const height = Math.max(
    18, // floor so 5-minute events still render
    ((pos.endMinute - pos.startMinute) / 60) * hourHeight,
  );
  // Reserve a 4 px slot between adjacent columns by subtracting from width.
  const totalColumns = pos.column + pos.columnSpan;
  const colWidth = 100 / Math.max(1, totalColumns);
  const leftPct = colWidth * pos.column;
  const widthPct = colWidth * pos.columnSpan;
  return { top, height, leftPct, widthPct };
}

/**
 * Helper for the "current time" cursor — top offset inside an hour grid.
 */
export function minuteToTop(minute: number, hourHeight: number): number {
  return (Math.max(0, Math.min(1_440, minute)) / 60) * hourHeight;
}

export { minutesSinceMidnight };
