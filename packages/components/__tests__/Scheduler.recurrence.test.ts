import { describe, expect, it } from 'vitest';

import type { RecurrenceRule, SchedulerEvent } from '../src/Scheduler/Scheduler.types';
import {
  addRecurrenceException,
  describeRecurrence,
  expandRecurrence,
  weekdayFromDate,
} from '../src/Scheduler/helpers/recurrence';

/** 2024 is a leap year, and Jan 1 2024 is a Monday — both used deliberately below. */
const at = (y: number, m: number, d: number, h = 9, min = 0): Date =>
  new Date(y, m - 1, d, h, min, 0, 0);

const event = (start: Date, end: Date, recurrence?: RecurrenceRule): SchedulerEvent => ({
  id: 'e1',
  title: 'Standup',
  start,
  end,
  recurrence,
});

const hourLong = (start: Date, recurrence?: RecurrenceRule): SchedulerEvent =>
  event(start, new Date(start.getTime() + 60 * 60_000), recurrence);

/** Instance starts as `YYYY-MM-DD`, which is what the assertions below read on. */
const days = (instances: SchedulerEvent[]): string[] =>
  instances.map(
    (i) =>
      `${i.start.getFullYear()}-${String(i.start.getMonth() + 1).padStart(2, '0')}-${String(
        i.start.getDate(),
      ).padStart(2, '0')}`,
  );

describe('weekdayFromDate', () => {
  it('maps each weekday to its RRULE code', () => {
    expect(weekdayFromDate(at(2024, 1, 1))).toBe('MO');
    expect(weekdayFromDate(at(2024, 1, 6))).toBe('SA');
    expect(weekdayFromDate(at(2024, 1, 7))).toBe('SU');
  });
});

describe('expandRecurrence — non-recurring events', () => {
  it('returns the event itself when it overlaps the range', () => {
    const e = hourLong(at(2024, 1, 10));
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 8, 0), rangeEnd: at(2024, 1, 14, 23) });
    expect(out).toEqual([e]);
  });

  it('returns nothing when it falls outside the range', () => {
    const e = hourLong(at(2024, 1, 10));
    expect(
      expandRecurrence(e, { rangeStart: at(2024, 2, 1, 0), rangeEnd: at(2024, 2, 29, 23) }),
    ).toEqual([]);
  });

  it('includes a multi-day event that merely straddles the range', () => {
    const e = event(at(2024, 1, 1, 8), at(2024, 1, 31, 17));
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 10, 0), rangeEnd: at(2024, 1, 12, 23) });
    expect(out).toHaveLength(1);
  });
});

describe('expandRecurrence — daily', () => {
  it('yields one instance per day across the range', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'daily' });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 5, 23) });
    expect(days(out)).toEqual(['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05']);
  });

  it('honours interval', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'daily', interval: 3 });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 10, 23) });
    expect(days(out)).toEqual(['2024-01-01', '2024-01-04', '2024-01-07', '2024-01-10']);
  });

  it('treats a non-positive interval as 1 rather than looping', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'daily', interval: 0 });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 3, 23) });
    expect(days(out)).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
  });

  it('preserves the series time-of-day on every instance', () => {
    const e = hourLong(at(2024, 1, 1, 14, 30), { freq: 'daily' });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 3, 23) });
    expect(out.map((i) => [i.start.getHours(), i.start.getMinutes()])).toEqual([
      [14, 30],
      [14, 30],
      [14, 30],
    ]);
  });

  it('gives each instance the base duration', () => {
    const e = event(at(2024, 1, 1, 9), at(2024, 1, 1, 10, 45), { freq: 'daily' });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 3, 23) });
    for (const i of out) {
      expect(i.end.getTime() - i.start.getTime()).toBe(105 * 60_000);
    }
  });

  it('gives each instance a distinct id derived from the base id', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'daily' });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 3, 23) });
    expect(new Set(out.map((i) => i.id)).size).toBe(3);
    for (const i of out) expect(i.id.startsWith('e1::')).toBe(true);
  });

  it('carries the base event fields onto every instance', () => {
    const e: SchedulerEvent = {
      ...hourLong(at(2024, 1, 1), { freq: 'daily' }),
      calendarId: 'work',
      color: 'primary',
    };
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 2, 23) });
    for (const i of out) {
      expect(i.title).toBe('Standup');
      expect(i.calendarId).toBe('work');
      expect(i.color).toBe('primary');
    }
  });

  it('never yields an instance before the series start', () => {
    const e = hourLong(at(2024, 1, 10), { freq: 'daily' });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 12, 23) });
    expect(days(out)).toEqual(['2024-01-10', '2024-01-11', '2024-01-12']);
  });

  it('finds a long-running series in a range years after it began', () => {
    // Regression: the walk used to step one period at a time from the series start and
    // exhaust its budget before reaching the viewport, so an old daily event rendered
    // nothing at all — no error, just an empty calendar.
    const e = hourLong(at(2020, 1, 1), { freq: 'daily' });
    const out = expandRecurrence(e, { rangeStart: at(2024, 6, 3, 0), rangeEnd: at(2024, 6, 9, 23) });
    expect(days(out)).toEqual([
      '2024-06-03',
      '2024-06-04',
      '2024-06-05',
      '2024-06-06',
      '2024-06-07',
      '2024-06-08',
      '2024-06-09',
    ]);
  });

  it('keeps interval phase intact when skipping ahead to a distant range', () => {
    // Jan 1 2020 + 3n days; the range must only contain days on that lattice.
    const e = hourLong(at(2020, 1, 1), { freq: 'daily', interval: 3 });
    const out = expandRecurrence(e, { rangeStart: at(2024, 6, 3, 0), rangeEnd: at(2024, 6, 12, 23) });
    const dayGap = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000);
    expect(out.length).toBeGreaterThan(0);
    for (const i of out) expect(dayGap(at(2020, 1, 1), i.start) % 3).toBe(0);
  });

  it('includes a multi-day recurring instance that started before the range', () => {
    const e = event(at(2024, 6, 1, 9), at(2024, 6, 4, 17), { freq: 'daily', interval: 10 });
    const out = expandRecurrence(e, { rangeStart: at(2024, 6, 12, 0), rangeEnd: at(2024, 6, 13, 23) });
    // The Jun 11 occurrence runs to Jun 14, so it reaches into the range.
    expect(days(out)).toEqual(['2024-06-11']);
  });
});

