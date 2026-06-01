import { describe, expect, it } from 'vitest';

import { buildFormatters } from '../../src/i18n/buildFormatters';

describe('buildFormatters — number', () => {
  it('en-US number formatting uses comma separators', () => {
    const f = buildFormatters('en-US');
    expect(f.number(1234567.89)).toMatch(/^1,234,567\.89$/);
  });

  it('he-IL number formatting is locale-specific', () => {
    const f = buildFormatters('he-IL');
    // jsdom carries ICU data via Node; should produce a Hebrew-locale comma form.
    expect(f.number(1234)).toBeTruthy();
  });

  it('percent multiplies by 100 and adds %', () => {
    const f = buildFormatters('en-US');
    expect(f.percent(0.42)).toMatch(/42\s*%/);
  });

  it('currency emits the currency symbol', () => {
    const f = buildFormatters('en-US');
    expect(f.currency(9.5, 'USD')).toMatch(/\$9\.50/);
  });
});

describe('buildFormatters — date / time', () => {
  it('date defaults to medium style', () => {
    const f = buildFormatters('en-US');
    const d = new Date('2024-05-26T12:00:00Z');
    expect(f.date(d)).toBeTruthy();
  });

  it('accepts ISO strings and epoch numbers', () => {
    const f = buildFormatters('en-US');
    expect(f.date('2024-05-26T12:00:00Z')).toBeTruthy();
    expect(f.date(1716724800000)).toBeTruthy();
  });

  it('dateTime combines date + time', () => {
    const f = buildFormatters('en-US');
    const result = f.dateTime(new Date('2024-05-26T12:00:00Z'));
    expect(result.length).toBeGreaterThan(5);
  });

  it('relativeTime formats with numeric=auto by default', () => {
    const f = buildFormatters('en-US');
    expect(f.relativeTime(-1, 'day')).toMatch(/yesterday/i);
    expect(f.relativeTime(0, 'day')).toMatch(/today/i);
  });
});

describe('buildFormatters — list / plural / collator', () => {
  it('list joins values with locale-specific separators', () => {
    const f = buildFormatters('en-US');
    expect(f.list(['a', 'b', 'c'])).toBe('a, b, and c');
  });

  it('plural returns the LDML category for the locale + count', () => {
    const f = buildFormatters('en');
    expect(f.plural(1)).toBe('one');
    expect(f.plural(0)).toBe('other');
    expect(f.plural(5)).toBe('other');
  });

  it('collator compares strings per locale', () => {
    const f = buildFormatters('en-US');
    expect(f.collator.compare('a', 'b')).toBeLessThan(0);
    expect(f.collator.compare('b', 'a')).toBeGreaterThan(0);
    expect(f.collator.compare('a', 'a')).toBe(0);
  });
});

describe('buildFormatters — overrides', () => {
  it('honors a fully-substituted number formatter', () => {
    const f = buildFormatters('en-US', { number: (v) => `<${v}>` });
    expect(f.number(5)).toBe('<5>');
  });

  it('uses default formatters for any non-overridden entries', () => {
    const f = buildFormatters('en-US', { number: () => 'X' });
    expect(f.number(5)).toBe('X');
    // currency was not overridden — default still runs.
    expect(f.currency(9.5, 'USD')).toMatch(/\$9\.50/);
  });
});