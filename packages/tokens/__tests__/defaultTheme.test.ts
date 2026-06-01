import { describe, expect, it } from 'vitest';
import { defaultTheme } from '../src/defaultTheme';

describe('defaultTheme', () => {
  it('is frozen (top level)', () => {
    expect(Object.isFrozen(defaultTheme)).toBe(true);
  });

  it('exposes both light and dark palettes', () => {
    expect(defaultTheme.palette.light).toBeDefined();
    expect(defaultTheme.palette.dark).toBeDefined();
  });

  it('starts in system mode, ltr direction, default variant', () => {
    expect(defaultTheme.mode).toBe('system');
    expect(defaultTheme.dir).toBe('ltr');
    expect(defaultTheme.variant).toBe('default');
  });

  it('has every required token group', () => {
    for (const key of [
      'typography',
      'spacing',
      'radius',
      'shadows',
      'motion',
      'breakpoints',
      'zIndex',
    ] as const) {
      expect(defaultTheme[key]).toBeDefined();
    }
  });

  it('typography has sans and mono font families', () => {
    expect(defaultTheme.typography.fontFamily.sans).toContain('system-ui');
    expect(defaultTheme.typography.fontFamily.mono).toContain('monospace');
  });

  it('breakpoints are ascending', () => {
    const { sm, md, lg, xl, '2xl': xxl } = defaultTheme.breakpoints;
    expect(sm).toBeLessThan(md);
    expect(md).toBeLessThan(lg);
    expect(lg).toBeLessThan(xl);
    expect(xl).toBeLessThan(xxl);
  });
});