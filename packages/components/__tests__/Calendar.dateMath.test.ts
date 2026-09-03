import { describe, expect, it } from 'vitest';

import * as calendar from '../src/Calendar/helpers/dateMath';
import * as scheduler from '../src/Scheduler/helpers/dateMath';

const d = (y: number, m: number, day: number, h = 0, min = 0): Date =>
  new Date(y, m - 1, day, h, min, 0, 0);

describe('parseIsoDate', () => {
  it('parses a well-formed date at local midnight', () => {
    const parsed = calendar.parseIsoDate('2026-03-07')!;
    expect([parsed.getFullYear(), parsed.getMonth(), parsed.getDate()]).toEqual([2026, 2, 7]);
    expect(parsed.getHours()).toBe(0);
  });

  it('parses Feb 29 in a leap year', () => {
    expect(calendar.parseIsoDate('2024-02-29')).not.toBeNull();
  });

  it('rejects Feb 29 in a non-leap year instead of rolling to Mar 1', () => {
    expect(calendar.parseIsoDate('2023-02-29')).toBeNull();
  });

  it('rejects an impossible day-of-month', () => {
    expect(calendar.parseIsoDate('2026-02-31')).toBeNull();
    expect(calendar.parseIsoDate('2026-04-31')).toBeNull();
  });

  it('rejects an out-of-range month or day', () => {
    expect(calendar.parseIsoDate('2026-13-01')).toBeNull();
    expect(calendar.parseIsoDate('2026-00-01')).toBeNull();
    expect(calendar.parseIsoDate('2026-01-00')).toBeNull();
    expect(calendar.parseIsoDate('2026-01-32')).toBeNull();
  });

  it('requires zero-padded two-digit fields', () => {
    expect(calendar.parseIsoDate('2026-3-7')).toBeNull();
  });

  it('rejects a datetime, a partial date, and trailing text', () => {
    expect(calendar.parseIsoDate('2026-03-07T00:00:00Z')).toBeNull();
    expect(calendar.parseIsoDate('2026-03')).toBeNull();
    expect(calendar.parseIsoDate('2026-03-07 ')).toBeNull();
  });

  it('rejects an empty string and non-strings', () => {
    expect(calendar.parseIsoDate('')).toBeNull();
    expect(calendar.parseIsoDate(null as unknown as string)).toBeNull();
    expect(calendar.parseIsoDate(20260307 as unknown as string)).toBeNull();
  });

  it('round-trips through formatIsoDate', () => {
    expect(calendar.formatIsoDate(calendar.parseIsoDate('2026-03-07')!)).toBe('2026-03-07');
  });
});

describe('formatIsoDate', () => {
  it('renders in local time, not UTC', () => {
    // 23:30 local must stay on its own local day whatever the runner's offset.
    expect(calendar.formatIsoDate(d(2026, 3, 7, 23, 30))).toBe('2026-03-07');
  });

  it('zero-pads month and day', () => {
    expect(calendar.formatIsoDate(d(2026, 1, 5))).toBe('2026-01-05');
  });
});

describe('clampDate', () => {
  const lo = d(2026, 3, 1);
  const hi = d(2026, 3, 31);

  it('returns a date already inside the range', () => {
    expect(calendar.formatIsoDate(calendar.clampDate(d(2026, 3, 15), lo, hi))).toBe('2026-03-15');
  });

  it('raises a date below the lower bound', () => {
    expect(calendar.formatIsoDate(calendar.clampDate(d(2026, 1, 1), lo, hi))).toBe('2026-03-01');
  });

  it('lowers a date above the upper bound', () => {
    expect(calendar.formatIsoDate(calendar.clampDate(d(2026, 6, 1), lo, hi))).toBe('2026-03-31');
  });

  it('is inclusive at both bounds', () => {
    expect(calendar.clampDate(lo, lo, hi).getTime()).toBe(lo.getTime());
    expect(calendar.clampDate(hi, lo, hi).getTime()).toBe(hi.getTime());
  });

  it('applies only the bound that was given', () => {
    expect(calendar.formatIsoDate(calendar.clampDate(d(2026, 1, 1), lo))).toBe('2026-03-01');
    expect(calendar.formatIsoDate(calendar.clampDate(d(2026, 6, 1), undefined, hi))).toBe('2026-03-31');
  });

  it('passes a date through when neither bound is given', () => {
    expect(calendar.formatIsoDate(calendar.clampDate(d(2026, 6, 1)))).toBe('2026-06-01');
  });

  it('always returns a copy, never the input instance', () => {
    const input = d(2026, 3, 15);
    const out = calendar.clampDate(input, lo, hi);
    expect(out).not.toBe(input);
    expect(out.getTime()).toBe(input.getTime());
  });

  it('preserves the time of day when no clamping happens', () => {
    expect(calendar.clampDate(d(2026, 3, 15, 17, 42), lo, hi).getHours()).toBe(17);
  });
});

/**
 * `Calendar/helpers/dateMath.ts` and `Scheduler/helpers/dateMath.ts` are near-identical copies —
 * the Scheduler file's own header calls itself an interim subset pending a shared home. Until
 * they are merged, this pins that the shared surface actually agrees, so the two components can
 * never quietly drift apart on a date boundary.
 */
