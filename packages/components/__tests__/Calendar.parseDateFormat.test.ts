import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { formatDate, parseDateFormat } from '../src/Calendar/helpers/parseDateFormat';

const d = (y: number, m: number, day: number): Date => new Date(y, m - 1, day, 0, 0, 0, 0);

/** `YYYY-MM-DD` of a parse result, or `null` — what most assertions read on. */
const iso = (date: Date | null): string | null =>
  date === null
    ? null
    : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate(),
      ).padStart(2, '0')}`;

describe('parseDateFormat — numeric patterns', () => {
  it('parses MM/dd/yyyy', () => {
    expect(iso(parseDateFormat('03/07/2026', 'MM/dd/yyyy'))).toBe('2026-03-07');
  });

  it('parses dd/MM/yyyy — field order follows the format, not the value', () => {
    expect(iso(parseDateFormat('03/07/2026', 'dd/MM/yyyy'))).toBe('2026-07-03');
  });

  it('parses yyyy-MM-dd', () => {
    expect(iso(parseDateFormat('2026-03-07', 'yyyy-MM-dd'))).toBe('2026-03-07');
  });

  it('accepts unpadded fields for the single-letter tokens', () => {
    expect(iso(parseDateFormat('3/7/2026', 'M/d/yyyy'))).toBe('2026-03-07');
  });

  it('accepts unpadded fields against the padded tokens too', () => {
    expect(iso(parseDateFormat('3/7/2026', 'MM/dd/yyyy'))).toBe('2026-03-07');
  });

  it('returns a date at local midnight', () => {
    const parsed = parseDateFormat('03/07/2026', 'MM/dd/yyyy')!;
    expect([parsed.getHours(), parsed.getMinutes(), parsed.getSeconds()]).toEqual([0, 0, 0]);
  });
});

describe('parseDateFormat — separator permissiveness', () => {
  it('accepts a different separator than the format uses', () => {
    expect(iso(parseDateFormat('03-07-2026', 'MM/dd/yyyy'))).toBe('2026-03-07');
  });

  it('accepts spaces as separators', () => {
    expect(iso(parseDateFormat('03 07 2026', 'MM/dd/yyyy'))).toBe('2026-03-07');
  });

  it('accepts runs of mixed separators', () => {
    expect(iso(parseDateFormat('03 . - 07 / 2026', 'MM/dd/yyyy'))).toBe('2026-03-07');
  });

  it('trims surrounding whitespace', () => {
    expect(iso(parseDateFormat('  03/07/2026  ', 'MM/dd/yyyy'))).toBe('2026-03-07');
  });

  it('ignores trailing fragments beyond the format', () => {
    // Documented leniency: extra fields past the last token are simply not consumed.
    expect(iso(parseDateFormat('03/07/2026/99', 'MM/dd/yyyy'))).toBe('2026-03-07');
  });
});

describe('parseDateFormat — month names', () => {
  it('parses a full month name', () => {
    expect(iso(parseDateFormat('January 5, 2026', 'MMMM d, yyyy'))).toBe('2026-01-05');
  });

  it('parses a short month name', () => {
    expect(iso(parseDateFormat('Mar 7 2026', 'MMM d yyyy'))).toBe('2026-03-07');
  });

  it('is case-insensitive on month names', () => {
    expect(iso(parseDateFormat('MARCH 7 2026', 'MMMM d yyyy'))).toBe('2026-03-07');
    expect(iso(parseDateFormat('march 7 2026', 'MMMM d yyyy'))).toBe('2026-03-07');
  });

  it('accepts a short name against the long token and vice versa', () => {
    expect(iso(parseDateFormat('Mar 7 2026', 'MMMM d yyyy'))).toBe('2026-03-07');
    expect(iso(parseDateFormat('March 7 2026', 'MMM d yyyy'))).toBe('2026-03-07');
  });

  it('parses a month name in the given locale', () => {
    expect(iso(parseDateFormat('7 mars 2026', 'd MMMM yyyy', 'fr-FR'))).toBe('2026-03-07');
  });

  it('rejects a month name from the wrong locale', () => {
    expect(parseDateFormat('7 mars 2026', 'd MMMM yyyy', 'en-US')).toBeNull();
  });

  it('rejects an unknown month name', () => {
    expect(parseDateFormat('Smarch 7 2026', 'MMMM d yyyy')).toBeNull();
  });
});

describe('parseDateFormat — two-digit years', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15));
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it('pivots a nearby year into the current century', () => {
    expect(iso(parseDateFormat('03/07/26', 'MM/dd/yy'))).toBe('2026-03-07');
  });

  it('pivots a year below the window back a century', () => {
    // Window is 1976–2075, so 99 → 1999.
    expect(iso(parseDateFormat('03/07/99', 'MM/dd/yy'))).toBe('1999-03-07');
  });

  it('keeps a year at the top of the window in this century', () => {
    expect(iso(parseDateFormat('03/07/70', 'MM/dd/yy'))).toBe('2070-03-07');
  });

  it('accepts a single-digit two-digit year', () => {
    expect(iso(parseDateFormat('03/07/5', 'MM/dd/yy'))).toBe('2005-03-07');
  });

  it('rejects a four-digit value against the yy token', () => {
    expect(parseDateFormat('03/07/2026', 'MM/dd/yy')).toBeNull();
  });
});

describe('parseDateFormat — rejections', () => {
  it('rejects an empty or blank input', () => {
    expect(parseDateFormat('', 'MM/dd/yyyy')).toBeNull();
    expect(parseDateFormat('   ', 'MM/dd/yyyy')).toBeNull();
  });

  it('rejects a non-string input', () => {
    expect(parseDateFormat(null as unknown as string, 'MM/dd/yyyy')).toBeNull();
    expect(parseDateFormat(20260307 as unknown as string, 'MM/dd/yyyy')).toBeNull();
  });

  it('rejects a value with too few fields', () => {
    expect(parseDateFormat('03/07', 'MM/dd/yyyy')).toBeNull();
  });

  it('rejects non-numeric fields', () => {
    expect(parseDateFormat('ab/cd/efgh', 'MM/dd/yyyy')).toBeNull();
  });

  it('rejects a two-digit year against the yyyy token', () => {
    expect(parseDateFormat('03/07/26', 'MM/dd/yyyy')).toBeNull();
  });

  it('rejects an out-of-range month', () => {
    expect(parseDateFormat('13/07/2026', 'MM/dd/yyyy')).toBeNull();
    expect(parseDateFormat('00/07/2026', 'MM/dd/yyyy')).toBeNull();
  });

  it('rejects an out-of-range day', () => {
    expect(parseDateFormat('03/32/2026', 'MM/dd/yyyy')).toBeNull();
    expect(parseDateFormat('03/00/2026', 'MM/dd/yyyy')).toBeNull();
  });

  it('rejects an over-long numeric field', () => {
    expect(parseDateFormat('003/07/2026', 'MM/dd/yyyy')).toBeNull();
  });

  it('rejects a day the month does not have, rather than rolling over', () => {
    expect(parseDateFormat('02/31/2026', 'MM/dd/yyyy')).toBeNull();
    expect(parseDateFormat('04/31/2026', 'MM/dd/yyyy')).toBeNull();
  });

  it('rejects Feb 29 in a non-leap year but accepts it in a leap year', () => {
    expect(parseDateFormat('02/29/2023', 'MM/dd/yyyy')).toBeNull();
    expect(iso(parseDateFormat('02/29/2024', 'MM/dd/yyyy'))).toBe('2024-02-29');
  });

  it('rejects a format with no recognised tokens', () => {
    expect(parseDateFormat('03/07/2026', 'nonsense')).toBeNull();
  });

  it('rejects a format missing one of the three fields', () => {
    expect(parseDateFormat('03/2026', 'MM/yyyy')).toBeNull();
  });
});

describe('formatDate', () => {
  const date = d(2026, 3, 7);

  it('formats numeric patterns with padding', () => {
    expect(formatDate(date, 'MM/dd/yyyy')).toBe('03/07/2026');
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2026-03-07');
  });

  it('formats unpadded numeric patterns', () => {
    expect(formatDate(date, 'M/d/yyyy')).toBe('3/7/2026');
  });

  it('formats a two-digit year with padding', () => {
    expect(formatDate(d(2005, 3, 7), 'MM/dd/yy')).toBe('03/07/05');
  });

  it('formats month names', () => {
    expect(formatDate(date, 'MMMM d, yyyy')).toBe('March 7, 2026');
    expect(formatDate(date, 'MMM d, yyyy')).toBe('Mar 7, 2026');
  });

  it('formats month names in the given locale', () => {
    expect(formatDate(date, 'MMMM yyyy', 'fr-FR')).toBe('mars 2026');
  });

  it('preserves literal separators verbatim', () => {
    expect(formatDate(date, 'dd . MM . yyyy')).toBe('07 . 03 . 2026');
  });

  it('round-trips every numeric pattern back through the parser', () => {
    for (const format of ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd', 'M/d/yyyy', 'MMMM d, yyyy']) {
      expect(iso(parseDateFormat(formatDate(date, format), format))).toBe('2026-03-07');
    }
  });

  it('round-trips a locale month name', () => {
    const formatted = formatDate(date, 'd MMMM yyyy', 'fr-FR');
    expect(iso(parseDateFormat(formatted, 'd MMMM yyyy', 'fr-FR'))).toBe('2026-03-07');
  });
});