describe('expandRecurrence — weekly', () => {
  it('repeats on the series weekday when byDay is absent', () => {
    const e = hourLong(at(2024, 1, 3), { freq: 'weekly' }); // Wednesday
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 21, 23) });
    expect(days(out)).toEqual(['2024-01-03', '2024-01-10', '2024-01-17']);
  });

  it('honours interval', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'weekly', interval: 2 });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 2, 29, 23) });
    expect(days(out)).toEqual(['2024-01-01', '2024-01-15', '2024-01-29', '2024-02-12', '2024-02-26']);
  });

  it('yields every byDay in the week', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'weekly', byDay: ['MO', 'WE', 'FR'] });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 7, 23) });
    expect(days(out)).toEqual(['2024-01-01', '2024-01-03', '2024-01-05']);
  });

  it('returns instances in chronological order regardless of byDay order', () => {
    // Regression: byDay was walked in the caller's order from the series weekday, so
    // ['MO','FR'] from a Wednesday start emitted Mon 8th BEFORE Fri 5th. Anything reading
    // the array in order — or taking [0] as "next occurrence" — got the wrong answer.
    const wednesday = at(2024, 1, 3);
    const out = expandRecurrence(hourLong(wednesday, { freq: 'weekly', byDay: ['MO', 'FR'] }), {
      rangeStart: at(2024, 1, 1, 0),
      rangeEnd: at(2024, 1, 21, 23),
    });
    expect(days(out)).toEqual([
      '2024-01-05',
      '2024-01-08',
      '2024-01-12',
      '2024-01-15',
      '2024-01-19',
    ]);
  });

  it('produces the same series whichever order byDay is written in', () => {
    const wednesday = at(2024, 1, 3);
    const range = { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 21, 23) };
    const forwards = expandRecurrence(
      hourLong(wednesday, { freq: 'weekly', byDay: ['MO', 'FR'] }),
      range,
    );
    const backwards = expandRecurrence(
      hourLong(wednesday, { freq: 'weekly', byDay: ['FR', 'MO'] }),
      range,
    );
    expect(days(forwards)).toEqual(days(backwards));
  });

  it('finds a weekly series in a range years after it began', () => {
    const e = hourLong(at(2020, 1, 6), { freq: 'weekly' }); // Monday
    const out = expandRecurrence(e, { rangeStart: at(2024, 6, 1, 0), rangeEnd: at(2024, 6, 30, 23) });
    expect(days(out)).toEqual(['2024-06-03', '2024-06-10', '2024-06-17', '2024-06-24']);
  });
});

