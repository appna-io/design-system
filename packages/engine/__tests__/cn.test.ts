import { describe, expect, it } from 'vitest';
import { cn } from '../src/cn';

describe('cn', () => {
  it('joins multiple class strings', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('supports object syntax (clsx)', () => {
    expect(cn('a', { b: true, c: false }, 'd')).toBe('a b d');
  });

  it('supports nested arrays (clsx)', () => {
    expect(cn(['a', ['b', { c: true }]])).toBe('a b c');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('preserves classes from different families', () => {
    const result = cn('p-4 text-sm', 'm-2 font-bold');
    expect(result).toContain('p-4');
    expect(result).toContain('m-2');
    expect(result).toContain('text-sm');
    expect(result).toContain('font-bold');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
    expect(cn(null)).toBe('');
  });
});
