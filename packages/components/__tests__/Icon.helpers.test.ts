import { describe, expect, it } from 'vitest';

import {
  isIconColorToken,
  isIconSizeToken,
  resolveIconA11y,
  resolveIconColor,
  resolveIconSize,
} from '../src/Icon';

describe('resolveIconA11y', () => {
  it('decorative-by-default when label is omitted', () => {
    expect(resolveIconA11y({})).toEqual({
      role: undefined,
      'aria-label': undefined,
      'aria-hidden': true,
    });
  });

  it('decorative-by-default when label is empty string', () => {
    expect(resolveIconA11y({ label: '' })).toEqual({
      role: undefined,
      'aria-label': undefined,
      'aria-hidden': true,
    });
  });

  it('meaningful when label is provided', () => {
    expect(resolveIconA11y({ label: 'Inbox' })).toEqual({
      role: 'img',
      'aria-label': 'Inbox',
      'aria-hidden': undefined,
    });
  });

  it('explicit decorative=true wins over a label', () => {
    expect(resolveIconA11y({ label: 'Inbox', decorative: true })).toEqual({
      role: undefined,
      'aria-label': undefined,
      'aria-hidden': true,
    });
  });

  it('decorative=false without a label is still decorative (no a11y info to surface)', () => {
    expect(resolveIconA11y({ decorative: false })).toEqual({
      role: undefined,
      'aria-label': undefined,
      'aria-hidden': true,
    });
  });

  it('decorative=false with a label is meaningful', () => {
    expect(resolveIconA11y({ label: 'Inbox', decorative: false })).toEqual({
      role: 'img',
      'aria-label': 'Inbox',
      'aria-hidden': undefined,
    });
  });
});

describe('resolveIconSize', () => {
  it('defaults to the md token when size is undefined', () => {
    expect(resolveIconSize(undefined)).toEqual({ style: null, token: 'md' });
  });

  it('returns null style and the token for known tokens', () => {
    for (const t of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
      expect(resolveIconSize(t)).toEqual({ style: null, token: t });
    }
  });

  it('converts numeric sizes into px inline styles', () => {
    expect(resolveIconSize(20)).toEqual({
      style: { width: '20px', height: '20px', fontSize: '20px' },
      token: undefined,
    });
  });

  it('passes through arbitrary CSS lengths', () => {
    expect(resolveIconSize('1.5rem')).toEqual({
      style: { width: '1.5rem', height: '1.5rem', fontSize: '1.5rem' },
      token: undefined,
    });
  });

  it('isIconSizeToken discriminates token strings from arbitrary strings', () => {
    expect(isIconSizeToken('md')).toBe(true);
    expect(isIconSizeToken('1.5rem')).toBe(false);
    expect(isIconSizeToken(20 as never)).toBe(false);
  });
});

describe('resolveIconColor', () => {
  it("defaults to 'current' when undefined", () => {
    expect(resolveIconColor(undefined)).toEqual({ style: null, token: 'current' });
  });

  it('returns the token for known DS colors', () => {
    for (const t of [
      'current',
      'inherit',
      'default',
      'muted',
      'subtle',
      'accent',
      'success',
      'warning',
      'danger',
      'info',
    ] as const) {
      expect(resolveIconColor(t)).toEqual({ style: null, token: t });
    }
  });

  it('applies inline color for arbitrary CSS values', () => {
    expect(resolveIconColor('#ff0000')).toEqual({
      style: { color: '#ff0000' },
      token: undefined,
    });
    expect(resolveIconColor('rgb(0 0 0)')).toEqual({
      style: { color: 'rgb(0 0 0)' },
      token: undefined,
    });
    expect(resolveIconColor('var(--my-color)')).toEqual({
      style: { color: 'var(--my-color)' },
      token: undefined,
    });
  });

  it('isIconColorToken discriminates known tokens from arbitrary colors', () => {
    expect(isIconColorToken('danger')).toBe(true);
    expect(isIconColorToken('#fff')).toBe(false);
  });
});