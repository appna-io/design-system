import { describe, expect, it } from 'vitest';
import {
  deriveColorRole,
  hslToRgb,
  mixRgb,
  parseHex,
  relativeLuminance,
  rgbToHex,
  rgbToHsl,
  shiftLightness,
} from '../src/color/deriveColorRole';

describe('parseHex', () => {
  it('parses 6-digit hex with leading #', () => {
    expect(parseHex('#4f46e5')).toEqual({ r: 79, g: 70, b: 229 });
  });

  it('parses 6-digit hex without leading #', () => {
    expect(parseHex('4f46e5')).toEqual({ r: 79, g: 70, b: 229 });
  });

  it('parses uppercase hex', () => {
    expect(parseHex('#4F46E5')).toEqual({ r: 79, g: 70, b: 229 });
  });

  it('expands 3-digit shorthand', () => {
    expect(parseHex('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseHex('#abc')).toEqual({ r: 170, g: 187, b: 204 });
  });

  it('returns null for non-hex inputs', () => {
    expect(parseHex('rebeccapurple')).toBeNull();
    expect(parseHex('rgb(0,0,0)')).toBeNull();
    expect(parseHex('var(--sds-palette-primary-main)')).toBeNull();
    expect(parseHex('')).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('formats round-trip', () => {
    expect(rgbToHex({ r: 79, g: 70, b: 229 })).toBe('#4f46e5');
  });

  it('clamps out-of-range channels', () => {
    expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe('#ff0080');
  });

  it('pads single-digit channels with leading zeros', () => {
    expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe('#010203');
  });
});

describe('rgbToHsl / hslToRgb round-trip', () => {
  const samples = ['#4f46e5', '#000000', '#ffffff', '#ff8800', '#16a34a', '#7f7f7f'];
  it.each(samples)('survives a round-trip within 1 channel for %s', (hex) => {
    const rgb = parseHex(hex)!;
    const hsl = rgbToHsl(rgb);
    const rt = hslToRgb(hsl);
    expect(Math.abs(rt.r - rgb.r)).toBeLessThanOrEqual(1);
    expect(Math.abs(rt.g - rgb.g)).toBeLessThanOrEqual(1);
    expect(Math.abs(rt.b - rgb.b)).toBeLessThanOrEqual(1);
  });
});

describe('mixRgb', () => {
  it('returns a at t=0, b at t=1', () => {
    const a = { r: 0, g: 0, b: 0 };
    const b = { r: 200, g: 100, b: 50 };
    expect(mixRgb(a, b, 0)).toEqual(a);
    expect(mixRgb(a, b, 1)).toEqual(b);
  });

  it('interpolates linearly at t=0.5', () => {
    const mid = mixRgb({ r: 0, g: 0, b: 0 }, { r: 200, g: 100, b: 50 }, 0.5);
    expect(mid).toEqual({ r: 100, g: 50, b: 25 });
  });

  it('clamps t outside [0,1]', () => {
    const a = { r: 0, g: 0, b: 0 };
    const b = { r: 200, g: 100, b: 50 };
    expect(mixRgb(a, b, 2)).toEqual(b);
    expect(mixRgb(a, b, -1)).toEqual(a);
  });
});

describe('shiftLightness', () => {
  it('darkens lightness without changing hue/saturation', () => {
    const shifted = shiftLightness({ h: 240, s: 0.7, l: 0.5 }, -0.1);
    expect(shifted).toEqual({ h: 240, s: 0.7, l: 0.4 });
  });

  it('clamps to [0,1]', () => {
    expect(shiftLightness({ h: 0, s: 0, l: 0.95 }, 0.5).l).toBe(1);
    expect(shiftLightness({ h: 0, s: 0, l: 0.05 }, -0.5).l).toBe(0);
  });
});

describe('relativeLuminance', () => {
  it('returns 1 for white and 0 for black', () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);
  });

  it('puts pure green higher than pure red and red higher than blue', () => {
    const r = relativeLuminance({ r: 255, g: 0, b: 0 });
    const g = relativeLuminance({ r: 0, g: 255, b: 0 });
    const b = relativeLuminance({ r: 0, g: 0, b: 255 });
    expect(g).toBeGreaterThan(r);
    expect(r).toBeGreaterThan(b);
  });
});

describe('deriveColorRole', () => {
  it('produces a darker hover and a darker-still active', () => {
    const role = deriveColorRole('#4f46e5');
    const main = parseHex(role.main)!;
    const hover = parseHex(role.hover)!;
    const active = parseHex(role.active)!;
    expect(rgbToHsl(hover).l).toBeLessThan(rgbToHsl(main).l);
    expect(rgbToHsl(active).l).toBeLessThan(rgbToHsl(hover).l);
  });

  it('returns white contrast for dark mains', () => {
    expect(deriveColorRole('#000000').contrast).toBe('#ffffff');
    expect(deriveColorRole('#4f46e5').contrast).toBe('#ffffff');
  });

  it('returns near-black contrast for light mains', () => {
    expect(deriveColorRole('#ffffff').contrast).toBe('#111827');
    expect(deriveColorRole('#fde68a').contrast).toBe('#111827');
  });

  it('produces a subtle tint very close to white', () => {
    const role = deriveColorRole('#4f46e5');
    const subtle = parseHex(role.subtle)!;
    expect(subtle.r).toBeGreaterThan(220);
    expect(subtle.g).toBeGreaterThan(220);
    expect(subtle.b).toBeGreaterThan(220);
  });

  it('produces a border lighter than main but still tinted', () => {
    const role = deriveColorRole('#4f46e5');
    const border = parseHex(role.border)!;
    const main = parseHex(role.main)!;
    expect(border.r).toBeGreaterThan(main.r);
    expect(border.g).toBeGreaterThan(main.g);
    expect(border.b).toBeGreaterThan(main.b);
  });

  it('falls back gracefully for unparseable inputs', () => {
    const role = deriveColorRole('var(--sds-palette-primary-main)');
    expect(role.main).toBe('var(--sds-palette-primary-main)');
    expect(role.contrast).toBe('#111827');
  });

  it('normalizes input hex casing', () => {
    expect(deriveColorRole('#4F46E5').main).toBe('#4f46e5');
  });
});
