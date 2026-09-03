import { describe, expect, it } from 'vitest';

import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addYears,
  computeMonthGrid,
  differenceInDays,
  eachDayInRange,
  eachDayKeyInRange,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  formatHHMM,
  fromDayKey,
  intervalsOverlap,
  isSameDay,
  isSameMonth,
  isSameYear,
  isValidDate,
  isWithin,
  isWorkingDay,
  isoWeekNumber,
  max,
  min,
  minutesSinceMidnight,
  pad2,
  parseHHMM,
  rangeOfDays,
  snapMinute,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toDayKey,
  withTime,
} from '../src/Scheduler/helpers/dateMath';

/** Local-time constructor — every helper here works in the local zone by design. */
const d = (y: number, m: number, day: number, h = 0, min_ = 0, s = 0): Date =>
  new Date(y, m - 1, day, h, min_, s, 0);

describe('pad2', () => {
  it('pads a single digit', () => {
    expect(pad2(7)).toBe('07');
  });

  it('leaves two digits alone', () => {
    expect(pad2(12)).toBe('12');
  });

  it('leaves three digits alone', () => {
    expect(pad2(123)).toBe('123');
  });
});

describe('toDayKey / fromDayKey', () => {
  it('renders an ISO day key in local time', () => {
    expect(toDayKey(d(2024, 3, 7, 23, 30))).toBe('2024-03-07');
  });

  it('zero-pads month and day', () => {
    expect(toDayKey(d(2024, 1, 5))).toBe('2024-01-05');
  });

  it('round-trips through fromDayKey at local midnight', () => {
    const parsed = fromDayKey('2024-03-07');
    expect([parsed.getFullYear(), parsed.getMonth(), parsed.getDate()]).toEqual([2024, 2, 7]);
    expect(parsed.getHours()).toBe(0);
  });

  it('round-trips any date back to the same key', () => {
    const original = d(2024, 11, 30, 17, 42);
    expect(toDayKey(fromDayKey(toDayKey(original)))).toBe('2024-11-30');
  });
});

describe('startOfDay / endOfDay', () => {
  it('clamps to local midnight', () => {
    expect(startOfDay(d(2024, 3, 7, 17, 42, 9)).getHours()).toBe(0);
  });

  it('clamps to the last millisecond of the day', () => {
    const end = endOfDay(d(2024, 3, 7, 9));
    expect([end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds()]).toEqual([
      23, 59, 59, 999,
    ]);
  });

  it('does not mutate its input', () => {
    const original = d(2024, 3, 7, 17, 42);
    startOfDay(original);
    expect(original.getHours()).toBe(17);
  });
});

describe('addDays / addMinutes / addHours', () => {
  it('adds whole days', () => {
    expect(toDayKey(addDays(d(2024, 3, 7), 5))).toBe('2024-03-12');
  });

  it('subtracts whole days', () => {
    expect(toDayKey(addDays(d(2024, 3, 7), -10))).toBe('2024-02-26');
  });

  it('rolls over a month boundary', () => {
    expect(toDayKey(addDays(d(2024, 1, 31), 1))).toBe('2024-02-01');
  });

  it('keeps the same local wall-clock hour across any day shift', () => {
    // The DST-safety property, asserted without depending on the runner's timezone.
    for (const offset of [1, 30, 120, 200, -75]) {
      expect(addDays(d(2024, 1, 15, 9, 30), offset).getHours()).toBe(9);
    }
  });

  it('adds minutes', () => {
    expect(addMinutes(d(2024, 3, 7, 9, 45), 30).getHours()).toBe(10);
  });

  it('adds hours', () => {
    expect(addHours(d(2024, 3, 7, 9), 3).getHours()).toBe(12);
  });
});

describe('addMonths', () => {
  it('adds whole months', () => {
    expect(toDayKey(addMonths(d(2024, 1, 15), 2))).toBe('2024-03-15');
  });

  it('clamps Jan 31 + 1 month to the end of February', () => {
    expect(toDayKey(addMonths(d(2024, 1, 31), 1))).toBe('2024-02-29');
  });

  it('clamps into a non-leap February', () => {
    expect(toDayKey(addMonths(d(2023, 1, 31), 1))).toBe('2023-02-28');
  });

  it('clamps across a year boundary', () => {
    expect(toDayKey(addMonths(d(2024, 1, 31), 13))).toBe('2025-02-28');
  });

  it('clamps when subtracting months', () => {
    expect(toDayKey(addMonths(d(2024, 3, 31), -1))).toBe('2024-02-29');
  });

  it('subtracts across a year boundary without clamping a valid date', () => {
    expect(toDayKey(addMonths(d(2024, 1, 31), -1))).toBe('2023-12-31');
  });

  it('preserves the time of day', () => {
    expect(addMonths(d(2024, 1, 15, 14, 30), 1).getHours()).toBe(14);
  });
});

