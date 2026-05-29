import { describe, expect, it } from 'vitest';

import { PSEUDO_PREFIX, buildPseudoClassName } from '../src/Div';

describe('buildPseudoClassName — empty inputs', () => {
  it('returns "" when no props are supplied', () => {
    expect(buildPseudoClassName({})).toBe('');
  });

  it('returns "" when every supplied prop is undefined / empty', () => {
    expect(
      buildPseudoClassName({
        onHover: undefined,
        onFocusVisible: '',
        onActive: undefined,
      }),
    ).toBe('');
  });
});

describe('buildPseudoClassName — single state', () => {
  it('prefixes a single hover token with `hover:`', () => {
    expect(buildPseudoClassName({ onHover: 'bg-primary-100' })).toContain('hover:bg-primary-100');
  });

  it('prefixes every whitespace-separated token in a hover string', () => {
    const out = buildPseudoClassName({ onHover: 'bg-primary-100 scale-[1.02] shadow-md' });
    expect(out).toContain('hover:bg-primary-100');
    expect(out).toContain('hover:scale-[1.02]');
    expect(out).toContain('hover:shadow-md');
  });

  it('prefixes focus-visible tokens correctly', () => {
    const out = buildPseudoClassName({ onFocusVisible: 'ring-2 ring-primary-500' });
    expect(out).toContain('focus-visible:ring-2');
    expect(out).toContain('focus-visible:ring-primary-500');
  });

  it('honors `!important` tokens (preserves the `!` after the prefix)', () => {
    const out = buildPseudoClassName({ onHover: '!bg-primary-100' });
    expect(out).toContain('!hover:bg-primary-100');
  });
});

describe('buildPseudoClassName — multi-state composition', () => {
  it('emits every requested state in one combined string', () => {
    const out = buildPseudoClassName({
      onHover: 'bg-primary-100',
      onFocusVisible: 'ring-2',
      onActive: 'scale-[0.98]',
      onDisabled: 'opacity-50',
    });
    expect(out).toContain('hover:bg-primary-100');
    expect(out).toContain('focus-visible:ring-2');
    expect(out).toContain('active:scale-[0.98]');
    expect(out).toContain('disabled:opacity-50');
  });

  it('uses the documented prefixes for aria-checked / group-hover / data-state', () => {
    const out = buildPseudoClassName({
      onChecked: 'bg-primary-100',
      onGroupHover: 'opacity-100',
      onDataState: 'rotate-90',
    });
    expect(out).toContain('aria-checked:bg-primary-100');
    expect(out).toContain('group-hover:opacity-100');
    expect(out).toContain('data-[state=open]:rotate-90');
  });
});

describe('PSEUDO_PREFIX table — surface', () => {
  it('does NOT expose `onFocus` (collides with React focus event handler)', () => {
    expect(PSEUDO_PREFIX).not.toHaveProperty('onFocus');
  });

  it('exposes the documented 7 pseudo state hooks', () => {
    expect(Object.keys(PSEUDO_PREFIX).sort()).toEqual(
      [
        'onActive',
        'onChecked',
        'onDataState',
        'onDisabled',
        'onFocusVisible',
        'onGroupHover',
        'onHover',
      ].sort(),
    );
  });

  it('maps every key to its Tailwind prefix string', () => {
    expect(PSEUDO_PREFIX.onHover).toBe('hover:');
    expect(PSEUDO_PREFIX.onFocusVisible).toBe('focus-visible:');
    expect(PSEUDO_PREFIX.onActive).toBe('active:');
    expect(PSEUDO_PREFIX.onDisabled).toBe('disabled:');
    expect(PSEUDO_PREFIX.onChecked).toBe('aria-checked:');
    expect(PSEUDO_PREFIX.onGroupHover).toBe('group-hover:');
    expect(PSEUDO_PREFIX.onDataState).toBe('data-[state=open]:');
  });
});
