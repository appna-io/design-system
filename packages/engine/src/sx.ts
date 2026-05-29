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

function shouldResolveAsToken(prop: keyof CSSProperties, value: string): boolean {
  // Don't double-wrap already-resolved CSS variable references.
  if (value.startsWith('var(') || value.startsWith('#') || value.startsWith('rgb')) return false;
  // Don't treat physical-unit values as tokens.
  if (/^-?[0-9.]+(px|rem|em|%|vh|vw|fr)?$/.test(value)) return false;
  const ns = TOKEN_NAMESPACES[prop];
  if (!ns) return false;
  if (ns === 'palette') {
    // Only treat strings that look like a palette role path (e.g. 'primary.main', 'border.default').
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