describe('addYears', () => {
  it('adds whole years', () => {
    expect(toDayKey(addYears(d(2024, 3, 7), 3))).toBe('2027-03-07');
  });

  it('subtracts whole years', () => {
    expect(toDayKey(addYears(d(2024, 3, 7), -4))).toBe('2020-03-07');
  });
});

describe('same-period predicates', () => {
  it('isSameDay ignores the time of day', () => {
    expect(isSameDay(d(2024, 3, 7, 0, 1), d(2024, 3, 7, 23, 59))).toBe(true);
  });

  it('isSameDay separates adjacent days', () => {
    expect(isSameDay(d(2024, 3, 7, 23, 59), d(2024, 3, 8, 0, 1))).toBe(false);
  });

  it('isSameDay separates the same date in different years', () => {
    expect(isSameDay(d(2024, 3, 7), d(2023, 3, 7))).toBe(false);
  });

  it('isSameMonth matches within a month', () => {
    expect(isSameMonth(d(2024, 3, 1), d(2024, 3, 31))).toBe(true);
    expect(isSameMonth(d(2024, 3, 31), d(2024, 4, 1))).toBe(false);
  });

  it('isSameMonth separates the same month in different years', () => {
    expect(isSameMonth(d(2024, 3, 7), d(2023, 3, 7))).toBe(false);
  });

  it('isSameYear matches within a year', () => {
    expect(isSameYear(d(2024, 1, 1), d(2024, 12, 31))).toBe(true);
    expect(isSameYear(d(2024, 12, 31), d(2025, 1, 1))).toBe(false);
  });
});

describe('week / month / year boundaries', () => {
  it('startOfWeek defaults to Sunday', () => {
    // 2024-03-07 is a Thursday.
    expect(toDayKey(startOfWeek(d(2024, 3, 7)))).toBe('2024-03-03');
  });

  it('startOfWeek honours a Monday start', () => {
    expect(toDayKey(startOfWeek(d(2024, 3, 7), 1))).toBe('2024-03-04');
  });

  it('startOfWeek is idempotent on the first day of the week', () => {
    expect(toDayKey(startOfWeek(d(2024, 3, 3)))).toBe('2024-03-03');
  });

  it('startOfWeek clamps to midnight', () => {
    expect(startOfWeek(d(2024, 3, 7, 17, 42)).getHours()).toBe(0);
  });

  it('endOfWeek lands on the last millisecond of the seventh day', () => {
    const end = endOfWeek(d(2024, 3, 7));
    expect(toDayKey(end)).toBe('2024-03-09');
    expect(end.getHours()).toBe(23);
  });

  it('startOfMonth and endOfMonth bracket the month', () => {
    expect(toDayKey(startOfMonth(d(2024, 2, 17)))).toBe('2024-02-01');
    expect(toDayKey(endOfMonth(d(2024, 2, 17)))).toBe('2024-02-29');
  });

  it('endOfMonth knows a non-leap February', () => {
    expect(toDayKey(endOfMonth(d(2023, 2, 17)))).toBe('2023-02-28');
  });

  it('startOfYear and endOfYear bracket the year', () => {
    expect(toDayKey(startOfYear(d(2024, 6, 15)))).toBe('2024-01-01');
    expect(toDayKey(endOfYear(d(2024, 6, 15)))).toBe('2024-12-31');
  });
});

describe('differenceInDays', () => {
  it('counts forward calendar days', () => {
    expect(differenceInDays(d(2024, 3, 1), d(2024, 3, 8))).toBe(7);
  });

  it('counts backward as a negative', () => {
    expect(differenceInDays(d(2024, 3, 8), d(2024, 3, 1))).toBe(-7);
  });

  it('is zero within one day regardless of the times', () => {
    expect(differenceInDays(d(2024, 3, 7, 0, 1), d(2024, 3, 7, 23, 59))).toBe(0);
  });

  it('counts a single day even from late evening to early morning', () => {
    expect(differenceInDays(d(2024, 3, 7, 23, 59), d(2024, 3, 8, 0, 1))).toBe(1);
  });

  it('spans a leap February correctly', () => {
    expect(differenceInDays(d(2024, 2, 1), d(2024, 3, 1))).toBe(29);
  });
});

