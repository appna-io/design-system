import type { ColorRole } from '../types/color';

/**
 * Color utilities shared by the engine and the Theme Studio. All public helpers operate on
 * 6-digit lowercase hex strings (e.g. `'#4f46e5'`) — the only color format we persist in tokens.
 */

/** Result of parsing a hex string into 0-255 RGB channels. */
interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/** Result of converting RGB into 0-1 HSL channels. */
interface HslColor {
  h: number;
  s: number;
  l: number;
}

const HEX6 = /^#?([0-9a-f]{6})$/i;
const HEX3 = /^#?([0-9a-f]{3})$/i;

/**
 * Parse a hex color string (`#rgb` or `#rrggbb`, with or without leading `#`, any case) into
 * 0-255 RGB channels. Returns `null` if the input doesn't match a hex format — callers should
 * fall back to a known-good default instead of throwing, so the Studio stays resilient to
 * unexpected token values (e.g. CSS variables, named colors).
 */
export function parseHex(input: string): RgbColor | null {
  const trimmed = String(input).trim();
  const m6 = HEX6.exec(trimmed);
  if (m6 && m6[1]) {
    const hex = m6[1];
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  const m3 = HEX3.exec(trimmed);
  if (m3 && m3[1]) {
    const hex = m3[1];
    return {
      r: parseInt(hex[0]! + hex[0]!, 16),
      g: parseInt(hex[1]! + hex[1]!, 16),
      b: parseInt(hex[2]! + hex[2]!, 16),
    };
  }
  return null;
}

/** Format 0-255 RGB channels back into a 6-digit lowercase hex string. */
export function rgbToHex({ r, g, b }: RgbColor): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Convert 0-255 RGB into HSL with H in 0-360 and S/L in 0-1. */
export function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case rn:
      h = (gn - bn) / d + (gn < bn ? 6 : 0);
      break;
    case gn:
      h = (bn - rn) / d + 2;
      break;
    case bn:
      h = (rn - gn) / d + 4;
      break;
  }
  return { h: h * 60, s, l };
}

/** Convert HSL (H 0-360, S/L 0-1) back into 0-255 RGB. */
export function hslToRgb({ h, s, l }: HslColor): RgbColor {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = (((h % 360) + 360) % 360) / 360;
  const hueToRgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return {
    r: Math.round(hueToRgb(hk + 1 / 3) * 255),
    g: Math.round(hueToRgb(hk) * 255),
    b: Math.round(hueToRgb(hk - 1 / 3) * 255),
  };
}

/** Relative-luminance approximation in 0-1; used to pick a white-or-near-black `contrast`. */
export function relativeLuminance({ r, g, b }: RgbColor): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Linearly mix two RGB colors. `t = 0` → `a`, `t = 1` → `b`. */
export function mixRgb(a: RgbColor, b: RgbColor, t: number): RgbColor {
  const k = Math.max(0, Math.min(1, t));
  return {
    r: a.r + (b.r - a.r) * k,
    g: a.g + (b.g - a.g) * k,
    b: a.b + (b.b - a.b) * k,
  };
}

/** Shift an HSL color's lightness by `deltaL` (in 0-1 units). Returns a new HSL color. */
export function shiftLightness(hsl: HslColor, deltaL: number): HslColor {
  return { ...hsl, l: Math.max(0, Math.min(1, hsl.l + deltaL)) };
}

const WHITE: RgbColor = { r: 255, g: 255, b: 255 };
const NEAR_BLACK = '#111827';

/**
 * Expand a single `main` color into a full `ColorRole` (main / hover / active / contrast /
 * subtle / border). Used by the Theme Studio so users can pick one color and let the DS derive
 * the rest in a consistent style.
 *
 * Algorithm — all heuristics tuned for the apx-ds neutral surfaces:
 *
 * - `hover`   = main with lightness − 8% (clamped 0-1)
 * - `active`  = main with lightness − 16%
 * - `subtle`  = mix(main, white, 92%) — a faint tinted background
 * - `border`  = mix(main, white, 65%) — readable separator on white surfaces
 * - `contrast`= white when `main`'s relative luminance < 0.55, else `#111827`
 *
 * For unparseable inputs (CSS vars, named colors, …) the function returns a role built around
 * the original input string — i.e. all six slots equal `main` — so the Studio stays usable but
 * the operator sees that derivation failed.
 */
export function deriveColorRole(main: string): ColorRole {
  const rgb = parseHex(main);
  if (!rgb) {
    return { main, hover: main, active: main, contrast: NEAR_BLACK, subtle: main, border: main };
  }
  const hsl = rgbToHsl(rgb);
  const hover = rgbToHex(hslToRgb(shiftLightness(hsl, -0.08)));
  const active = rgbToHex(hslToRgb(shiftLightness(hsl, -0.16)));
  const subtle = rgbToHex(mixRgb(rgb, WHITE, 0.92));
  const border = rgbToHex(mixRgb(rgb, WHITE, 0.65));
  const contrast = relativeLuminance(rgb) < 0.55 ? '#ffffff' : NEAR_BLACK;
  return { main: rgbToHex(rgb), hover, active, contrast, subtle, border };
}
