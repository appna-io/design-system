import { defaultTheme } from '@apx-ui/tokens';
import { describe, expect, it } from 'vitest';
import { defineTheme } from '../src/defineTheme';

describe('defineTheme', () => {
  it('returns the default theme when no overrides provided', () => {
    const theme = defineTheme();
    expect(theme.palette.light.primary.main).toBe(defaultTheme.palette.light.primary.main);
    expect(theme.variant).toBe('default');
  });

  it('applies a palette override on top of defaults', () => {
    const theme = defineTheme({
      palette: { light: { primary: { main: '#ff00ff' } } },
    });
    expect(theme.palette.light.primary.main).toBe('#ff00ff');
    expect(theme.palette.light.primary.contrast).toBe(defaultTheme.palette.light.primary.contrast);
  });

  it('applies the active variant tokens on top of merged theme', () => {
    const theme = defineTheme({ variant: 'origami' });
    expect(theme.variant).toBe('origami');
    expect(theme.radius.md).toBe('0.875rem');
  });

  it('falls back to default variant tokens for unknown variant names', () => {
    const theme = defineTheme({ variant: 'made-up-variant' });
    expect(theme.variant).toBe('made-up-variant');
    expect(theme.radius.md).toBe(defaultTheme.radius.md);
  });

  it('tetsu variant zeroes most radii', () => {
    const theme = defineTheme({ variant: 'tetsu' });
    expect(theme.radius.sm).toBe('0px');
    expect(theme.radius.md).toBe('0px');
    expect(theme.radius.full).toBe('9999px');
  });

  it('preserves component-level overrides under deep merge', () => {
    const theme = defineTheme({
      components: { Button: { defaultProps: { size: 'lg' } } },
    });
    expect(theme.components?.Button?.defaultProps?.size).toBe('lg');
  });
});