describe('minutesSinceMidnight / withTime', () => {
  it('converts a wall-clock time to minutes', () => {
    expect(minutesSinceMidnight(d(2024, 3, 7, 9, 30))).toBe(570);
  });

  it('counts seconds as a fraction of a minute', () => {
    expect(minutesSinceMidnight(d(2024, 3, 7, 0, 0, 30))).toBe(0.5);
  });

  it('is zero at midnight', () => {
    expect(minutesSinceMidnight(d(2024, 3, 7))).toBe(0);
  });

  it('withTime rebuilds a time on the anchor day', () => {
    const out = withTime(d(2024, 3, 7, 23, 59), 9, 30);
    expect(toDayKey(out)).toBe('2024-03-07');
    expect([out.getHours(), out.getMinutes(), out.getSeconds()]).toEqual([9, 30, 0]);
  });

  it('withTime accepts seconds', () => {
    expect(withTime(d(2024, 3, 7), 9, 30, 15).getSeconds()).toBe(15);
  });
});

describe('snapMinute', () => {
  it('snaps down to the nearest slot', () => {
    expect(snapMinute(97, 15)).toBe(90);
  });

  it('snaps up to the nearest slot', () => {
    expect(snapMinute(98, 15)).toBe(105);
  });

  it('rounds a half-slot up', () => {
    expect(snapMinute(7.5, 15)).toBe(15);
  });

  it('rounds to the whole minute when snapping is disabled', () => {
    expect(snapMinute(97.4, 0)).toBe(97);
  });

  it('treats a negative snap as disabled', () => {
    expect(snapMinute(97.4, -5)).toBe(97);
  });

  it('clamps below zero', () => {
    expect(snapMinute(-30, 15)).toBe(0);
  });

  it('clamps past the end of the day', () => {
    expect(snapMinute(2_000, 15)).toBe(1_440);
  });
});

describe('isWithin / intervalsOverlap', () => {
  it('isWithin is inclusive at both ends', () => {
    const start = d(2024, 3, 7, 9);
    const end = d(2024, 3, 7, 10);
    expect(isWithin(start, start, end)).toBe(true);
    expect(isWithin(end, start, end)).toBe(true);
  });

  it('isWithin rejects outside the interval', () => {
    expect(isWithin(d(2024, 3, 7, 8, 59), d(2024, 3, 7, 9), d(2024, 3, 7, 10))).toBe(false);
  });

  it('intervalsOverlap detects a partial overlap', () => {
    expect(
      intervalsOverlap(d(2024, 3, 7, 9), d(2024, 3, 7, 11), d(2024, 3, 7, 10), d(2024, 3, 7, 12)),
    ).toBe(true);
  });

  it('intervalsOverlap detects containment', () => {
    expect(
      intervalsOverlap(d(2024, 3, 7, 9), d(2024, 3, 7, 17), d(2024, 3, 7, 10), d(2024, 3, 7, 11)),
    ).toBe(true);
  });

  it('intervalsOverlap treats touching intervals as disjoint', () => {
    // Half-open: an event ending at 10:00 does not overlap one starting at 10:00.
    expect(
      intervalsOverlap(d(2024, 3, 7, 9), d(2024, 3, 7, 10), d(2024, 3, 7, 10), d(2024, 3, 7, 11)),
    ).toBe(false);
  });

  it('intervalsOverlap rejects disjoint intervals in either order', () => {
    const args = [d(2024, 3, 7, 9), d(2024, 3, 7, 10), d(2024, 3, 7, 14), d(2024, 3, 7, 15)] as const;
    expect(intervalsOverlap(...args)).toBe(false);
    expect(intervalsOverlap(args[2], args[3], args[0], args[1])).toBe(false);
  });
});

describe('eachDayKeyInRange / eachDayInRange', () => {
  it('lists every day inclusive of both ends', () => {
    expect(eachDayKeyInRange(d(2024, 3, 7), d(2024, 3, 10))).toEqual([
      '2024-03-07',
      '2024-03-08',
      '2024-03-09',
      '2024-03-10',
    ]);
  });

  it('returns a single day when start and end share one', () => {
    expect(eachDayKeyInRange(d(2024, 3, 7, 1), d(2024, 3, 7, 23))).toEqual(['2024-03-07']);
  });

  it('returns nothing for an inverted range', () => {
    expect(eachDayKeyInRange(d(2024, 3, 10), d(2024, 3, 7))).toEqual([]);
  });

  it('eachDayInRange returns local midnights', () => {
    const days = eachDayInRange(d(2024, 3, 7, 17), d(2024, 3, 9, 3));
    expect(days).toHaveLength(3);
    expect(days.every((day) => day.getHours() === 0)).toBe(true);
  });

  it('caps a pathological range rather than looping', () => {
    expect(eachDayKeyInRange(d(2000, 1, 1), d(2024, 1, 1)).length).toBeLessThanOrEqual(1_100);
  });
});

