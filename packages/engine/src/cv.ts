import { cn } from './cn';
import { breakpointPrefix, prefixClasses, resolveResponsive } from './responsive';
import { isResponsiveObject } from './types/responsive';
import type { VariantConfig, VariantFn, VariantProps } from './types/variant';

const META_KEYS = new Set(['class', 'className']);

/**
 * Normalize a variant value (string | boolean | number) to the string key used in the variants map.
 */
function valueKey(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return null;
}

/**
 * Resolve a single variant axis to its class string, honoring responsive values. Returns the
 * concatenated class string (already breakpoint-prefixed where appropriate).
 */
function resolveAxis(values: Record<string, string>, raw: unknown): string {
  if (raw === undefined || raw === null) return '';

  if (isResponsiveObject(raw)) {
    const out: string[] = [];
    for (const [bp, v] of resolveResponsive(raw)) {
      const key = valueKey(v);
      if (!key) continue;
      const cls = values[key];
      if (!cls) continue;
      out.push(prefixClasses(cls, breakpointPrefix(bp)));
    }
    return out.join(' ');
  }

  const key = valueKey(raw);
  if (!key) return '';
  return values[key] ?? '';
}

/**
 * Determine the *effective* value of a variant for compound-variant matching. Compound matching
 * looks at the value at the `base` breakpoint (or the plain value) plus the explicit default.
 * Responsive variations don't trigger compound variants — those are kept simple by design.
 */
function effectiveValue(raw: unknown, fallback: unknown): unknown {
  if (raw === undefined) return fallback;
  if (isResponsiveObject(raw)) {
    const base = (raw as Record<string, unknown>).base;
    return base ?? fallback;
  }
  return raw;
}

/**
 * Class Variants — the engine's variant-resolution function. Returns a callable that turns a set
 * of variant props (plus `className`/`class`) into a single class string.
 *
 * Features:
 *  - `base` classes always applied
 *  - per-axis variants with string OR boolean keys
 *  - responsive prop values (`{ base, sm, md, lg, xl, 2xl }`)
 *  - compound variants (match-all set of conditions → extra classes)
 *  - `defaultVariants` applied when a prop is omitted (and used for compound matching)
 *  - `className`/`class` from props are last-wins via `cn` (tailwind-merge)
 */
export function cv<const C extends VariantConfig>(config: C): VariantFn<C> {
  const { base, variants, compoundVariants, defaultVariants } = config;

  return ((props?: VariantProps<C>): string => {
    const parts: string[] = [];
    if (base) parts.push(base);

    const safeProps = (props ?? {}) as Record<string, unknown>;

    // Per-axis variants.
    if (variants) {
      for (const axis of Object.keys(variants)) {
        const axisValues = variants[axis] as Record<string, string>;
        const raw = safeProps[axis] !== undefined ? safeProps[axis] : defaultVariants?.[axis];
        const resolved = resolveAxis(axisValues, raw);
        if (resolved) parts.push(resolved);
      }
    }

    // Compound variants.
    if (compoundVariants?.length) {
      for (const compound of compoundVariants) {
        const { class: compoundClass, className: compoundClassName, ...conditions } = compound;
        const allMatch = Object.entries(conditions).every(([axis, expected]) => {
          const actual = effectiveValue(safeProps[axis], defaultVariants?.[axis]);
          if (Array.isArray(expected)) {
            return (expected as unknown[]).includes(actual);
          }
          return actual === expected;
        });
        if (allMatch) {
          const extra = compoundClass ?? compoundClassName;
          if (extra) parts.push(extra);
        }
      }
    }

    // User-supplied className/class wins via tailwind-merge.
    const userClass = (safeProps.className ?? safeProps.class) as string | undefined;
    if (userClass) parts.push(userClass);

    return cn(...parts);
  }) as VariantFn<C>;
}

export type { VariantFn, VariantProps, VariantConfig };
export { META_KEYS as VARIANT_META_KEYS };