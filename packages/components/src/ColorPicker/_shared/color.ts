/**
 * Pure color math for `<ColorPicker />` and `<ColorSwatch />`. ~120 LoC, zero dependencies.
 *
 * **Why local + pure?** A library like `tinycolor2` would add ~10 KB gz for the same handful of
 * conversions we actually need. The engine already ships hex / hsl helpers in
 * `@apx-ui/engine/color`, but those are 6-digit-hex-only (the format we persist in tokens)
 * and don't carry an alpha channel. The picker needs rgba, hsla, hex-8, and HSVA — so we ship
 * a self-contained module here. If Theme Studio (Phase 5.6) and future components (e.g.
 * Toast / Alert wanting a WCAG ratio chip) ever need the same surface, this file is the
 * promotion candidate to `@apx-ui/engine/color` — note in the phase outcomes.
 *
 * All channel conventions:
 *
 *   RGBA — r, g, b ∈ [0, 255], a ∈ [0, 1]
 *   HSLA — h ∈ [0, 360), s, l ∈ [0, 1], a ∈ [0, 1]
 *   HSVA — h ∈ [0, 360), s, v ∈ [0, 1], a ∈ [0, 1]
 *
 * HSVA is the picker's internal model (it maps cleanly to the saturation-square interaction);
 * RGBA is the I/O hub everything passes through to talk to the outside world.
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HSLA {
  h: number;
  s: number;
  l: number;
  a: number;
}

export interface HSVA {
  h: number;
  s: number;
  v: number;
  a: number;
}

/** The three formats `<ColorPicker format>` accepts (plus `'auto'`, handled at the component level). */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

const HEX3 = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const HEX4 = /^#?([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const HEX6 = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const HEX8 = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const RGB_FN = /^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/i;
const HSL_FN = /^hsla?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/i;

const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n));
const clamp01 = (n: number): number => clamp(n, 0, 1);
const clamp255 = (n: number): number => clamp(Math.round(n), 0, 255);
const round = (n: number, digits = 0): number => {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
};

/**
 * Parse any CSS-valid color string into an RGBA object. Accepts:
 *
 *   `#abc` / `#abcd` / `#aabbcc` / `#aabbccdd`
 *   `rgb(r g b)` / `rgb(r, g, b)` / `rgba(r, g, b, a)` / `rgb(r g b / a)`
 *   `hsl(h, s%, l%)` / `hsla(h s% l% / a)` / `hsl(h s% l% / a)`
 *   `transparent`
 *
 * Returns a default black (`{r:0, g:0, b:0, a:1}`) for inputs we can't make sense of so the
 * picker never crashes on a bad value. Consumers expecting strict parsing should pre-validate.
 */
