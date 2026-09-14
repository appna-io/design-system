/**
 * Pure colour maths — sRGB conversion, WCAG relative luminance, contrast ratio, and an sRGB mix.
 *
 * ## Why it lives in `tokens` rather than `theme`
 *
 * Three copies of this existed. `theme` had one (private to `deriveDarkPalette`), `theme` had a
 * second consumer in `auditPaletteContrast`, and `tokens`' own guard test had written its own from
 * scratch — **not** out of carelessness, but because `@apx-ui/theme` depends on `@apx-ui/tokens`
 * and the arrow only goes one way. A test guarding the default palettes physically could not
 * import the implementation that already existed.
 *
 * So the primitive belongs at the bottom of the graph, where anything can reach it. It has no
 * React, no theme concepts and no tokens of its own — it is arithmetic over hex strings, and it is
 * the arithmetic four separate bugs today were only visible through.
 *
 * `theme` re-exports `hexToHsl` / `hslToHex` / `contrastRatio` so existing imports keep working.
 */

/** Hue, saturation, lightness — each normalised to 0–1. */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export function hexToHsl(hex: string): Hsl | undefined {
  const clean = hex.trim().replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return undefined;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return { h: 0, s: 0, l };

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return { h, s, l };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const value = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * value)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const channel = (i: number) => {
    const c = parseInt(clean.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Mix two hexes in sRGB. `amount` is how much of `from` survives. */
export function mix(from: string, amount: number, towards: string): string {
  const a = from.replace('#', '');
  const b = towards.replace('#', '');
  let out = '#';
  for (let i = 0; i < 6; i += 2) {
    const v = Math.round(
      parseInt(a.slice(i, i + 2), 16) * amount + parseInt(b.slice(i, i + 2), 16) * (1 - amount),
    );
    out += v.toString(16).padStart(2, '0');
  }
  return out;
}
