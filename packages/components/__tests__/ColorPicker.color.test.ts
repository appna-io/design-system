import { describe, expect, it } from 'vitest';

import {
  contrastRatio,
  detectFormat,
  formatColor,
  hslaToRgba,
  hsvaToRgba,
  parseColor,
  rgbaEquals,
  rgbaToHsla,
  rgbaToHsva,
  relativeLuminance,
  wcagLevel,
} from '../src/ColorPicker/_shared/color';

describe('color — parseColor', () => {
  it('parses 6-digit hex', () => {
    expect(parseColor('#FF0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor('#6c5ce7')).toEqual({ r: 108, g: 92, b: 231, a: 1 });
  });

  it('parses 3-digit hex', () => {
    expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 });
  });

  it('parses 8-digit hex with alpha', () => {
    const result = parseColor('#FF000080');
    expect(result.r).toBe(255);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
    expect(result.a).toBeCloseTo(0.502, 2);
  });

  it('parses 4-digit hex with alpha', () => {
    const result = parseColor('#f008');
    expect(result.r).toBe(255);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
    expect(result.a).toBeCloseTo(0.533, 2);
  });

  it('parses rgb() with comma-separated values', () => {
    expect(parseColor('rgb(108, 92, 231)')).toEqual({ r: 108, g: 92, b: 231, a: 1 });
  });

  it('parses rgb() with space-separated values', () => {
    expect(parseColor('rgb(108 92 231)')).toEqual({ r: 108, g: 92, b: 231, a: 1 });
  });

  it('parses rgba() with alpha', () => {
    expect(parseColor('rgba(108, 92, 231, 0.5)')).toEqual({ r: 108, g: 92, b: 231, a: 0.5 });
  });

  it('parses hsl()', () => {
    const result = parseColor('hsl(0, 100%, 50%)');
    expect(result.r).toBe(255);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
    expect(result.a).toBe(1);
  });

  it('parses hsla() with alpha', () => {
    const result = parseColor('hsla(0, 100%, 50%, 0.5)');
    expect(result.a).toBe(0.5);
  });

  it('parses "transparent" as black with alpha 0', () => {
    expect(parseColor('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it('falls back to black for unparseable input', () => {
    expect(parseColor('not-a-color')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });
});

describe('color — formatColor', () => {
  it('formats RGB as 6-digit hex when alpha = 1', () => {
    expect(formatColor({ r: 108, g: 92, b: 231, a: 1 }, 'hex')).toBe('#6c5ce7');
  });

  it('formats RGB as 8-digit hex when alpha < 1', () => {
    expect(formatColor({ r: 108, g: 92, b: 231, a: 0.5 }, 'hex')).toBe('#6c5ce780');
  });

  it('formats RGB as rgb() when alpha = 1', () => {
    expect(formatColor({ r: 108, g: 92, b: 231, a: 1 }, 'rgb')).toBe('rgb(108, 92, 231)');
  });

  it('formats RGB as rgba() when alpha < 1', () => {
    expect(formatColor({ r: 108, g: 92, b: 231, a: 0.5 }, 'rgb')).toBe('rgba(108, 92, 231, 0.5)');
  });

  it('formats RGB as hsl()', () => {
    const out = formatColor({ r: 255, g: 0, b: 0, a: 1 }, 'hsl');
    expect(out).toMatch(/^hsl\(0,\s*100%,\s*50%\)$/);
  });

  it('formats RGB as hsla() when alpha < 1', () => {
    const out = formatColor({ r: 255, g: 0, b: 0, a: 0.5 }, 'hsl');
    expect(out).toMatch(/^hsla\(0,\s*100%,\s*50%,\s*0\.5\)$/);
  });
});

describe('color — detectFormat', () => {
  it('detects hex', () => {
    expect(detectFormat('#abc')).toBe('hex');
    expect(detectFormat('#aabbcc')).toBe('hex');
  });
  it('detects rgb', () => {
    expect(detectFormat('rgb(0, 0, 0)')).toBe('rgb');
    expect(detectFormat('rgba(0, 0, 0, 0)')).toBe('rgb');
  });
  it('detects hsl', () => {
    expect(detectFormat('hsl(0, 0%, 0%)')).toBe('hsl');
  });
  it('falls back to hex for unknown', () => {
    expect(detectFormat('foo')).toBe('hex');
    expect(detectFormat('')).toBe('hex');
  });
});

describe('color — round-trip conversions', () => {
  const VERTICES: Array<[number, number, number]> = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0],
    [255, 0, 255],
    [0, 255, 255],
    [255, 255, 255],
    [0, 0, 0],
    [128, 128, 128],
  ];

  it('RGB → HSV → RGB round-trips within 1 unit for vertices', () => {
    for (const [r, g, b] of VERTICES) {
      const out = hsvaToRgba(rgbaToHsva({ r, g, b, a: 1 }));
      expect(out.r).toBeCloseTo(r, 0);
      expect(out.g).toBeCloseTo(g, 0);
      expect(out.b).toBeCloseTo(b, 0);
    }
  });

  it('RGB → HSL → RGB round-trips within 1 unit for vertices', () => {
    for (const [r, g, b] of VERTICES) {
      const out = hslaToRgba(rgbaToHsla({ r, g, b, a: 1 }));
      expect(out.r).toBeCloseTo(r, 0);
      expect(out.g).toBeCloseTo(g, 0);
      expect(out.b).toBeCloseTo(b, 0);
    }
  });

  it('preserves alpha across HSV round-trip', () => {
    const out = hsvaToRgba(rgbaToHsva({ r: 100, g: 50, b: 200, a: 0.42 }));
    expect(out.a).toBeCloseTo(0.42, 2);
  });
});

describe('color — WCAG contrast', () => {
  it('returns 21 for pure black on pure white', () => {
    const ratio = contrastRatio({ r: 0, g: 0, b: 0, a: 1 }, { r: 255, g: 255, b: 255, a: 1 });
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('returns 1 for identical colors', () => {
    const ratio = contrastRatio({ r: 128, g: 128, b: 128, a: 1 }, { r: 128, g: 128, b: 128, a: 1 });
    expect(ratio).toBeCloseTo(1, 5);
  });

  it('passes AAA for black on white', () => {
    const ratio = contrastRatio({ r: 0, g: 0, b: 0, a: 1 }, { r: 255, g: 255, b: 255, a: 1 });
    expect(wcagLevel(ratio)).toBe('AAA');
  });

  it('fails for low-contrast pair', () => {
    const ratio = contrastRatio({ r: 200, g: 200, b: 200, a: 1 }, { r: 255, g: 255, b: 255, a: 1 });
    expect(wcagLevel(ratio)).toBe('fail');
  });

  it('returns relative luminance 0 for black, 1 for white', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0, a: 1 })).toBeCloseTo(0, 5);
    expect(relativeLuminance({ r: 255, g: 255, b: 255, a: 1 })).toBeCloseTo(1, 5);
  });
});

describe('color — rgbaEquals', () => {
  it('considers identical RGBA equal', () => {
    expect(rgbaEquals({ r: 1, g: 2, b: 3, a: 0.5 }, { r: 1, g: 2, b: 3, a: 0.5 })).toBe(true);
  });

  it('tolerates sub-unit float drift on alpha', () => {
    expect(rgbaEquals({ r: 1, g: 2, b: 3, a: 0.5 }, { r: 1, g: 2, b: 3, a: 0.5001 })).toBe(true);
  });

  it('rounds RGB before comparing', () => {
    expect(rgbaEquals({ r: 1.4, g: 2.4, b: 3.4, a: 1 }, { r: 1, g: 2, b: 3, a: 1 })).toBe(true);
  });

  it('rejects different colors', () => {
    expect(rgbaEquals({ r: 1, g: 2, b: 3, a: 1 }, { r: 4, g: 5, b: 6, a: 1 })).toBe(false);
  });
});