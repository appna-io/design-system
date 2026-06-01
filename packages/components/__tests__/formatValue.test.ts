import { describe, expect, it } from 'vitest';

import { formatValue } from '../src/Stat';

describe('formatValue', () => {
  it('passes strings through untouched', () => {
    expect(formatValue({ value: '$1,234' })).toBe('$1,234');
  });

  it('passes React nodes through untouched (object identity)', () => {
    const node = { someReactElement: true } as unknown as React.ReactNode;
    expect(formatValue({ value: node })).toBe(node);
  });

  it('returns NaN-like values untouched', () => {
    expect(formatValue({ value: NaN })).toBeNaN();
  });

  it('formats integers with locale grouping (en-US)', () => {
    expect(formatValue({ value: 12400, locale: 'en-US' })).toBe('12,400');
  });

  it('formats currency with default 2 fraction digits', () => {
    expect(
      formatValue({ value: 12400, format: 'currency', currency: 'USD', locale: 'en-US' }),
    ).toBe('$12,400.00');
  });

  it('respects locale for currency placement (de-DE)', () => {
    const out = formatValue({
      value: 12400,
      format: 'currency',
      currency: 'EUR',
      locale: 'de-DE',
    });
    // de-DE renders as "12.400,00 €" with NBSP variations; assert key fragments
    expect(out).toMatch(/12\.400,00/);
    expect(out).toMatch(/€/);
  });

  it('formats percent (0.214 → 21.4%)', () => {
    expect(
      formatValue({ value: 0.214, format: 'percent', fractionDigits: 1, locale: 'en-US' }),
    ).toBe('21.4%');
  });

  it('formats compact (12400 → 12.4K)', () => {
    expect(formatValue({ value: 12400, format: 'compact', locale: 'en-US' })).toMatch(/12\.4K/i);
  });

  it('honors custom fractionDigits for number format', () => {
    expect(
      formatValue({ value: 3.14159, format: 'number', fractionDigits: 3, locale: 'en-US' }),
    ).toBe('3.142');
  });

  it('JPY currency drops decimal places when fractionDigits=0', () => {
    expect(
      formatValue({
        value: 4280000,
        format: 'currency',
        currency: 'JPY',
        fractionDigits: 0,
        locale: 'en-US',
      }),
    ).toMatch(/4,280,000/);
  });
});