describe('expandRecurrence — monthly', () => {
  it('repeats on the series day-of-month', () => {
    const e = hourLong(at(2024, 1, 15), { freq: 'monthly' });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 4, 30, 23) });
    expect(days(out)).toEqual(['2024-01-15', '2024-02-15', '2024-03-15', '2024-04-15']);
  });

  it('skips months without the series day rather than drifting into the next one', () => {
    // Regression: the cursor was rebuilt as `new Date(y, m, 31)`, which rolls February over
    // into March. A "monthly on the 31st" series came out as Jan 31, Mar 2, May 1 — wrong
    // dates, and February *and* April silently lost.
    const e = hourLong(at(2024, 1, 31), { freq: 'monthly' });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 6, 30, 23) });
    expect(days(out)).toEqual(['2024-01-31', '2024-03-31', '2024-05-31']);
  });

  it('skips short months for an explicit byMonthDay too', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'monthly', byMonthDay: [31] });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 5, 31, 23) });
    expect(days(out)).toEqual(['2024-01-31', '2024-03-31', '2024-05-31']);
  });

  it('yields multiple byMonthDay entries in ascending order', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'monthly', byMonthDay: [20, 5] });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 2, 29, 23) });
    expect(days(out)).toEqual(['2024-01-05', '2024-01-20', '2024-02-05', '2024-02-20']);
  });

  it('honours interval', () => {
    const e = hourLong(at(2024, 1, 10), { freq: 'monthly', interval: 3 });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 12, 31, 23) });
    expect(days(out)).toEqual(['2024-01-10', '2024-04-10', '2024-07-10', '2024-10-10']);
  });

  it('resolves bySetPos -1 as the last matching weekday of the month', () => {
    const e = hourLong(at(2024, 1, 25), { freq: 'monthly', bySetPos: -1, byDay: ['TH'] });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 4, 30, 23) });
    expect(days(out)).toEqual(['2024-01-25', '2024-02-29', '2024-03-28', '2024-04-25']);
  });

  it('resolves a positive bySetPos as the nth matching weekday', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'monthly', bySetPos: 2, byDay: ['TU'] });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 3, 31, 23) });
    expect(days(out)).toEqual(['2024-01-09', '2024-02-13', '2024-03-12']);
  });

  it('yields nothing for a bySetPos the month cannot satisfy', () => {
    // February 2026 starts on a Sunday and has exactly four Thursdays — no fifth.
    const e = hourLong(at(2026, 1, 1), { freq: 'monthly', bySetPos: 5, byDay: ['TH'] });
    const out = expandRecurrence(e, { rangeStart: at(2026, 2, 1, 0), rangeEnd: at(2026, 2, 28, 23) });
    expect(out).toEqual([]);
  });

  it('finds a monthly series in a range years after it began', () => {
    const e = hourLong(at(2018, 3, 12), { freq: 'monthly' });
    const out = expandRecurrence(e, { rangeStart: at(2024, 6, 1, 0), rangeEnd: at(2024, 6, 30, 23) });
    expect(days(out)).toEqual(['2024-06-12']);
  });
});

describe('expandRecurrence — yearly', () => {
  it('repeats on the same calendar date each year', () => {
    const e = hourLong(at(2024, 3, 14), { freq: 'yearly' });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2027, 12, 31, 23) });
    expect(days(out)).toEqual(['2024-03-14', '2025-03-14', '2026-03-14', '2027-03-14']);
  });

  it('skips non-leap years for a Feb 29 series instead of sliding to Mar 1', () => {
    // Regression: `setFullYear` on Feb 29 rolls over to Mar 1 and the whole series drifted
    // from there — 2024-02-29, 2025-03-01, 2026-03-01.
    const e = hourLong(at(2024, 2, 29), { freq: 'yearly' });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2032, 12, 31, 23) });
    expect(days(out)).toEqual(['2024-02-29', '2028-02-29', '2032-02-29']);
  });

  it('honours interval', () => {
    const e = hourLong(at(2024, 3, 14), { freq: 'yearly', interval: 2 });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2030, 12, 31, 23) });
    expect(days(out)).toEqual(['2024-03-14', '2026-03-14', '2028-03-14', '2030-03-14']);
  });
});

