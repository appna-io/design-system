import { describe, expect, it } from 'vitest';

import { containsSeparator, splitTokens } from '../src/TagsInput/splitTokens';

describe('splitTokens', () => {
  it('returns an empty array for empty input', () => {
    expect(splitTokens('', [','])).toEqual([]);
  });

  it('returns the whole input when no separator matches', () => {
    expect(splitTokens('hello world', [','])).toEqual(['hello world']);
  });

  it('splits on a single string separator', () => {
    expect(splitTokens('a,b,c', [','])).toEqual(['a', 'b', 'c']);
  });

  it('splits on multiple string separators', () => {
    expect(splitTokens('a, b; c', [',', ';'])).toEqual(['a', ' b', ' c']);
  });

  it('collapses consecutive separators (no empty tokens)', () => {
    expect(splitTokens('a,,b,,c', [','])).toEqual(['a', 'b', 'c']);
  });

  it('escapes regex-special chars in string separators', () => {
    expect(splitTokens('a.b.c', ['.'])).toEqual(['a', 'b', 'c']);
    expect(splitTokens('a|b', ['|'])).toEqual(['a', 'b']);
  });

  it('splits on a RegExp separator', () => {
    expect(splitTokens('a, b; c\nd', /[,;\s\n]+/)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('preserves whitespace inside tokens when not in splitOn', () => {
    expect(splitTokens('hello world,foo', [','])).toEqual(['hello world', 'foo']);
  });
});

describe('containsSeparator', () => {
  it('false for empty input', () => {
    expect(containsSeparator('', [','])).toBe(false);
  });

  it('detects a string separator', () => {
    expect(containsSeparator('a,b', [','])).toBe(true);
    expect(containsSeparator('a b', [' '])).toBe(true);
  });

  it('detects via RegExp', () => {
    expect(containsSeparator('hello world', /\s/)).toBe(true);
    expect(containsSeparator('helloworld', /\s/)).toBe(false);
  });

  it('returns false when no separator matches', () => {
    expect(containsSeparator('abc', [','])).toBe(false);
  });

  it('ignores empty-string separators in the array', () => {
    expect(containsSeparator('abc', ['', ','])).toBe(false);
  });
});