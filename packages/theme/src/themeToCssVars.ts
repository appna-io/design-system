import { TOKEN_PREFIX, type PaletteShape, type ThemeShape } from '@apx-ui/engine';
import {
  getThemeVariant,
  themeVariants,
  type ThemePlatform,
  type ThemeVariantOverrides,
} from '@apx-ui/tokens';

interface FlatVars {
  [name: string]: string;
}

function flatten(prefix: string, value: unknown, out: FlatVars): void {
  if (value === null || value === undefined) return;
  if (typeof value === 'string' || typeof value === 'number') {
    out[prefix] = String(value);
    return;
  }
  if (typeof value === 'object') {
    for (const [key, sub] of Object.entries(value as Record<string, unknown>)) {
      flatten(`${prefix}-${kebab(key)}`, sub, out);
    }
  }
}

function kebab(key: string): string {
  return String(key)
    .replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
    .replace(/\./g, '-');
}

/** Turn a palette into `--sds-palette-…` vars. */
function paletteVars(palette: PaletteShape): FlatVars {
  const out: FlatVars = {};
  flatten(`${TOKEN_PREFIX}-palette`, palette, out);
  return out;
}

/**
 * Convert a (partial) theme into a flat map of CSS vars using the **canonical** naming the
 * runtime expects (`--sds-font-sans`, `--sds-duration-fast`, etc.). Single source of truth for
 * both the base `:root` block and variant / platform override blocks — guaranteeing that an
 * override always lands on the exact var name the base writes.
 */
function partialThemeToVars(partial: Partial<ThemeShape> | ThemeVariantOverrides): FlatVars {
  const out: FlatVars = {};
  const p = partial as Partial<ThemeShape>;
  if (p.radius) flatten(`${TOKEN_PREFIX}-radius`, p.radius, out);
  if (p.shadows) flatten(`${TOKEN_PREFIX}-shadows`, p.shadows, out);
  if (p.spacing) flatten(`${TOKEN_PREFIX}-spacing`, p.spacing, out);
  if (p.zIndex) flatten(`${TOKEN_PREFIX}-z-index`, p.zIndex, out);

  if (p.typography) {
    const t = p.typography;
    if (t.fontSize) flatten(`${TOKEN_PREFIX}-font-size`, t.fontSize, out);
    if (t.fontWeight) flatten(`${TOKEN_PREFIX}-font-weight`, t.fontWeight, out);
    if (t.lineHeight) flatten(`${TOKEN_PREFIX}-line-height`, t.lineHeight, out);
    if (t.letterSpacing) flatten(`${TOKEN_PREFIX}-letter-spacing`, t.letterSpacing, out);
    if (t.fontFamily?.sans) out[`${TOKEN_PREFIX}-font-sans`] = t.fontFamily.sans;
    if (t.fontFamily?.mono) out[`${TOKEN_PREFIX}-font-mono`] = t.fontFamily.mono;
    if (t.fontFamily?.display) out[`${TOKEN_PREFIX}-font-display`] = t.fontFamily.display;
  }

  if (p.motion) {
    // Durations are enumerated by iteration, not by name: the scale grows (`slower`,
    // `deliberate`), and a hand-listed set drops any new key silently — the var never gets
    // emitted, so a `duration-slower` utility resolves to nothing and the animation falls back to
    // the browser default with no error anywhere. They can't just go through `flatten` like the
    // easings, because the token is a number and CSS needs the `ms` unit.
    for (const [name, value] of Object.entries(p.motion.duration ?? {})) {
      if (value !== undefined) out[`${TOKEN_PREFIX}-duration-${name}`] = `${value}ms`;
    }
    if (p.motion.ease) flatten(`${TOKEN_PREFIX}-ease`, p.motion.ease, out);
  }

  return out;
}

/** Serialize a flat map of vars into a sorted CSS declaration block. */
function varsToBlock(vars: FlatVars): string {
  return Object.keys(vars)
    .sort()
    .map((k) => `  ${k}: ${vars[k]};`)
    .join('\n');
}