describe('expandRecurrence — bounds', () => {
  it('stops after `count` occurrences', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'daily', count: 3 });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 31, 23) });
    expect(days(out)).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
  });

  it('counts occurrences from the series start, not from the range', () => {
    // A count-bounded series that ran out before the range shows nothing in it.
    const e = hourLong(at(2024, 1, 1), { freq: 'daily', count: 3 });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 10, 0), rangeEnd: at(2024, 1, 31, 23) });
    expect(out).toEqual([]);
  });

  it('stops at `until`', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'daily', until: at(2024, 1, 4, 23) });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 31, 23) });
    expect(days(out)).toEqual(['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04']);
  });

  it('excludes an `until` boundary that falls mid-day before the instance time', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'daily', until: at(2024, 1, 4, 8) });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 31, 23) });
    expect(days(out)).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
  });

  it('drops occurrences listed in `exceptions`', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'daily', exceptions: [at(2024, 1, 3, 0)] });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 5, 23) });
    expect(days(out)).toEqual(['2024-01-01', '2024-01-02', '2024-01-04', '2024-01-05']);
  });

  it('matches an exception on the whole day, not the exact instant', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'daily', exceptions: [at(2024, 1, 3, 17, 42)] });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 4, 23) });
    expect(days(out)).toEqual(['2024-01-01', '2024-01-02', '2024-01-04']);
  });

  it('does not spend an exception against `count`', () => {
    const e = hourLong(at(2024, 1, 1), {
      freq: 'daily',
      count: 3,
      exceptions: [at(2024, 1, 2, 0)],
    });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 31, 23) });
    expect(days(out)).toEqual(['2024-01-01', '2024-01-03', '2024-01-04']);
  });

  it('caps yielded instances at maxInstances', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'daily' });
    const out = expandRecurrence(e, {
      rangeStart: at(2024, 1, 1, 0),
      rangeEnd: at(2024, 12, 31, 23),
      maxInstances: 10,
    });
    expect(out).toHaveLength(10);
  });

  it('expands a full year of daily occurrences under the default cap', () => {
    const e = hourLong(at(2024, 1, 1), { freq: 'daily' });
    const out = expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 12, 31, 23) });
    expect(out).toHaveLength(366); // 2024 is a leap year
  });

  it('returns an empty list when the range precedes the series', () => {
    const e = hourLong(at(2024, 6, 1), { freq: 'daily' });
    expect(
      expandRecurrence(e, { rangeStart: at(2024, 1, 1, 0), rangeEnd: at(2024, 1, 31, 23) }),
    ).toEqual([]);
  });
});

describe('addRecurrenceException', () => {
  it('appends a date to an empty exception list', () => {
    const rule: RecurrenceRule = { freq: 'daily' };
    expect(addRecurrenceException(rule, at(2024, 1, 3)).exceptions).toEqual([at(2024, 1, 3)]);
  });

  it('appends alongside existing exceptions', () => {
    const rule: RecurrenceRule = { freq: 'daily', exceptions: [at(2024, 1, 3)] };
    expect(addRecurrenceException(rule, at(2024, 1, 5)).exceptions).toHaveLength(2);
  });

  it('is a no-op when the day is already excepted, whatever the time', () => {
    const rule: RecurrenceRule = { freq: 'daily', exceptions: [at(2024, 1, 3, 9)] };
    expect(addRecurrenceException(rule, at(2024, 1, 3, 18))).toBe(rule);
  });

  it('does not mutate the rule it was given', () => {
    const rule: RecurrenceRule = { freq: 'daily' };
    addRecurrenceException(rule, at(2024, 1, 3));
    expect(rule.exceptions).toBeUndefined();
  });
});

describe('describeRecurrence', () => {
  const labels = {
    none: 'Does not repeat',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Annually',
    custom: 'Custom',
  };

  it('describes an absent rule', () => {
    expect(describeRecurrence(undefined, labels)).toBe('Does not repeat');
  });

  it('describes each simple frequency', () => {
    expect(describeRecurrence({ freq: 'daily' }, labels)).toBe('Daily');
    expect(describeRecurrence({ freq: 'weekly' }, labels)).toBe('Weekly');
    expect(describeRecurrence({ freq: 'monthly' }, labels)).toBe('Monthly');
    expect(describeRecurrence({ freq: 'yearly' }, labels)).toBe('Annually');
  });

  it('treats an explicit interval of 1 as simple', () => {
    expect(describeRecurrence({ freq: 'daily', interval: 1 }, labels)).toBe('Daily');
  });

  it('falls back to custom for anything the labels cannot express', () => {
    expect(describeRecurrence({ freq: 'daily', interval: 2 }, labels)).toBe('Custom');
    expect(describeRecurrence({ freq: 'weekly', byDay: ['MO'] }, labels)).toBe('Custom');
    expect(describeRecurrence({ freq: 'monthly', byMonthDay: [1] }, labels)).toBe('Custom');
    expect(describeRecurrence({ freq: 'monthly', bySetPos: -1 }, labels)).toBe('Custom');
    expect(describeRecurrence({ freq: 'daily', count: 5 }, labels)).toBe('Custom');
    expect(describeRecurrence({ freq: 'daily', until: at(2024, 2, 1) }, labels)).toBe('Custom');
  });
});
