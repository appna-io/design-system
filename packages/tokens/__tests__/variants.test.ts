import { describe, expect, it } from 'vitest';
import {
  defaultVariant,
  getThemeVariant,
  katanaVariant,
  origamiVariant,
  tetsuVariant,
  themeVariants,
} from '../src/variants';

describe('theme variants', () => {
  it('registers default, tetsu, origami, katana', () => {
    expect(Object.keys(themeVariants).sort()).toEqual(['default', 'katana', 'origami', 'tetsu']);
  });

  it('default variant has no base overrides (apx-base wins)', () => {
    expect(defaultVariant.tokens).toEqual({});
  });

  it('default variant ships a Cupertino overlay under platformOverrides.apple', () => {
    const apple = defaultVariant.platformOverrides?.apple;
    expect(apple).toBeDefined();
    expect(apple?.typography?.fontFamily?.sans).toContain('-apple-system');
    expect(apple?.radius?.md).toBe('0.625rem');
    expect(apple?.motion?.duration?.fast).toBe(120);
  });

  it('default variant has an empty `other` overlay (apx-base passes through)', () => {
    expect(defaultVariant.platformOverrides?.other).toEqual({});
  });

  it('tetsu variant zeroes out the radius scale (except full) and tightens timings', () => {
    const radii = tetsuVariant.tokens.radius;
    expect(radii?.sm).toBe('0px');
    expect(radii?.md).toBe('0px');
    expect(radii?.lg).toBe('0px');
    expect(radii?.full).toBe('9999px');
    expect(tetsuVariant.tokens.motion?.duration?.fast).toBe(80);
  });

  it('origami variant bumps radii upward and softens shadows', () => {
    const radii = origamiVariant.tokens.radius;
    expect(radii?.md).toBe('0.875rem');
    expect(radii?.lg).toBe('1.25rem');
    expect(origamiVariant.tokens.shadows?.md).toContain('rgba(15, 23, 42');
  });

  it('katana variant uses diagonal two-value radii (rounded TL+BR, sharp TR+BL)', () => {
    const radii = katanaVariant.tokens.radius;
    expect(radii?.md).toBe('8px 0px');
    expect(radii?.sm).toBe('4px 0px');
    expect(radii?.lg).toBe('12px 0px');
    expect(radii?.full).toBe('9999px');
  });

  it('getThemeVariant returns the named variant or falls back to default', () => {
    expect(getThemeVariant('origami').name).toBe('origami');
    expect(getThemeVariant('katana').name).toBe('katana');
    expect(getThemeVariant('unknown-name').name).toBe('default');
  });
});