/**
 * Pure: turn a `size` prop into the inline style overrides that should be applied (numeric /
 * string CSS-length values) OR `null` when the recipe variant class handles it (token values).
 *
 * The split exists because Tailwind / `cv` recipes are literal-class matchers — they only know
 * `'xs' | 'sm' | 'md' | 'lg' | 'xl'`. Numeric (`size={20}`) and arbitrary CSS lengths
 * (`size="1.5rem"`) bypass the class system entirely and apply via inline style.
 *
 * Returning `null` for tokens (instead of `{}`) lets the caller skip the spread entirely so
 * the rendered DOM doesn't carry a `style=""` attribute when no inline overrides are needed.
 */
export type IconSizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconSize = IconSizeToken | number | (string & {});

const TOKEN_SET = new Set<IconSizeToken>(['xs', 'sm', 'md', 'lg', 'xl']);

export function isIconSizeToken(value: IconSize): value is IconSizeToken {
  return typeof value === 'string' && TOKEN_SET.has(value as IconSizeToken);
}

export interface ResolvedIconSize {
  /** Inline style overrides — `null` when no override is needed (token path). */
  style: { width: string | number; height: string | number; fontSize: string | number } | null;
  /** Token name when the size resolves to a recipe variant; `undefined` otherwise. */
  token: IconSizeToken | undefined;
}

export function resolveIconSize(size: IconSize | undefined): ResolvedIconSize {
  if (size === undefined) {
    return { style: null, token: 'md' };
  }
  if (isIconSizeToken(size)) {
    return { style: null, token: size };
  }
  // Numeric → px; string → pass through (consumer is responsible for the unit).
  const value: string | number = typeof size === 'number' ? `${size}px` : size;
  return {
    style: { width: value, height: value, fontSize: value },
    token: undefined,
  };
}
