/**
 * Tiny token resolver for `<Typography />`'s five type-specific shorthand props (`fontSize`,
 * `fontWeight`, `lineHeight`, `letterSpacing`, `fontFamily`).
 *
 * The DS theme system already emits CSS variables under `--sds-font-size-*`,
 * `--sds-font-weight-*`, `--sds-line-height-*`, `--sds-letter-spacing-*`, `--sds-font-sans`,
 * and `--sds-font-mono` (see [packages/theme/src/themeToCssVars.ts](../../../theme/src/themeToCssVars.ts)).
 * This module turns a friendly token name (e.g. `"lg"`, `"semibold"`, `"tight"`, `"sans"`)
 * into the matching `var(...)` reference. Raw values (numbers, hex/px strings, `inherit`,
 * `unset`, …) bypass the table and pass through untouched so consumers retain a full CSS escape
 * hatch per-prop.
 *
 * Scope is intentionally local to Typography for v1. If a second consumer needs the same
 * resolution we can promote into the engine's `sxToStyle` global resolver — the public surface
 * stays the same.
 */

/** Recognized token keys per typography prop. Boolean values keep the map cheap (Set replacement). */
export const TYPOGRAPHY_TOKEN_TABLES = {
  fontSize: {
    xs: true,
    sm: true,
    base: true,
    lg: true,
    xl: true,
    '2xl': true,
    '3xl': true,
    '4xl': true,
    '5xl': true,
  },
  fontWeight: {
    normal: true,
    medium: true,
    semibold: true,
    bold: true,
  },
  lineHeight: {
    none: true,
    tight: true,
    snug: true,
    normal: true,
    relaxed: true,
  },
  letterSpacing: {
    tight: true,
    normal: true,
    wide: true,
    wider: true,
  },
} as const satisfies Record<string, Record<string, true>>;

/** CSS var prefix per prop. `--sds-font-size-lg` → emitted via `${VAR_PREFIX[prop]}-${value}`. */
export const TYPOGRAPHY_VAR_PREFIX = {
  fontSize: '--sds-font-size',
  fontWeight: '--sds-font-weight',
  lineHeight: '--sds-line-height',
  letterSpacing: '--sds-letter-spacing',
} as const;

/**
 * `fontFamily` is the odd one out — token names are short (`sans` / `mono`) and resolve to
 * `--sds-font-sans` / `--sds-font-mono` (the existing flatten layout in `themeToCssVars`).
 */
export const FONT_FAMILY_VARS = {
  sans: '--sds-font-sans',
  mono: '--sds-font-mono',
} as const;

export type TypographyTokenProp = keyof typeof TYPOGRAPHY_VAR_PREFIX | 'fontFamily';

/**
 * Resolve a single typography-prop value into either a `var(...)` reference or the raw value.
 *
 * - `undefined` / `null` → `undefined` (signals "not set" so the caller can omit the key).
 * - Number values pass through (e.g. `fontSize={14}`, `fontWeight={500}`, `lineHeight={1.4}`).
 * - String values that match the prop's token table become `var(--sds-...)`.
 * - Any other string passes through unchanged (raw CSS escape hatch: `"14px"`, `"inherit"`,
 *   `"1.5em"`, `"'Helvetica Neue', sans-serif"`).
 */
export function resolveTypographyToken(
  prop: TypographyTokenProp,
  value: string | number | null | undefined,
): string | number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number') return value;

  if (prop === 'fontFamily') {
    const varName = (FONT_FAMILY_VARS as Record<string, string>)[value];
    return varName ? `var(${varName})` : value;
  }

  const table = (TYPOGRAPHY_TOKEN_TABLES as Record<string, Record<string, true>>)[prop];
  const prefix = (TYPOGRAPHY_VAR_PREFIX as Record<string, string>)[prop];
  if (table && prefix && table[value]) {
    return `var(${prefix}-${value})`;
  }
  return value;
}