export function parseColor(input: string): RGBA {
  if (input == null) return { r: 0, g: 0, b: 0, a: 1 };
  const raw = String(input).trim().toLowerCase();
  if (raw === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

  const hex8 = HEX8.exec(raw);
  if (hex8) {
    return {
      r: parseInt(hex8[1]!, 16),
      g: parseInt(hex8[2]!, 16),
      b: parseInt(hex8[3]!, 16),
      a: round(parseInt(hex8[4]!, 16) / 255, 3),
    };
  }
  const hex6 = HEX6.exec(raw);
  if (hex6) {
    return {
      r: parseInt(hex6[1]!, 16),
      g: parseInt(hex6[2]!, 16),
      b: parseInt(hex6[3]!, 16),
      a: 1,
    };
  }
  const hex4 = HEX4.exec(raw);
  if (hex4) {
    return {
      r: parseInt(hex4[1]! + hex4[1]!, 16),
      g: parseInt(hex4[2]! + hex4[2]!, 16),
      b: parseInt(hex4[3]! + hex4[3]!, 16),
      a: round(parseInt(hex4[4]! + hex4[4]!, 16) / 255, 3),
    };
  }
  const hex3 = HEX3.exec(raw);
  if (hex3) {
    return {
      r: parseInt(hex3[1]! + hex3[1]!, 16),
      g: parseInt(hex3[2]! + hex3[2]!, 16),
      b: parseInt(hex3[3]! + hex3[3]!, 16),
      a: 1,
    };
  }

  const rgb = RGB_FN.exec(raw);
  if (rgb) {
    return {
      r: clamp255(parseFloat(rgb[1]!)),
      g: clamp255(parseFloat(rgb[2]!)),
      b: clamp255(parseFloat(rgb[3]!)),
      a: parseAlpha(rgb[4]),
    };
  }

  const hsl = HSL_FN.exec(raw);
  if (hsl) {
    return hslaToRgba({
      h: parseFloat(hsl[1]!),
      s: clamp01(parseFloat(hsl[2]!) / 100),
      l: clamp01(parseFloat(hsl[3]!) / 100),
      a: parseAlpha(hsl[4]),
    });
  }

  return { r: 0, g: 0, b: 0, a: 1 };
}

function parseAlpha(raw: string | undefined): number {
  if (raw == null || raw === '') return 1;
  if (raw.endsWith('%')) return clamp01(parseFloat(raw) / 100);
  return clamp01(parseFloat(raw));
}

/**
 * Detect a color string's format. Returns `'hex'` for `#…`, `'rgb'` for `rgb()` / `rgba()`,
 * `'hsl'` for `hsl()` / `hsla()`. Falls back to `'hex'` for anything else — this is what powers
 * `format="auto"`'s "preserve the input format" promise.
 */
export function detectFormat(input: string): ColorFormat {
  if (!input) return 'hex';
  const raw = String(input).trim().toLowerCase();
  if (raw.startsWith('#')) return 'hex';
  if (raw.startsWith('rgb')) return 'rgb';
  if (raw.startsWith('hsl')) return 'hsl';
  return 'hex';
}

/**
 * Serialize an RGBA into the chosen format. Drops the alpha channel from `'hex'` output when
 * `a === 1` (so the common case stays 6-digit), keeps `rgba(…)` / `hsla(…)` always for the
 * functional notations when `a < 1` so consumers can round-trip.
 */
export function formatColor(rgba: RGBA, format: ColorFormat): string {
  const a = clamp01(rgba.a);
  if (format === 'hex') {
    const hex = `#${toHex2(rgba.r)}${toHex2(rgba.g)}${toHex2(rgba.b)}`;
    if (a >= 1) return hex;
    return `${hex}${toHex2(Math.round(a * 255))}`;
  }
  if (format === 'rgb') {
    const r = clamp255(rgba.r);
    const g = clamp255(rgba.g);
    const b = clamp255(rgba.b);
    if (a >= 1) return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${round(a, 2)})`;
  }
  // hsl
  const hsl = rgbaToHsla(rgba);
  const h = round(((hsl.h % 360) + 360) % 360, 0);
  const s = round(hsl.s * 100, 0);
  const l = round(hsl.l * 100, 0);
  if (a >= 1) return `hsl(${h}, ${s}%, ${l}%)`;
  return `hsla(${h}, ${s}%, ${l}%, ${round(a, 2)})`;
}

function toHex2(n: number): string {
  return clamp255(n).toString(16).padStart(2, '0');
}

/**
 * RGBA → HSVA. Standard conversion; the only twist is that HSVA's hue collapses to `0` when
 * the input is greyscale (all three channels equal). We keep the previous hue intact at the
 * call-site (`SaturationSquare`) so dragging into the greyscale corner doesn't surprise the
 * user with a hue snap on the way back out.
 */
export function rgbaToHsva(rgba: RGBA): HSVA {
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, v, a: rgba.a };
}

/** HSVA → RGBA. */
export function hsvaToRgba(hsva: HSVA): RGBA {
  const h = ((hsva.h % 360) + 360) % 360;
  const s = clamp01(hsva.s);
  const v = clamp01(hsva.v);
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return {
    r: clamp255((r + m) * 255),
    g: clamp255((g + m) * 255),
    b: clamp255((b + m) * 255),
    a: clamp01(hsva.a),
  };
}

/** RGBA → HSLA. */
export function rgbaToHsla(rgba: RGBA): HSLA {
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l, a: rgba.a };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    case b:
      h = (r - g) / d + 4;
      break;
  }
  return { h: h * 60, s, l, a: rgba.a };
}

/** HSLA → RGBA. */
export function hslaToRgba(hsla: HSLA): RGBA {
  const h = ((hsla.h % 360) + 360) % 360;
  const s = clamp01(hsla.s);
  const l = clamp01(hsla.l);
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v, a: clamp01(hsla.a) };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = h / 360;
  const hueToRgb = (t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return {
    r: clamp255(hueToRgb(hk + 1 / 3) * 255),
    g: clamp255(hueToRgb(hk) * 255),
    b: clamp255(hueToRgb(hk - 1 / 3) * 255),
    a: clamp01(hsla.a),
  };
}

/**
 * Relative luminance per WCAG 2.x. The `linearize` step uses the canonical sRGB transfer
 * function (γ ≈ 2.4 with a small linear toe near zero), not the simpler `^2.2` approximation.
 */
function linearize(channel01: number): number {
  return channel01 <= 0.03928 ? channel01 / 12.92 : Math.pow((channel01 + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgba: RGBA): number {
  const r = linearize(rgba.r / 255);
  const g = linearize(rgba.g / 255);
  const b = linearize(rgba.b / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG contrast ratio. Always returns a value in `[1, 21]`. Alpha is ignored — both colors are
 * treated as fully opaque since WCAG doesn't define contrast for translucent foregrounds.
 * Consumers wanting "translucent fg on solid bg" semantics should pre-composite.
 */
export function contrastRatio(fg: RGBA, bg: RGBA): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG conformance level for a given contrast ratio + text size. */
export type WcagLevel = 'AAA' | 'AA' | 'fail';

export function wcagLevel(ratio: number, size: 'normal' | 'large' = 'normal'): WcagLevel {
  if (size === 'large') {
    if (ratio >= 4.5) return 'AAA';
    if (ratio >= 3) return 'AA';
    return 'fail';
  }
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'fail';
}

/**
 * Equality check for the picker's controlled-loop hygiene. RGBA tuples compare with a small
 * epsilon on the alpha channel so a round-trip through HSL doesn't trigger a spurious commit
 * (e.g. `0.5` → `hsla(…, 0.5)` → `parseColor` → `0.5` could read back as `0.500000001`).
 */
export function rgbaEquals(a: RGBA, b: RGBA): boolean {
  return (
    Math.round(a.r) === Math.round(b.r) &&
    Math.round(a.g) === Math.round(b.g) &&
    Math.round(a.b) === Math.round(b.b) &&
    Math.abs(a.a - b.a) < 1e-3
  );
}
