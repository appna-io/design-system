/**
 * Supported breakpoint keys. The `base` key represents the unconditional value (no media query).
 * The other keys map to ascending media queries that the renderer/theme system defines elsewhere.
 */
export type BreakpointKey = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * A value that may be expressed either as a single primitive (applied at all breakpoints) or as a
 * record keyed by `BreakpointKey` for fine-grained responsive control.
 */
export type ResponsiveValue<T> = T | Partial<Record<BreakpointKey, T>>;

export const RESPONSIVE_BREAKPOINTS: readonly BreakpointKey[] = [
  'base',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
] as const;

export function isResponsiveObject<T>(
  value: ResponsiveValue<T>,
): value is Partial<Record<BreakpointKey, T>> {
  if (value === null || typeof value !== 'object') return false;
  const keys = Object.keys(value);
  if (keys.length === 0) return false;
  return keys.every((k) => (RESPONSIVE_BREAKPOINTS as readonly string[]).includes(k));
}