import {
  RESPONSIVE_BREAKPOINTS,
  isResponsiveObject,
  type BreakpointKey,
  type ResponsiveValue,
} from './types/responsive';

/**
 * Apply a Tailwind responsive prefix (e.g. `md:`) to every class in a space-separated string.
 * Pre-prefixed classes (already containing a `:`) are left alone — pseudo selectors like
 * `hover:bg-red-500` already prefix correctly with `md:hover:bg-red-500`.
 */
export function prefixClasses(classes: string, prefix: string): string {
  if (!classes) return '';
  if (!prefix) return classes;
  return classes
    .split(/\s+/)
    .filter(Boolean)
    .map((cls) => {
      if (cls.startsWith('!')) return `!${prefix}${cls.slice(1)}`;
      return `${prefix}${cls}`;
    })
    .join(' ');
}

/**
 * Resolve a `ResponsiveValue<T>` into a flat array of `[breakpoint, value]` tuples in ascending
 * breakpoint order. Primitive (non-object) values map to a single `['base', value]` tuple.
 */
export function resolveResponsive<T>(value: ResponsiveValue<T>): Array<[BreakpointKey, T]> {
  if (!isResponsiveObject<T>(value)) {
    return [['base', value as T]];
  }
  const entries: Array<[BreakpointKey, T]> = [];
  for (const bp of RESPONSIVE_BREAKPOINTS) {
    if (bp in value) {
      const v = (value as Record<string, T>)[bp];
      if (v !== undefined) entries.push([bp, v]);
    }
  }
  return entries;
}

/** Tailwind class prefix for each breakpoint (the `base` key gets no prefix). */
export function breakpointPrefix(bp: BreakpointKey): string {
  return bp === 'base' ? '' : `${bp}:`;
}
