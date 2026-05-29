import { describe, expect, it } from 'vitest';
import { breakpointPrefix, prefixClasses, resolveResponsive } from '../src/responsive';
import { isResponsiveObject } from '../src/types/responsive';

describe('isResponsiveObject', () => {
  it('returns true for objects with breakpoint keys', () => {
    expect(isResponsiveObject({ base: 'sm', md: 'lg' })).toBe(true);
    expect(isResponsiveObject({ base: 'sm' })).toBe(true);
    expect(isResponsiveObject({ sm: 'x', '2xl': 'y' })).toBe(true);
  });

  it('returns false for primitives', () => {
    expect(isResponsiveObject('sm')).toBe(false);
    expect(isResponsiveObject(42)).toBe(false);
    expect(isResponsiveObject(null)).toBe(false);
    expect(isResponsiveObject(undefined)).toBe(false);
    expect(isResponsiveObject(true)).toBe(false);
  });

  it('returns false for objects with non-breakpoint keys', () => {
    expect(isResponsiveObject({ foo: 'bar' } as never)).toBe(false);
    expect(isResponsiveObject({ base: 'sm', randomKey: 'lg' } as never)).toBe(false);
  });

  it('returns false for empty objects', () => {
    expect(isResponsiveObject({})).toBe(false);
  });
});

describe('resolveResponsive', () => {
  it('wraps primitives in a single base tuple', () => {
    expect(resolveResponsive('sm')).toEqual([['base', 'sm']]);
    expect(resolveResponsive(42)).toEqual([['base', 42]]);
  });

  it('expands responsive objects in ascending breakpoint order', () => {
    expect(resolveResponsive({ base: 'a', md: 'b', '2xl': 'c' })).toEqual([
      ['base', 'a'],
      ['md', 'b'],
      ['2xl', 'c'],
    ]);
  });

  it('skips undefined entries', () => {
    expect(resolveResponsive({ base: 'a', md: undefined, lg: 'c' } as never)).toEqual([
      ['base', 'a'],
      ['lg', 'c'],
    ]);
  });
});

describe('breakpointPrefix', () => {
  it('returns empty string for base', () => {
    expect(breakpointPrefix('base')).toBe('');
  });

  it('returns "<bp>:" for named breakpoints', () => {
    expect(breakpointPrefix('sm')).toBe('sm:');
    expect(breakpointPrefix('md')).toBe('md:');
    expect(breakpointPrefix('2xl')).toBe('2xl:');
  });
});

describe('prefixClasses', () => {
  it('adds prefix to every class in a space-separated string', () => {
    expect(prefixClasses('h-8 px-3', 'md:')).toBe('md:h-8 md:px-3');
  });

  it('returns input unchanged when prefix is empty', () => {
    expect(prefixClasses('h-8 px-3', '')).toBe('h-8 px-3');
  });

  it('returns empty for empty class string', () => {
    expect(prefixClasses('', 'md:')).toBe('');
  });

  it('preserves important modifier (!)', () => {
    expect(prefixClasses('!h-8 px-3', 'md:')).toBe('!md:h-8 md:px-3');
  });

  it('handles multiple whitespace characters', () => {
    expect(prefixClasses('a  b   c', 'md:')).toBe('md:a md:b md:c');
  });
});
