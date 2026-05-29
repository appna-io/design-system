/**
 * Pure: same shape as `resolveIconSize` for the color axis. DS palette tokens resolve to a
 * recipe class; arbitrary CSS color strings (`'#ff0000'`, `'rgb(255 0 0)'`, `'var(--my-c)'`)
 * apply via inline `style.color`.
 *
 * Detection heuristic: a string that isn't in the known token set is treated as an arbitrary
 * CSS color. We don't try to validate it — the browser will silently ignore invalid values,
 * which is the same behavior as setting any other CSS property.
 */
export type IconColorToken =
  | 'current'
  | 'inherit'
  | 'default'
  | 'muted'
  | 'subtle'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type IconColor = IconColorToken | (string & {});

const TOKEN_SET = new Set<IconColorToken>([
  'current',
  'inherit',
  'default',
  'muted',
  'subtle',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
]);

export function isIconColorToken(value: IconColor): value is IconColorToken {
  return typeof value === 'string' && TOKEN_SET.has(value as IconColorToken);
}

export interface ResolvedIconColor {
  /** Inline `style.color` override — `null` when the recipe variant class handles it. */
  style: { color: string } | null;
  /** Token name when the color resolves to a recipe variant; `undefined` otherwise. */
  token: IconColorToken | undefined;
}

export function resolveIconColor(color: IconColor | undefined): ResolvedIconColor {
  if (color === undefined) {
    return { style: null, token: 'current' };
  }
  if (isIconColorToken(color)) {
    return { style: null, token: color };
  }
  return { style: { color }, token: undefined };
}
