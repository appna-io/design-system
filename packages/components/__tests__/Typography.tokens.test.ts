import { describe, expect, it } from 'vitest';

import {
  FONT_FAMILY_VARS,
  resolveTypographyToken,
  TYPOGRAPHY_TOKEN_TABLES,
  TYPOGRAPHY_VAR_PREFIX,
} from '../src/Typography';

describe('resolveTypographyToken — undefined / null', () => {
  it('returns undefined for undefined', () => {
    expect(resolveTypographyToken('fontSize', undefined)).toBeUndefined();
  });

  it('returns undefined for null', () => {
    expect(resolveTypographyToken('fontWeight', null as unknown as undefined)).toBeUndefined();
  });
});

describe('resolveTypographyToken — numbers pass through', () => {
  it('numeric fontSize passes through untouched', () => {
    expect(resolveTypographyToken('fontSize', 14)).toBe(14);
  });

  it('numeric fontWeight passes through untouched', () => {
    expect(resolveTypographyToken('fontWeight', 500)).toBe(500);
  });

  it('numeric lineHeight passes through untouched', () => {
    expect(resolveTypographyToken('lineHeight', 1.4)).toBe(1.4);
  });
});

describe('resolveTypographyToken — known tokens resolve to var(--sds-...)', () => {
  it.each([
    ['xs', 'var(--sds-font-size-xs)'],
    ['sm', 'var(--sds-font-size-sm)'],
    ['base', 'var(--sds-font-size-base)'],
    ['lg', 'var(--sds-font-size-lg)'],
    ['xl', 'var(--sds-font-size-xl)'],
    ['2xl', 'var(--sds-font-size-2xl)'],
    ['3xl', 'var(--sds-font-size-3xl)'],
    ['4xl', 'var(--sds-font-size-4xl)'],
    ['5xl', 'var(--sds-font-size-5xl)'],
  ])('fontSize="%s" resolves to %s', (key, expected) => {
    expect(resolveTypographyToken('fontSize', key)).toBe(expected);
  });

  it.each([
    ['normal', 'var(--sds-font-weight-normal)'],
    ['medium', 'var(--sds-font-weight-medium)'],
    ['semibold', 'var(--sds-font-weight-semibold)'],
    ['bold', 'var(--sds-font-weight-bold)'],
  ])('fontWeight="%s" resolves to %s', (key, expected) => {
    expect(resolveTypographyToken('fontWeight', key)).toBe(expected);
  });

  it.each([
    ['none', 'var(--sds-line-height-none)'],
    ['tight', 'var(--sds-line-height-tight)'],
    ['snug', 'var(--sds-line-height-snug)'],
    ['normal', 'var(--sds-line-height-normal)'],
    ['relaxed', 'var(--sds-line-height-relaxed)'],
  ])('lineHeight="%s" resolves to %s', (key, expected) => {
    expect(resolveTypographyToken('lineHeight', key)).toBe(expected);
  });

  it.each([
    ['tight', 'var(--sds-letter-spacing-tight)'],
    ['normal', 'var(--sds-letter-spacing-normal)'],
    ['wide', 'var(--sds-letter-spacing-wide)'],
    ['wider', 'var(--sds-letter-spacing-wider)'],
  ])('letterSpacing="%s" resolves to %s', (key, expected) => {
    expect(resolveTypographyToken('letterSpacing', key)).toBe(expected);
  });

  it('fontFamily="sans" resolves to var(--sds-font-sans)', () => {
    expect(resolveTypographyToken('fontFamily', 'sans')).toBe('var(--sds-font-sans)');
  });

  it('fontFamily="mono" resolves to var(--sds-font-mono)', () => {
    expect(resolveTypographyToken('fontFamily', 'mono')).toBe('var(--sds-font-mono)');
  });
});

describe('resolveTypographyToken — unknown strings pass through (raw CSS escape hatch)', () => {
  it('px string fontSize passes through', () => {
    expect(resolveTypographyToken('fontSize', '14px')).toBe('14px');
  });

  it('inherit / unset / initial pass through for every prop', () => {
    expect(resolveTypographyToken('fontSize', 'inherit')).toBe('inherit');
    expect(resolveTypographyToken('fontWeight', 'inherit')).toBe('inherit');
    expect(resolveTypographyToken('lineHeight', 'unset')).toBe('unset');
    expect(resolveTypographyToken('letterSpacing', 'initial')).toBe('initial');
    expect(resolveTypographyToken('fontFamily', 'inherit')).toBe('inherit');
  });

  it('raw font-family stack passes through fontFamily', () => {
    const stack = '"Helvetica Neue", Arial, sans-serif';
    expect(resolveTypographyToken('fontFamily', stack)).toBe(stack);
  });

  it('em / rem lineHeight strings pass through', () => {
    expect(resolveTypographyToken('lineHeight', '1.5em')).toBe('1.5em');
    expect(resolveTypographyToken('lineHeight', '24px')).toBe('24px');
  });
});

describe('Token table surface', () => {
  it('TYPOGRAPHY_TOKEN_TABLES exposes the 4 indexed prop tables', () => {
    expect(Object.keys(TYPOGRAPHY_TOKEN_TABLES).sort()).toEqual([
      'fontSize',
      'fontWeight',
      'letterSpacing',
      'lineHeight',
    ]);
  });

  it('TYPOGRAPHY_VAR_PREFIX exposes the 4 prop → var-prefix mappings', () => {
    expect(TYPOGRAPHY_VAR_PREFIX.fontSize).toBe('--sds-font-size');
    expect(TYPOGRAPHY_VAR_PREFIX.fontWeight).toBe('--sds-font-weight');
    expect(TYPOGRAPHY_VAR_PREFIX.lineHeight).toBe('--sds-line-height');
    expect(TYPOGRAPHY_VAR_PREFIX.letterSpacing).toBe('--sds-letter-spacing');
  });

  it('FONT_FAMILY_VARS exposes the 2 fontFamily token names', () => {
    expect(FONT_FAMILY_VARS.sans).toBe('--sds-font-sans');
    expect(FONT_FAMILY_VARS.mono).toBe('--sds-font-mono');
  });
});