export interface ThemeToCssVarsOptions {
  /**
   * Selector for the element that carries the theme's `data-mode` / `data-variant` /
   * `data-platform` attributes. Defaults to `:root`.
   *
   * Every other selector in the output is derived from this one, so pointing it at a scope
   * (`[data-apx-theme-scope='x']`) emits the whole theme — base, dark, variants, platform
   * overlays — onto that subtree instead of the document. That is what `<ThemeProvider scope>`
   * passes.
   */
  selector?: string;
  /** Selector used for `light` mode rules. Defaults to `selector`. */
  rootSelector?: string;
  /** Attribute selector used for dark mode. Defaults to `` `${selector}[data-mode='dark']` ``. */
  darkSelector?: string;
  /**
   * Whether to emit variant-specific overrides keyed on `[data-variant='…']`. Defaults to `true`.
   * Set false if you only ship the active variant statically.
   */
  emitVariants?: boolean;
}

/**
 * Serialize a `Theme` into a CSS string with up to four layers of rules (shown with the default
 * `:root` selector; all four follow `options.selector`):
 *
 * 1. `:root { … }` — light palette + scales (radii, shadows, motion, typography, z-index).
 * 2. `:root[data-mode='dark'] { … }` — dark palette overrides.
 * 3. `:root[data-variant='<name>'] { … }` — token overrides per built-in variant.
 * 4. `:root[data-variant='<name>'][data-platform='<apple|other>'] { … }` — per-platform overlay
 *    (used by the adaptive `default` variant for the Cupertino sub-look on Safari).
 *
 * All four are derived from a single `selector` so a scoped theme cannot half-escape: emitting
 * layers 1–2 onto a subtree while 3–4 still targeted `:root` would leak a nested provider's
 * variant tokens onto the whole document.
 *
 * The output is deterministic (alphabetically sorted) for snapshot testing.
 */
export function themeToCssVars(theme: ThemeShape, options: ThemeToCssVarsOptions = {}): string {
  const {
    selector = ':root',
    rootSelector = selector,
    darkSelector = `${selector}[data-mode='dark']`,
    emitVariants = true,
  } = options;

  const baseLight: FlatVars = {
    ...paletteVars(theme.palette.light),
    ...partialThemeToVars(theme),
    [`${TOKEN_PREFIX}-overlay`]: theme.palette.light.overlay,
    [`${TOKEN_PREFIX}-focus-ring`]: theme.palette.light.focusRing,
  };

  const darkOverrides: FlatVars = {
    ...paletteVars(theme.palette.dark),
    [`${TOKEN_PREFIX}-overlay`]: theme.palette.dark.overlay,
    [`${TOKEN_PREFIX}-focus-ring`]: theme.palette.dark.focusRing,
  };

  const blocks: string[] = [
    `${rootSelector} {\n${varsToBlock(baseLight)}\n}`,
    `${darkSelector} {\n${varsToBlock(darkOverrides)}\n}`,
  ];

  if (emitVariants) {
    const platforms: ThemePlatform[] = ['apple', 'other'];
    for (const variantName of Object.keys(themeVariants).sort()) {
      const variant = getThemeVariant(variantName);

      const variantVars = partialThemeToVars(variant.tokens);
      if (Object.keys(variantVars).length > 0) {
        blocks.push(`${selector}[data-variant='${variantName}'] {\n${varsToBlock(variantVars)}\n}`);
      }

      const overrides = variant.platformOverrides;
      if (!overrides) continue;
      for (const platform of platforms) {
        const platformOverride = overrides[platform];
        if (!platformOverride) continue;
        const platformVars = partialThemeToVars(platformOverride);
        if (Object.keys(platformVars).length === 0) continue;
        blocks.push(
          `${selector}[data-variant='${variantName}'][data-platform='${platform}'] {\n${varsToBlock(platformVars)}\n}`,
        );
      }
    }
  }

  return blocks.join('\n\n');
}