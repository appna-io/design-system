import { describe, expect, it } from 'vitest';

import {
  layoutAllDayEvents,
  layoutTimedEvents,
  minuteToTop,
  positionedToStyle,
} from '../src/Scheduler/helpers/eventLayout';
import { splitAtMidnight } from '../src/Scheduler/helpers/splitAtMidnight';
import type { PositionedEvent, SchedulerEvent } from '../src/Scheduler/Scheduler.types';

const DAY = new Date(2024, 0, 10);
const DAY_KEY = '2024-01-10';

/** A timed event on Jan 10 2024, given as local clock times. */
const timed = (
  id: string,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
): SchedulerEvent => ({
  id,
  title: id,
  start: new Date(2024, 0, 10, startHour, startMinute),
  end: new Date(2024, 0, 10, endHour, endMinute),
});

const spanning = (id: string, start: Date, end: Date, allDay = false): SchedulerEvent => ({
  id,
  title: id,
  start,
  end,
  allDay,
});

/** `id: column/span` for each positioned event — the shape most assertions read on. */
const slots = (positioned: PositionedEvent[]): string[] =>
  positioned.map((p) => `${p.event.id}: ${p.column}/${p.columnSpan}`);

const layoutOn = (events: SchedulerEvent[], days: Date[] = [DAY]) =>
  layoutTimedEvents({ events, days });

describe('splitAtMidnight', () => {
  it('returns a single uncapped segment for a same-day event', () => {
    const [segment, ...rest] = splitAtMidnight(timed('A', 9, 0, 10, 0));
    expect(rest).toHaveLength(0);
    expect(segment).toMatchObject({ continuesFrom: false, continuesTo: false });
  });

  it('returns a single segment for an all-day event even across days', () => {
    const e = spanning('A', new Date(2024, 0, 10), new Date(2024, 0, 12), true);
    expect(splitAtMidnight(e)).toHaveLength(1);
  });

  it('splits a two-day event at midnight', () => {
    const e = spanning('A', new Date(2024, 0, 10, 22, 0), new Date(2024, 0, 11, 2, 0));
    const segments = splitAtMidnight(e);
    expect(segments).toHaveLength(2);
    expect(segments[0]!.end.getHours()).toBe(23);
    expect(segments[1]!.start.getHours()).toBe(0);
  });

  it('flags continuation on the joining edges only', () => {
    const e = spanning('A', new Date(2024, 0, 10, 22, 0), new Date(2024, 0, 12, 2, 0));
    const segments = splitAtMidnight(e);
    expect(segments.map((s) => [s.continuesFrom, s.continuesTo])).toEqual([
      [false, true],
      [true, true],
      [true, false],
    ]);
  });

  it('keeps the original event on every segment', () => {
    const e = spanning('A', new Date(2024, 0, 10, 22, 0), new Date(2024, 0, 11, 2, 0));
    for (const segment of splitAtMidnight(e)) expect(segment.event).toBe(e);
  });
});

