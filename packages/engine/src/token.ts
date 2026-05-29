/** Namespace for all DS-generated CSS variables. Keep in sync with `@apx-ui/theme`. */
export const TOKEN_PREFIX = '--sds';

/**
 * Convert a dotted token path into a CSS variable reference.
 *
 * @example
 *   token('palette.primary.main') // -> 'var(--sds-palette-primary-main)'
 *   token('radius.md')            // -> 'var(--sds-radius-md)'
 */
export function token(path: string, fallback?: string): string {
  const name = `${TOKEN_PREFIX}-${path.replace(/\./g, '-')}`;
  return fallback === undefined ? `var(${name})` : `var(${name}, ${fallback})`;
}

/** Build a CSS variable name from a token path (without the `var()` wrapper). */
export function tokenName(path: string): string {
  return `${TOKEN_PREFIX}-${path.replace(/\./g, '-')}`;
}

/**
 * Identity helper that preserves the literal types of a token map. Useful for declaring sets of
 * token paths in a way that TypeScript can autocomplete.
 *
 * @example
 *   const t = tokens({ primaryBg: 'palette.primary.main' });
 *   t.primaryBg // 'palette.primary.main' (literal)
 */
export function tokens<const T extends Record<string, string>>(map: T): T {
  return map;
}
