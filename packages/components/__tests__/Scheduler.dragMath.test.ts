import { describe, expect, it } from 'vitest';

import {
  applyMoveDelta,
  applyResizeDelta,
  dragRange,
  pointerToDateTime,
  pointerToDay,
  pointerToTime,
} from '../src/Scheduler/helpers/dragMath';

const DAY = new Date(2024, 0, 10);
const HOUR_HEIGHT = 48;

const at = (hours: number, minutes = 0, day = 10): Date => new Date(2024, 0, day, hours, minutes);

/** `YYYY-MM-DD HH:MM` in local time — what the time assertions read on. */
const stamp = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ` +
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

describe('pointerToTime', () => {
  const toTime = (pointerY: number, snapMinutes = 15) =>
    pointerToTime({ pointerY, containerTop: 100, hourHeight: HOUR_HEIGHT, dayAnchor: DAY, snapMinutes });

  it('maps the top of the container to midnight', () => {
    expect(stamp(toTime(100))).toBe('2024-01-10 00:00');
  });

  it('converts a pixel offset into hours at the configured pitch', () => {
    expect(stamp(toTime(100 + HOUR_HEIGHT * 9))).toBe('2024-01-10 09:00');
  });

  it('clamps a pointer above the container to midnight', () => {
    expect(stamp(toTime(20))).toBe('2024-01-10 00:00');
  });

  it('snaps down to the nearest slot', () => {
    // 9h04 → nearest 15-minute slot is 9h00.
    expect(stamp(toTime(100 + HOUR_HEIGHT * 9 + 3))).toBe('2024-01-10 09:00');
  });

  it('snaps up to the nearest slot', () => {
    // 9h11 → nearest 15-minute slot is 9h15.
    expect(stamp(toTime(100 + HOUR_HEIGHT * 9 + 9))).toBe('2024-01-10 09:15');
  });

  it('honours a finer snap', () => {
    expect(stamp(toTime(100 + HOUR_HEIGHT * 9 + 4, 5))).toBe('2024-01-10 09:05');
  });

  it('resolves to the exact minute when snapping is disabled', () => {
    expect(stamp(toTime(100 + HOUR_HEIGHT * 9 + 8, 0))).toBe('2024-01-10 09:10');
  });

  it('anchors to the given day, not to today', () => {
    const other = pointerToTime({
      pointerY: 100 + HOUR_HEIGHT * 9,
      containerTop: 100,
      hourHeight: HOUR_HEIGHT,
      dayAnchor: new Date(2025, 5, 20, 23, 45),
      snapMinutes: 15,
    });
    expect(stamp(other)).toBe('2025-06-20 09:00');
  });

  it('clamps a pointer past the bottom to the end of the day', () => {
    expect(stamp(toTime(100 + HOUR_HEIGHT * 30))).toBe('2024-01-11 00:00');
  });
});

describe('pointerToDay', () => {
  const toDay = (pointerX: number, dayWidth = 100, dayCount = 7) =>
    pointerToDay({ pointerX, containerLeft: 200, dayWidth, firstDay: DAY, dayCount });

  it('maps the first column to the first day', () => {
    expect(stamp(toDay(240))).toBe('2024-01-10 00:00');
  });

  it('maps an offset to its column index', () => {
    expect(stamp(toDay(200 + 250))).toBe('2024-01-12 00:00');
  });

  it('clamps a pointer left of the grid to the first day', () => {
    expect(stamp(toDay(10))).toBe('2024-01-10 00:00');
  });

  it('clamps a pointer past the last column to the last day', () => {
    expect(stamp(toDay(200 + 9_999))).toBe('2024-01-16 00:00');
  });

  it('returns the first day rather than dividing by a zero column width', () => {
    expect(pointerToDay({ pointerX: 500, containerLeft: 0, dayWidth: 0, firstDay: DAY, dayCount: 7 }))
      .toBe(DAY);
  });

  it('strips the time from the first day', () => {
    const withTimeOfDay = new Date(2024, 0, 10, 17, 42);
    const out = pointerToDay({
      pointerX: 100,
      containerLeft: 0,
      dayWidth: 100,
      firstDay: withTimeOfDay,
      dayCount: 7,
    });
    expect(stamp(out)).toBe('2024-01-11 00:00');
  });
});

describe('pointerToDateTime', () => {
  it('combines the column and the vertical offset', () => {
    const out = pointerToDateTime({
      pointerX: 250,
      pointerY: 100 + HOUR_HEIGHT * 14,
      containerRect: { top: 100, left: 0, width: 700, height: 1_152 },
      hourHeight: HOUR_HEIGHT,
      snapMinutes: 15,
      firstDay: DAY,
      dayCount: 7,
      dayWidth: 100,
    });
    expect(stamp(out)).toBe('2024-01-12 14:00');
  });
});

describe('dragRange', () => {
  it('keeps a forward drag in order', () => {
    const { start, end } = dragRange(at(9), at(11));
    expect([stamp(start), stamp(end)]).toEqual(['2024-01-10 09:00', '2024-01-10 11:00']);
  });

  it('normalises a backward drag so start precedes end', () => {
    const { start, end } = dragRange(at(11), at(9));
    expect([stamp(start), stamp(end)]).toEqual(['2024-01-10 09:00', '2024-01-10 11:00']);
  });

  it('enforces the minimum duration on a zero-length drag', () => {
    const { start, end } = dragRange(at(9), at(9));
    expect([stamp(start), stamp(end)]).toEqual(['2024-01-10 09:00', '2024-01-10 09:15']);
  });

  it('enforces the minimum duration on a short backward drag', () => {
    const { start, end } = dragRange(at(9, 10), at(9, 5));
    expect([stamp(start), stamp(end)]).toEqual(['2024-01-10 09:05', '2024-01-10 09:20']);
  });

  it('honours a custom minimum duration', () => {
    const { end } = dragRange(at(9), at(9, 5), 30);
    expect(stamp(end)).toBe('2024-01-10 09:30');
  });

  it('leaves a drag longer than the minimum untouched', () => {
    const { end } = dragRange(at(9), at(9, 45), 30);
    expect(stamp(end)).toBe('2024-01-10 09:45');
  });
});

describe('applyMoveDelta', () => {
  const move = (deltaMinutes: number, deltaDays = 0, snap = 15) =>
    applyMoveDelta(at(9), at(10), deltaMinutes, deltaDays, snap);

  it('shifts an event later by the snapped delta', () => {
    const { start, end } = move(30);
    expect([stamp(start), stamp(end)]).toEqual(['2024-01-10 09:30', '2024-01-10 10:30']);
  });

  it('shifts an event earlier by the snapped delta', () => {
    // Regression: the delta was snapped BEFORE its sign was taken, and `snapMinute` clamps
    // to [0, 1440] — so every negative delta collapsed to 0 and dragging an event to an
    // earlier time did nothing at all. Its sibling `applyResizeDelta` takes `Math.abs` first.
    const { start, end } = move(-60);
    expect([stamp(start), stamp(end)]).toEqual(['2024-01-10 08:00', '2024-01-10 09:00']);
  });

  it('snaps a negative delta to the grid like a positive one', () => {
    // 38 minutes rounds to the 45-minute slot, same as it would going forwards.
    expect(stamp(move(-38).start)).toBe('2024-01-10 08:15');
  });

  it('leaves the event where it is for a zero delta', () => {
    const { start, end } = move(0);
    expect([stamp(start), stamp(end)]).toEqual(['2024-01-10 09:00', '2024-01-10 10:00']);
  });

  it('moves across day columns', () => {
    const { start, end } = move(0, 2);
    expect([stamp(start), stamp(end)]).toEqual(['2024-01-12 09:00', '2024-01-12 10:00']);
  });

  it('moves backwards across day columns', () => {
    expect(stamp(move(0, -3).start)).toBe('2024-01-07 09:00');
  });

  it('combines a day shift with a minute shift', () => {
    const { start, end } = move(45, 1);
    expect([stamp(start), stamp(end)]).toEqual(['2024-01-11 09:45', '2024-01-11 10:45']);
  });

  it('preserves the event duration', () => {
    const { start, end } = applyMoveDelta(at(9), at(11, 30), 30, 1, 15);
    expect(end.getTime() - start.getTime()).toBe(150 * 60_000);
  });

  it('preserves the duration of a multi-day event', () => {
    const { start, end } = applyMoveDelta(at(22), at(2, 0, 11), 60, 0, 15);
    expect(end.getTime() - start.getTime()).toBe(4 * 60 * 60_000);
  });
});

describe('applyResizeDelta', () => {
  const resize = (
    deltaMinutes: number,
    edge: 'start' | 'end',
    snap = 15,
    minimum = 15,
  ) => applyResizeDelta(at(9), at(10), deltaMinutes, edge, snap, minimum);

  it('extends the end edge', () => {
    const { start, end } = resize(30, 'end');
    expect([stamp(start), stamp(end)]).toEqual(['2024-01-10 09:00', '2024-01-10 10:30']);
  });

  it('pulls the end edge in', () => {
    expect(stamp(resize(-30, 'end').end)).toBe('2024-01-10 09:30');
  });

  it('stops the end edge at the minimum duration', () => {
    expect(stamp(resize(-120, 'end').end)).toBe('2024-01-10 09:15');
  });

  it('leaves the start pinned when resizing the end', () => {
    expect(stamp(resize(90, 'end').start)).toBe('2024-01-10 09:00');
  });

  it('pulls the start edge back', () => {
    const { start, end } = resize(-30, 'start');
    expect([stamp(start), stamp(end)]).toEqual(['2024-01-10 08:30', '2024-01-10 10:00']);
  });

  it('pushes the start edge in', () => {
    expect(stamp(resize(30, 'start').start)).toBe('2024-01-10 09:30');
  });

  it('stops the start edge at the minimum duration', () => {
    expect(stamp(resize(120, 'start').start)).toBe('2024-01-10 09:45');
  });

  it('refuses to drag the start edge back across midnight', () => {
    const { start } = applyResizeDelta(at(0, 30), at(2), -120, 'start', 15, 15);
    expect(stamp(start)).toBe('2024-01-10 00:30');
  });

  it('leaves the end pinned when resizing the start', () => {
    expect(stamp(resize(-90, 'start').end)).toBe('2024-01-10 10:00');
  });

  it('snaps the delta to the grid', () => {
    expect(stamp(resize(38, 'end').end)).toBe('2024-01-10 10:45');
  });

  it('honours a custom minimum duration', () => {
    expect(stamp(resize(-120, 'end', 15, 45).end)).toBe('2024-01-10 09:45');
  });
});