describe('computeMonthGrid', () => {
  it('always returns exactly 42 cells', () => {
    for (const month of [1, 2, 6, 12]) {
      expect(computeMonthGrid(d(2024, month, 15))).toHaveLength(42);
    }
  });

  it('starts on the week containing the first of the month', () => {
    // 2024-03-01 is a Friday, so a Sunday-start grid begins on Feb 25.
    expect(toDayKey(computeMonthGrid(d(2024, 3, 15))[0]!)).toBe('2024-02-25');
  });

  it('honours a Monday week start', () => {
    expect(toDayKey(computeMonthGrid(d(2024, 3, 15), 1)[0]!)).toBe('2024-02-26');
  });

  it('runs consecutively with no gaps', () => {
    const cells = computeMonthGrid(d(2024, 3, 15));
    for (let i = 1; i < cells.length; i++) {
      expect(differenceInDays(cells[i - 1]!, cells[i]!)).toBe(1);
    }
  });

  it('covers every day of the month', () => {
    const keys = computeMonthGrid(d(2024, 2, 15)).map(toDayKey);
    expect(keys).toContain('2024-02-01');
    expect(keys).toContain('2024-02-29');
  });
});

describe('rangeOfDays', () => {
  it('builds n consecutive days from local midnight', () => {
    expect(rangeOfDays(d(2024, 3, 7, 17), 3).map(toDayKey)).toEqual([
      '2024-03-07',
      '2024-03-08',
      '2024-03-09',
    ]);
  });

  it('returns nothing for a non-positive count', () => {
    expect(rangeOfDays(d(2024, 3, 7), 0)).toEqual([]);
  });
});

describe('isoWeekNumber', () => {
  it('puts Jan 1 2024 in week 1 — it is a Monday', () => {
    expect(isoWeekNumber(d(2024, 1, 1))).toBe(1);
  });

  it('puts Jan 1 2021 in week 53 of the previous ISO year', () => {
    // 2021-01-01 is a Friday, so ISO assigns it to 2020's final week.
    expect(isoWeekNumber(d(2021, 1, 1))).toBe(53);
  });

  it('counts up through the year', () => {
    expect(isoWeekNumber(d(2024, 1, 8))).toBe(2);
    expect(isoWeekNumber(d(2024, 12, 30))).toBe(1); // belongs to ISO week 1 of 2025
  });

  it('gives the same number to every day of one ISO week', () => {
    const week = [8, 9, 10, 11, 12, 13, 14].map((day) => isoWeekNumber(d(2024, 1, day)));
    expect(new Set(week).size).toBe(1);
  });
});

describe('parseHHMM / formatHHMM', () => {
  it('parses a padded time', () => {
    expect(parseHHMM('09:30')).toBe(570);
  });

  it('parses an unpadded time', () => {
    expect(parseHHMM('9:5')).toBe(545);
  });

  it('parses midnight as zero', () => {
    expect(parseHHMM('00:00')).toBe(0);
  });

  it('formats minutes as a padded 24-hour time', () => {
    expect(formatHHMM(570)).toBe('09:30');
  });

  it('round-trips', () => {
    expect(formatHHMM(parseHHMM('17:45'))).toBe('17:45');
  });

  it('clamps below zero', () => {
    expect(formatHHMM(-30)).toBe('00:00');
  });

  it('clamps to the last minute of the day', () => {
    expect(formatHHMM(1_440)).toBe('23:59');
  });

  it('rounds a fractional minute', () => {
    expect(formatHHMM(570.6)).toBe('09:31');
  });
});

describe('isWorkingDay', () => {
  it('accepts a weekday in the working set', () => {
    // 2024-03-07 is a Thursday (4).
    expect(isWorkingDay(d(2024, 3, 7), [1, 2, 3, 4, 5])).toBe(true);
  });

  it('rejects a weekend day', () => {
    expect(isWorkingDay(d(2024, 3, 9), [1, 2, 3, 4, 5])).toBe(false);
  });

  it('rejects everything for an empty working set', () => {
    expect(isWorkingDay(d(2024, 3, 7), [])).toBe(false);
  });
});

describe('min / max / isValidDate', () => {
  it('min returns the earlier date', () => {
    const early = d(2024, 3, 7);
    expect(min(early, d(2024, 3, 9))).toBe(early);
  });

  it('max returns the later date', () => {
    const late = d(2024, 3, 9);
    expect(max(d(2024, 3, 7), late)).toBe(late);
  });

  it('min and max return the first argument on a tie', () => {
    const a = d(2024, 3, 7);
    const b = d(2024, 3, 7);
    expect(min(a, b)).toBe(a);
    expect(max(a, b)).toBe(a);
  });

  it('isValidDate accepts a real Date', () => {
    expect(isValidDate(d(2024, 3, 7))).toBe(true);
  });

  it('isValidDate rejects an invalid Date', () => {
    expect(isValidDate(new Date('nonsense'))).toBe(false);
  });

  it('isValidDate rejects non-Dates', () => {
    expect(isValidDate('2024-03-07')).toBe(false);
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
    expect(isValidDate(1_709_769_600_000)).toBe(false);
  });
});