describe('layoutTimedEvents — binning', () => {
  it('returns an entry for every requested day, even an empty one', () => {
    const result = layoutOn([], [DAY, new Date(2024, 0, 11)]);
    expect([...result.keys()]).toEqual(['2024-01-10', '2024-01-11']);
    expect(result.get(DAY_KEY)).toEqual([]);
  });

  it('ignores all-day events', () => {
    const e = spanning('A', new Date(2024, 0, 10, 9), new Date(2024, 0, 10, 10), true);
    expect(layoutOn([e]).get(DAY_KEY)).toEqual([]);
  });

  it('drops events that fall outside the requested days', () => {
    const other = spanning('A', new Date(2024, 2, 1, 9), new Date(2024, 2, 1, 10));
    expect(layoutOn([other]).get(DAY_KEY)).toEqual([]);
  });

  it('places each segment of a multi-day event on its own day', () => {
    const e = spanning('A', new Date(2024, 0, 10, 22, 0), new Date(2024, 0, 11, 2, 0));
    const result = layoutOn([e], [DAY, new Date(2024, 0, 11)]);
    expect(result.get('2024-01-10')).toHaveLength(1);
    expect(result.get('2024-01-11')).toHaveLength(1);
  });

  it('clips each segment of a multi-day event to its own day in minutes', () => {
    const e = spanning('A', new Date(2024, 0, 10, 22, 0), new Date(2024, 0, 11, 2, 0));
    const result = layoutOn([e], [DAY, new Date(2024, 0, 11)]);
    const [first] = result.get('2024-01-10')!;
    const [second] = result.get('2024-01-11')!;
    expect(first!.startMinute).toBe(22 * 60);
    expect(first!.endMinute).toBeCloseTo(1_440, 0);
    expect(second!.startMinute).toBe(0);
    expect(second!.endMinute).toBe(2 * 60);
  });

  it('carries continuation flags through to the positioned events', () => {
    const e = spanning('A', new Date(2024, 0, 10, 22, 0), new Date(2024, 0, 11, 2, 0));
    const result = layoutOn([e], [DAY, new Date(2024, 0, 11)]);
    expect(result.get('2024-01-10')![0]).toMatchObject({ continuesFrom: false, continuesTo: true });
    expect(result.get('2024-01-11')![0]).toMatchObject({ continuesFrom: true, continuesTo: false });
  });

  it('converts times to minutes since local midnight', () => {
    const [positioned] = layoutOn([timed('A', 9, 30, 10, 45)]).get(DAY_KEY)!;
    expect(positioned).toMatchObject({ startMinute: 570, endMinute: 645 });
  });

  it('defaults resourceId to null rather than leaving it undefined', () => {
    const [positioned] = layoutOn([timed('A', 9, 0, 10, 0)]).get(DAY_KEY)!;
    expect(positioned!.resourceId).toBeNull();
  });

  it('preserves an explicit resourceId', () => {
    const e: SchedulerEvent = { ...timed('A', 9, 0, 10, 0), resourceId: 'room-1' };
    expect(layoutOn([e]).get(DAY_KEY)![0]!.resourceId).toBe('room-1');
  });
});

