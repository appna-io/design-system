import { describe, expect, it } from 'vitest';

import { clampToRange, roundToPrecision } from '../src/NumberInput/clampToRange';
import { __resetFormatterCache, formatNumber } from '../src/NumberInput/formatNumber';
import { parseLocalizedNumber } from '../src/NumberInput/parseLocalizedNumber';

describe('parseLocalizedNumber — en-US', () => {
  it('parses a plain decimal', () => {
    expect(parseLocalizedNumber('42', 'en-US')).toBe(42);
    expect(parseLocalizedNumber('42.5', 'en-US')).toBe(42.5);
  });

  it('strips thousand separators', () => {
    expect(parseLocalizedNumber('1,234', 'en-US')).toBe(1234);
    expect(parseLocalizedNumber('1,234.56', 'en-US')).toBe(1234.56);
    expect(parseLocalizedNumber('1,234,567.89', 'en-US')).toBe(1234567.89);
  });

  it('accepts negative numbers', () => {
    expect(parseLocalizedNumber('-42', 'en-US')).toBe(-42);
    expect(parseLocalizedNumber('-1,234.56', 'en-US')).toBe(-1234.56);
  });

  it('returns null on empty / whitespace-only input', () => {
    expect(parseLocalizedNumber('', 'en-US')).toBeNull();
    expect(parseLocalizedNumber('   ', 'en-US')).toBeNull();
  });

  it('returns null on non-numeric input', () => {
    expect(parseLocalizedNumber('hello', 'en-US')).toBeNull();
    expect(parseLocalizedNumber('1.2.3', 'en-US')).toBeNull();
  });

  it('rejects scientific notation', () => {
    expect(parseLocalizedNumber('1e5', 'en-US')).toBeNull();
    expect(parseLocalizedNumber('1E5', 'en-US')).toBeNull();
  });

  it('trims surrounding whitespace', () => {
    expect(parseLocalizedNumber('  42  ', 'en-US')).toBe(42);
  });
});

describe('parseLocalizedNumber — de-DE', () => {
  it('uses dot as group separator and comma as decimal', () => {
    expect(parseLocalizedNumber('1.234,56', 'de-DE')).toBe(1234.56);
    expect(parseLocalizedNumber('1.234.567,89', 'de-DE')).toBe(1234567.89);
  });

  it('parses plain integers without thousand separator', () => {
    expect(parseLocalizedNumber('42', 'de-DE')).toBe(42);
  });
});

describe('parseLocalizedNumber — ar-EG (Arabic-Indic digits)', () => {
  it('normalizes Arabic-Indic digits to ASCII', () => {
    // ١٢٣٤ = 1234
    expect(parseLocalizedNumber('١٢٣٤', 'ar-EG')).toBe(1234);
  });

  it('normalizes Arabic-Indic with locale decimal separator', () => {
    // ١٬٢٣٤٫٥٦ — Arabic thousand separator + Arabic decimal separator
    const result = parseLocalizedNumber('١٬٢٣٤٫٥٦', 'ar-EG');
    expect(result).toBe(1234.56);
  });
});

describe('parseLocalizedNumber — fr-FR', () => {
  it('handles French non-breaking-space thousand separator', () => {
    // U+202F NARROW NO-BREAK SPACE is the modern fr-FR group separator
    const probe = new Intl.NumberFormat('fr-FR').formatToParts(12345.6);
    const groupSep = probe.find((p) => p.type === 'group')?.value;
    const decimalSep = probe.find((p) => p.type === 'decimal')?.value;
    const sample = `1${groupSep}234${decimalSep}56`;
    expect(parseLocalizedNumber(sample, 'fr-FR')).toBe(1234.56);
  });
});

describe('parseLocalizedNumber — he-IL', () => {
  it('parses a Hebrew-locale string round-trip', () => {
    const formatted = new Intl.NumberFormat('he-IL').format(1234.56);
    expect(parseLocalizedNumber(formatted, 'he-IL')).toBe(1234.56);
  });
});

describe('formatNumber', () => {
  it('returns empty string for null', () => {
    expect(formatNumber(null, 'en-US')).toBe('');
  });

  it('formats per locale', () => {
    expect(formatNumber(1234.56, 'en-US')).toBe('1,234.56');
    expect(formatNumber(1234.56, 'de-DE')).toBe('1.234,56');
  });

  it('honors Intl.NumberFormatOptions for currency', () => {
    expect(formatNumber(1299.99, 'en-US', { style: 'currency', currency: 'USD' })).toBe('$1,299.99');
  });

  it('caches formatters across calls (smoke test)', () => {
    __resetFormatterCache();
    // Same (locale, options) hits the same instance — we can't directly observe it but exercising
    // the path here ensures the cache key derivation works for the round-trip.
    const a = formatNumber(100, 'en-US', { style: 'percent' });
    const b = formatNumber(100, 'en-US', { style: 'percent' });
    expect(a).toBe(b);
  });
});

describe('clampToRange', () => {
  it('clamps below min', () => {
    expect(clampToRange(-5, 0, 10)).toBe(0);
  });
  it('clamps above max', () => {
    expect(clampToRange(15, 0, 10)).toBe(10);
  });
  it('keeps values in range untouched', () => {
    expect(clampToRange(5, 0, 10)).toBe(5);
  });
  it('handles undefined bounds', () => {
    expect(clampToRange(1000)).toBe(1000);
    expect(clampToRange(1000, 0)).toBe(1000);
    expect(clampToRange(-1000, undefined, 0)).toBe(-1000);
  });
});

describe('roundToPrecision', () => {
  it('rounds to N decimal places', () => {
    expect(roundToPrecision(3.456, 2)).toBe(3.46);
    expect(roundToPrecision(3.444, 2)).toBe(3.44);
    expect(roundToPrecision(3.5, 0)).toBe(4);
  });

  it('passes through when precision is undefined', () => {
    expect(roundToPrecision(3.456, undefined)).toBe(3.456);
  });

  it('preserves NaN / Infinity', () => {
    expect(roundToPrecision(Number.NaN, 2)).toBeNaN();
    expect(roundToPrecision(Number.POSITIVE_INFINITY, 2)).toBe(Number.POSITIVE_INFINITY);
  });
});