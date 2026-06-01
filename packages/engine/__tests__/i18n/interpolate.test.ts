import { describe, expect, it, vi } from 'vitest';

import { interpolate } from '../../src/i18n/interpolate';

describe('interpolate', () => {
  it('returns the template unchanged when no params are provided', () => {
    expect(interpolate('Hello world')).toBe('Hello world');
  });

  it('returns the template unchanged when there are no placeholders', () => {
    expect(interpolate('Hello world', { name: 'Ada' })).toBe('Hello world');
  });

  it('substitutes a single placeholder', () => {
    expect(interpolate('Hello {name}', { name: 'Ada' })).toBe('Hello Ada');
  });

  it('substitutes multiple placeholders', () => {
    expect(
      interpolate('Step {current} of {total}', { current: 2, total: 5 }),
    ).toBe('Step 2 of 5');
  });

  it('coerces non-string params to strings', () => {
    expect(interpolate('{a}/{b}/{c}', { a: 1, b: true, c: 0 })).toBe('1/true/0');
  });

  it('replaces null / undefined params with empty string', () => {
    expect(interpolate('{a}{b}', { a: null, b: undefined })).toBe('');
  });

  it('leaves unknown placeholders empty + warns in dev', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(interpolate('Hello {typo}', { name: 'Ada' })).toBe('Hello ');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('does not touch curly braces that are not valid identifiers', () => {
    // Positional `{0}` / `{1}` and non-identifier `{-}` are deliberately left as-is — the
    // grammar accepts `[A-Za-z_][A-Za-z0-9_]*` only.
    expect(interpolate('{0} {1} {-}', { 0: 'a', 1: 'b' })).toBe('{0} {1} {-}');
  });

  it('handles identifier with underscore + digits', () => {
    expect(interpolate('{var_1}', { var_1: 'ok' })).toBe('ok');
  });

  it('repeated identifiers all substitute', () => {
    expect(interpolate('{name} {name} {name}', { name: 'X' })).toBe('X X X');
  });
});