describe('shared surface agrees with the Scheduler copy', () => {
  const SAMPLES = [
    d(2024, 1, 1),
    d(2024, 1, 31, 9, 30),
    d(2024, 2, 29, 23, 59),
    d(2024, 3, 7, 12),
    d(2024, 12, 31, 23, 30),
    d(2026, 6, 15, 17, 42),
  ];

  const sameDate = (a: Date, b: Date) => expect(a.getTime()).toBe(b.getTime());

  it('agrees on toDayKey', () => {
    for (const s of SAMPLES) expect(calendar.toDayKey(s)).toBe(scheduler.toDayKey(s));
  });

  it('agrees on startOfDay and endOfDay', () => {
    for (const s of SAMPLES) {
      sameDate(calendar.startOfDay(s), scheduler.startOfDay(s));
      sameDate(calendar.endOfDay(s), scheduler.endOfDay(s));
    }
  });

  it('agrees on addDays across month and year boundaries', () => {
    for (const s of SAMPLES) {
      for (const n of [1, -1, 45, -400]) sameDate(calendar.addDays(s, n), scheduler.addDays(s, n));
    }
  });

  it('agrees on addMonths, including end-of-month clamping', () => {
    for (const s of SAMPLES) {
      for (const n of [1, -1, 13, -13]) sameDate(calendar.addMonths(s, n), scheduler.addMonths(s, n));
    }
  });

  it('agrees on addYears', () => {
    for (const s of SAMPLES) {
      for (const n of [1, -4]) sameDate(calendar.addYears(s, n), scheduler.addYears(s, n));
    }
  });

  it('agrees on week, month and year boundaries', () => {
    for (const s of SAMPLES) {
      for (const weekStart of [0, 1]) {
        sameDate(calendar.startOfWeek(s, weekStart), scheduler.startOfWeek(s, weekStart));
        sameDate(calendar.endOfWeek(s, weekStart), scheduler.endOfWeek(s, weekStart));
      }
      sameDate(calendar.startOfMonth(s), scheduler.startOfMonth(s));
      sameDate(calendar.endOfMonth(s), scheduler.endOfMonth(s));
      sameDate(calendar.startOfYear(s), scheduler.startOfYear(s));
      sameDate(calendar.endOfYear(s), scheduler.endOfYear(s));
    }
  });

  it('agrees on differenceInDays', () => {
    for (const a of SAMPLES) {
      for (const b of SAMPLES) {
        expect(calendar.differenceInDays(a, b)).toBe(scheduler.differenceInDays(a, b));
      }
    }
  });

  it('agrees on isoWeekNumber', () => {
    for (const s of SAMPLES) expect(calendar.isoWeekNumber(s)).toBe(scheduler.isoWeekNumber(s));
  });

  it('agrees on computeMonthGrid', () => {
    for (const s of SAMPLES) {
      for (const weekStart of [0, 1]) {
        expect(calendar.computeMonthGrid(s, weekStart).map(calendar.toDayKey)).toEqual(
          scheduler.computeMonthGrid(s, weekStart).map(scheduler.toDayKey),
        );
      }
    }
  });

  it('agrees on the same-period predicates', () => {
    for (const a of SAMPLES) {
      for (const b of SAMPLES) {
        expect(calendar.isSameDay(a, b)).toBe(scheduler.isSameDay(a, b));
        expect(calendar.isSameMonth(a, b)).toBe(scheduler.isSameMonth(a, b));
        expect(calendar.isSameYear(a, b)).toBe(scheduler.isSameYear(a, b));
      }
    }
  });

  it('agrees on intervalsOverlap and isWithin', () => {
    const [a, b, c] = [d(2024, 3, 7, 9), d(2024, 3, 7, 11), d(2024, 3, 7, 10)];
    expect(calendar.intervalsOverlap(a, b, c, d(2024, 3, 7, 12))).toBe(
      scheduler.intervalsOverlap(a, b, c, d(2024, 3, 7, 12)),
    );
    expect(calendar.isWithin(c, a, b)).toBe(scheduler.isWithin(c, a, b));
  });

  it('agrees on eachDayKeyInRange', () => {
    expect(calendar.eachDayKeyInRange(d(2024, 2, 26), d(2024, 3, 3))).toEqual(
      scheduler.eachDayKeyInRange(d(2024, 2, 26), d(2024, 3, 3)),
    );
  });

  it('agrees on the millisecond constants', () => {
    expect([calendar.MS_PER_MINUTE, calendar.MS_PER_HOUR, calendar.MS_PER_DAY]).toEqual([
      scheduler.MS_PER_MINUTE,
      scheduler.MS_PER_HOUR,
      scheduler.MS_PER_DAY,
    ]);
  });
});

describe('Calendar-only behaviour worth pinning', () => {
  it('computeMonthGrid always returns 42 cells', () => {
    for (const month of [1, 2, 9, 12]) {
      expect(calendar.computeMonthGrid(d(2024, month, 15))).toHaveLength(42);
    }
  });

  it('rangeOfDays builds consecutive local midnights', () => {
    expect(calendar.rangeOfDays(d(2026, 3, 7, 17), 3).map(calendar.toDayKey)).toEqual([
      '2026-03-07',
      '2026-03-08',
      '2026-03-09',
    ]);
  });

  it('min and max pick the earlier and later date', () => {
    const early = d(2026, 3, 7);
    const late = d(2026, 3, 9);
    expect(calendar.min(early, late)).toBe(early);
    expect(calendar.max(early, late)).toBe(late);
  });

  it('isValidDate rejects an invalid Date and non-Dates', () => {
    expect(calendar.isValidDate(d(2026, 3, 7))).toBe(true);
    expect(calendar.isValidDate(new Date('nonsense'))).toBe(false);
    expect(calendar.isValidDate('2026-03-07')).toBe(false);
  });
});
