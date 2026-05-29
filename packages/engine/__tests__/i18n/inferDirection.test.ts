import { describe, expect, it } from 'vitest';

import { inferDirection } from '../../src/i18n/inferDirection';

describe('inferDirection', () => {
  it.each([
    ['en', 'ltr'],
    ['en-US', 'ltr'],
    ['de-DE', 'ltr'],
    ['fr', 'ltr'],
    ['ja-JP', 'ltr'],
    ['zh-Hant-TW', 'ltr'],
  ] as const)('treats %s as ltr', (locale, expected) => {
    expect(inferDirection(locale)).toBe(expected);
  });

  it.each([
    ['he', 'rtl'],
    ['he-IL', 'rtl'],
    ['iw', 'rtl'],
    ['ar', 'rtl'],
    ['ar-EG', 'rtl'],
    ['fa', 'rtl'],
    ['fa-AF', 'rtl'],
    ['ur', 'rtl'],
    ['ps', 'rtl'],
    ['yi', 'rtl'],
  ] as const)('treats %s as rtl', (locale, expected) => {
    expect(inferDirection(locale)).toBe(expected);
  });

  it('is case-insensitive on the primary subtag', () => {
    expect(inferDirection('HE-IL')).toBe('rtl');
    expect(inferDirection('AR')).toBe('rtl');
    expect(inferDirection('EN-us')).toBe('ltr');
  });

  it('returns ltr for empty / malformed input', () => {
    expect(inferDirection('')).toBe('ltr');
    expect(inferDirection('-')).toBe('ltr');
    expect(inferDirection('xx-YY')).toBe('ltr');
  });
});
