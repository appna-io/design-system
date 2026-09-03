import type { CSSProperties } from 'react';
import { token } from './token';
import type { Sx } from './types/sx';

/**
 * Short-name aliases recognized in `sx` objects, mapped to canonical CSS properties.
 * Adding aliases is a one-line change; the resolver picks them up automatically.
 */
const ALIASES: Record<string, keyof CSSProperties> = {
  bg: 'backgroundColor',
  color: 'color',
  fg: 'color',
  m: 'margin',
  mt: 'marginTop',
  mr: 'marginRight',
  mb: 'marginBottom',
  ml: 'marginLeft',
  mx: 'marginInline',
  my: 'marginBlock',
  p: 'padding',
  pt: 'paddingTop',
  pr: 'paddingRight',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  px: 'paddingInline',
  py: 'paddingBlock',
  w: 'width',
  h: 'height',
  radius: 'borderRadius',
  shadow: 'boxShadow',
  z: 'zIndex',
};

/**
 * Mapping from CSS property name → which token namespace its string values should resolve under.
 * E.g. `backgroundColor: 'primary.main'` becomes `var(--sds-palette-primary-main)`.
 */
const TOKEN_NAMESPACES: Partial<Record<keyof CSSProperties, string>> = {
  backgroundColor: 'palette',
  color: 'palette',
  borderColor: 'palette',
  borderRadius: 'radius',
  boxShadow: 'shadows',
  zIndex: 'zIndex',
  // Spacing-aware properties — numeric / Tailwind-like keys (`"6"`, `"1.5"`) resolve to
  // `var(--sds-spacing-N)` so `<Div gap="6">` matches `className="gap-6"`.
  gap: 'spacing',
  rowGap: 'spacing',
  columnGap: 'spacing',
  margin: 'spacing',
  marginTop: 'spacing',
  marginRight: 'spacing',
  marginBottom: 'spacing',
  marginLeft: 'spacing',
  marginInline: 'spacing',
  marginBlock: 'spacing',
  padding: 'spacing',
  paddingTop: 'spacing',
  paddingRight: 'spacing',
  paddingBottom: 'spacing',
  paddingLeft: 'spacing',
  paddingInline: 'spacing',
  paddingBlock: 'spacing',
  top: 'spacing',
  right: 'spacing',
  bottom: 'spacing',
  left: 'spacing',
  inset: 'spacing',
  width: 'spacing',
  height: 'spacing',
  minWidth: 'spacing',
  minHeight: 'spacing',
  maxWidth: 'spacing',
  maxHeight: 'spacing',
};

const PALETTE_ROLES = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

/** The three non-role palette groups. Their default slot is `default`, not `main`. */
const PALETTE_SURFACES = ['background', 'foreground', 'border'];

/**
 * Short prefixes accepted in palette *values*, mirroring the ones already accepted as `sx` **keys**
 * (`fg`, `bg` in `ALIASES`) and the Tailwind preset's own vocabulary (`text-fg-muted`,
 * `bg-bg-paper`).
 *
 * Leaving these out was a silent-failure bug: `<Typography color="fg.muted">` looked idiomatic —
 * the DS teaches `fg` on one side of the wall — but `fg` was not a recognised value prefix, so the
 * string passed through untouched and the browser dropped `color: fg.muted` as invalid. No error,
 * no warning; the text just inherited its colour. 479 declarations across this repo were dead this
 * way, including `PricingCard`'s cadence and blurb.
 */
const PALETTE_VALUE_ALIASES: Record<string, string> = {
  fg: 'foreground',
  bg: 'background',
};

/**
 * Normalise a palette value to a full `group.slot` path.
 *
 * Two shorthands are expanded here, both of which previously produced a CSS variable that is
 * never emitted (or no variable at all):
 *
 *  - `fg.muted` → `foreground.muted`, `bg.paper` → `background.paper`.
 *  - A bare group → its default slot: `primary` → `primary.main`, `border` → `border.default`.
 *    `themeToCssVars` flattens the palette one variable **per slot** and never emits a bare
 *    `--sds-palette-primary`, so `color="primary"` used to resolve to a variable that does not
 *    exist. This is the same defect that made the renderer's `<Inspectable>` outline invisible,
 *    reachable from a prop.
 *
 * Returns the value unchanged when it is already a full path.
 */
function normalizePaletteValue(value: string): string {
  const [head, ...rest] = value.split('.');
  const group = PALETTE_VALUE_ALIASES[head ?? ''] ?? head ?? '';

  if (rest.length > 0) return [group, ...rest].join('.');
  if (PALETTE_ROLES.includes(group)) return `${group}.main`;
  if (PALETTE_SURFACES.includes(group)) return `${group}.default`;
  return value;
}

/** Whether a palette value names a group this resolver knows — in either spelling. */
function isPaletteValue(value: string): boolean {
  const head = value.split('.')[0] ?? '';
  const group = PALETTE_VALUE_ALIASES[head] ?? head;
  return PALETTE_ROLES.includes(group) || PALETTE_SURFACES.includes(group);
}

/** Tailwind-compatible spacing scale keys. Numeric strings (with optional `.5`) resolve as
 *  `var(--sds-spacing-N)`; also accepts the `px` keyword. Bare scale keys (e.g. `"6"`, `"1.5"`)
 *  let consumers write `<Div gap="6">` and get Tailwind's `gap-6` (`1.5rem`). */
const SPACING_KEY_RE = /^([0-9]+(?:\.5)?|px)$/;

function shouldResolveAsToken(prop: keyof CSSProperties, value: string): boolean {
  if (value.startsWith('var(') || value.startsWith('#') || value.startsWith('rgb')) return false;
  const ns = TOKEN_NAMESPACES[prop];
  if (!ns) {
    // Even when not mapped, don't treat physical-unit values as tokens — they pass through.
    return false;
  }
  if (ns === 'spacing') {
    // Spacing properties: only resolve bare scale keys like "6" / "1.5" / "px". CSS-unit values
    // (`"24px"`, `"1rem"`, `"100%"`) and CSS keywords (`"auto"`) pass through untouched.
    return SPACING_KEY_RE.test(value);
  }
  // Physical-unit values are not tokens for non-spacing namespaces either.
  if (/^-?[0-9.]+(px|rem|em|%|vh|vw|fr)?$/.test(value)) return false;
  if (ns === 'palette') return isPaletteValue(value);
  return true;
}

/**
 * Resolve an `sx` object into a plain `CSSProperties` object suitable for the `style` prop.
 * Recognized aliases are expanded; recognized token strings are turned into `var(--sds-…)`.
 * Unknown keys are passed through unchanged so consumers can use custom CSS-variable names.
 */
export function sxToStyle(sx?: Sx): CSSProperties {
  if (!sx) return {};
  const out: Record<string, string | number> = {};

  for (const [rawKey, rawValue] of Object.entries(sx)) {
    if (rawValue === undefined) continue;
    const cssKey = (ALIASES[rawKey] ?? rawKey) as keyof CSSProperties;

    let value: string | number = rawValue as string | number;
    if (typeof value === 'string' && shouldResolveAsToken(cssKey, value)) {
      const ns = TOKEN_NAMESPACES[cssKey];
      // Palette values go through normalisation first, so the short spellings the DS teaches
      // elsewhere (`fg.muted`, `primary`) resolve to a variable that is actually emitted.
      const path = ns === 'palette' ? normalizePaletteValue(value) : value;
      value = token(ns ? `${ns}.${path}` : path);
    }

    (out as Record<string, unknown>)[cssKey as string] = value;
  }

  return out as CSSProperties;
}

export type { Sx };