import { defaultTheme } from '@apx-ui/tokens';
import { describe, expect, it } from 'vitest';
import { mergeTheme } from '../src/mergeTheme';

describe('mergeTheme', () => {
  it('returns an independent copy of the base when no overrides', () => {
    const result = mergeTheme(defaultTheme);
    expect(result).not.toBe(defaultTheme);
    expect(result.palette.light.primary.main).toBe(defaultTheme.palette.light.primary.main);
  });

  it('deep-merges nested overrides without losing siblings', () => {
    const result = mergeTheme(defaultTheme, {
      palette: { light: { primary: { main: '#ff0000' } } },
    });
    expect(result.palette.light.primary.main).toBe('#ff0000');
    expect(result.palette.light.primary.contrast).toBe(defaultTheme.palette.light.primary.contrast);
    expect(result.palette.light.secondary.main).toBe(defaultTheme.palette.light.secondary.main);
    expect(result.palette.dark.primary.main).toBe(defaultTheme.palette.dark.primary.main);
  });

  it('applies multiple overrides left-to-right (later wins)', () => {
    const result = mergeTheme(
      defaultTheme,
      { palette: { light: { primary: { main: '#111111' } } } },
      { palette: { light: { primary: { main: '#222222' } } } },
    );
    expect(result.palette.light.primary.main).toBe('#222222');
  });

  it('replaces primitive values wholesale', () => {
    const result = mergeTheme(defaultTheme, { mode: 'dark', dir: 'rtl', variant: 'origami' });
    expect(result.mode).toBe('dark');
    expect(result.dir).toBe('rtl');
    expect(result.variant).toBe('origami');
  });

  it('does not mutate the base theme', () => {
    const before = JSON.stringify(defaultTheme);
    mergeTheme(defaultTheme, { palette: { light: { primary: { main: '#abcdef' } } } });
    expect(JSON.stringify(defaultTheme)).toBe(before);
  });

  it('ignores undefined override entries', () => {
    const result = mergeTheme(defaultTheme, undefined, undefined);
    expect(result.palette.light.primary.main).toBe(defaultTheme.palette.light.primary.main);
  });
});
