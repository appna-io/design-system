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

const PALETTE_PREFIXES = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

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
  if (ns === 'palette') {
    return (
      PALETTE_PREFIXES.includes(value.split('.')[0] ?? '') ||
      value.startsWith('border.') ||
      value.startsWith('background.') ||
      value.startsWith('foreground.')
    );
  }
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
      value = token(ns ? `${ns}.${value}` : value);
    }

    (out as Record<string, unknown>)[cssKey as string] = value;
  }

  return out as CSSProperties;
}

export type { Sx };