describe('layoutTimedEvents — column packing', () => {
  it('gives a lone event column 0 and span 1', () => {
    expect(slots(layoutOn([timed('A', 9, 0, 10, 0)]).get(DAY_KEY)!)).toEqual(['A: 0/1']);
  });

  it('reuses column 0 for events that do not overlap', () => {
    const out = layoutOn([timed('A', 9, 0, 10, 0), timed('B', 10, 0, 11, 0)]).get(DAY_KEY)!;
    expect(slots(out)).toEqual(['A: 0/1', 'B: 0/1']);
  });

  it('treats touching events as non-overlapping', () => {
    // A ends exactly when B starts — half-open intervals, so they share a column.
    const out = layoutOn([timed('A', 9, 0, 10, 0), timed('B', 10, 0, 11, 0)]).get(DAY_KEY)!;
    expect(out.map((p) => p.column)).toEqual([0, 0]);
  });

  it('puts an overlapping event in the next column', () => {
    const out = layoutOn([timed('A', 9, 0, 11, 0), timed('B', 9, 30, 10, 30)]).get(DAY_KEY)!;
    expect(out.map((p) => p.column)).toEqual([0, 1]);
  });

  it('allocates a column per event in a mutually overlapping cluster', () => {
    const out = layoutOn([
      timed('A', 9, 0, 12, 0),
      timed('B', 9, 30, 12, 0),
      timed('C', 10, 0, 12, 0),
    ]).get(DAY_KEY)!;
    expect(out.map((p) => p.column)).toEqual([0, 1, 2]);
  });

  it('orders output by start time', () => {
    const out = layoutOn([
      timed('C', 11, 0, 12, 0),
      timed('A', 9, 0, 10, 0),
      timed('B', 10, 0, 11, 0),
    ]).get(DAY_KEY)!;
    expect(out.map((p) => p.event.id)).toEqual(['A', 'B', 'C']);
  });

  it('puts the longer event first when two start together', () => {
    const out = layoutOn([timed('short', 9, 0, 9, 30), timed('long', 9, 0, 11, 0)]).get(DAY_KEY)!;
    expect(out.map((p) => p.event.id)).toEqual(['long', 'short']);
  });

  it('starts a fresh cluster after a gap, resetting column width', () => {
    const out = layoutOn([
      timed('A', 9, 0, 10, 0),
      timed('B', 9, 30, 10, 0),
      timed('C', 14, 0, 15, 0),
    ]).get(DAY_KEY)!;
    expect(slots(out)).toEqual(['A: 0/2', 'B: 1/1', 'C: 0/1']);
  });

  it('chains a cluster transitively through a middle event', () => {
    // A and C never touch, but both overlap B, so all three share one cluster.
    const out = layoutOn([
      timed('A', 9, 0, 10, 0),
      timed('B', 9, 30, 11, 0),
      timed('C', 10, 30, 12, 0),
    ]).get(DAY_KEY)!;
    expect(out.map((p) => p.columnSpan)).toEqual([2, 1, 2]);
  });

  it('widens the leftmost event to the full cluster width', () => {
    // `columnSpan` doubles as the cluster's total width: `column + columnSpan` is what
    // `positionedToStyle` divides by, so only the leftmost event carries the full count.
    // See the shingling caveat covered in `positionedToStyle` below.
    const out = layoutOn([
      timed('A', 9, 0, 12, 0),
      timed('B', 9, 30, 12, 0),
      timed('C', 10, 0, 12, 0),
    ]).get(DAY_KEY)!;
    expect(slots(out)).toEqual(['A: 0/3', 'B: 1/2', 'C: 2/1']);
  });

  it('packs each day independently', () => {
    const nextDay = new Date(2024, 0, 11);
    const out = layoutTimedEvents({
      events: [
        timed('A', 9, 0, 11, 0),
        timed('B', 9, 30, 10, 30),
        { id: 'C', title: 'C', start: new Date(2024, 0, 11, 9), end: new Date(2024, 0, 11, 10) },
      ],
      days: [DAY, nextDay],
    });
    expect(slots(out.get('2024-01-10')!)).toEqual(['A: 0/2', 'B: 1/1']);
    expect(slots(out.get('2024-01-11')!)).toEqual(['C: 0/1']);
  });
});

describe('layoutAllDayEvents', () => {
  const allDay = (id: string, from: number, to: number): SchedulerEvent =>
    spanning(id, new Date(2024, 0, from), new Date(2024, 0, to, 23, 59, 59, 999), true);

  const week = [10, 11, 12].map((d) => new Date(2024, 0, d));

  it('returns an entry for every requested day', () => {
    const out = layoutAllDayEvents({ events: [], days: week });
    expect([...out.keys()]).toEqual(['2024-01-10', '2024-01-11', '2024-01-12']);
  });

  it('ignores timed events', () => {
    const out = layoutAllDayEvents({ events: [timed('A', 9, 0, 10, 0)], days: week });
    expect(out.get(DAY_KEY)).toEqual([]);
  });

  it('places a one-day event on its own day only', () => {
    const out = layoutAllDayEvents({ events: [allDay('A', 11, 11)], days: week });
    expect(out.get('2024-01-10')).toEqual([]);
    expect(out.get('2024-01-11')).toHaveLength(1);
    expect(out.get('2024-01-12')).toEqual([]);
  });

  it('repeats a multi-day event on every day it covers', () => {
    const out = layoutAllDayEvents({ events: [allDay('A', 10, 12)], days: week });
    expect(week.map((d) => out.get(`2024-01-${d.getDate()}`)!.length)).toEqual([1, 1, 1]);
  });

  it('keeps a multi-day event on the same row across days', () => {
    const out = layoutAllDayEvents({ events: [allDay('A', 10, 12), allDay('B', 11, 11)], days: week });
    const rowOf = (key: string, id: string) =>
      out.get(key)!.find((p) => p.event.id === id)!.column;
    expect(rowOf('2024-01-10', 'A')).toBe(rowOf('2024-01-12', 'A'));
  });

  it('stacks an overlapping event onto the next row', () => {
    const out = layoutAllDayEvents({ events: [allDay('A', 10, 12), allDay('B', 11, 11)], days: week });
    const rows = out.get('2024-01-11')!.map((p) => `${p.event.id}: ${p.column}`);
    expect(rows).toEqual(['A: 0', 'B: 1']);
  });

  it('reuses row 0 for an event that starts after the previous one ends', () => {
    const out = layoutAllDayEvents({ events: [allDay('A', 10, 10), allDay('B', 12, 12)], days: week });
    expect(out.get('2024-01-12')![0]!.column).toBe(0);
  });

  it('spans the full day in minutes regardless of the event clock times', () => {
    const out = layoutAllDayEvents({ events: [allDay('A', 10, 10)], days: week });
    expect(out.get(DAY_KEY)![0]).toMatchObject({ startMinute: 0, endMinute: 1_440, columnSpan: 1 });
  });

  it('flags continuation on the days a multi-day event runs through', () => {
    const out = layoutAllDayEvents({ events: [allDay('A', 10, 12)], days: week });
    expect(week.map((d) => {
      const p = out.get(`2024-01-${d.getDate()}`)![0]!;
      return [p.continuesFrom, p.continuesTo];
    })).toEqual([
      [false, true],
      [true, true],
      [true, false],
    ]);
  });
});

describe('positionedToStyle', () => {
  const pos = (column: number, columnSpan: number, startMinute = 0, endMinute = 60) =>
    ({ event: timed('A', 0, 0, 1, 0), startMinute, endMinute, column, columnSpan }) as PositionedEvent;

  it('converts start minutes to a top offset at the given hour height', () => {
    expect(positionedToStyle(pos(0, 1, 90, 150), 48).top).toBe(72);
  });

  it('scales height with duration', () => {
    expect(positionedToStyle(pos(0, 1, 0, 120), 48).height).toBe(96);
  });

  it('floors the height so a very short event stays visible', () => {
    // 5 minutes at 48px/hour is 4px — below the 18px floor.
    expect(positionedToStyle(pos(0, 1, 0, 5), 48).height).toBe(18);
  });

  it('gives a lone event the full width', () => {
    expect(positionedToStyle(pos(0, 1), 48)).toMatchObject({ leftPct: 0, widthPct: 100 });
  });

  it('splits the row between two side-by-side events', () => {
    expect(positionedToStyle(pos(1, 1), 48)).toMatchObject({ leftPct: 50, widthPct: 50 });
  });

  it('derives the cluster width from column + columnSpan', () => {
    const third = positionedToStyle(pos(2, 1), 48);
    expect(third.leftPct).toBeCloseTo(66.67, 1);
    expect(third.widthPct).toBeCloseTo(33.33, 1);
  });

  it('lets a leftmost event span the whole cluster — later cards shingle over it', () => {
    // Documented consequence of `columnSpan = clusterColumns - column`: the leftmost card is
    // laid out full-width and the ones to its right paint on top of it. It reads correctly
    // only because event cards are opaque and painted in start order.
    expect(positionedToStyle(pos(0, 3), 48)).toMatchObject({ leftPct: 0, widthPct: 100 });
  });

  it('does not divide by zero on a hand-built zero span', () => {
    // `layoutTimedEvents` floors columnSpan at 1, so this only arises if a consumer builds a
    // `PositionedEvent` itself. The divisor is guarded; the resulting width is legitimately 0.
    expect(positionedToStyle(pos(0, 0), 48)).toMatchObject({ leftPct: 0, widthPct: 0 });
  });
});

describe('minuteToTop', () => {
  it('scales a minute offset by the hour height', () => {
    expect(minuteToTop(90, 48)).toBe(72);
  });

  it('clamps below zero', () => {
    expect(minuteToTop(-60, 48)).toBe(0);
  });

  it('clamps past the end of the day', () => {
    expect(minuteToTop(2_000, 48)).toBe(48 * 24);
  });
});
