import {
  breakpointPrefix,
  isResponsiveObject,
  prefixClasses,
  resolveResponsive,
  type ResponsiveValue,
} from '@apx-ui/engine';

import { GAP_CLASSES } from './Stack.recipe';
import type { StackGap } from './Stack.types';

/**
 * `cv` only resolves one value per axis, but `gap` is *three* axes: `gap` (both), `gap-x` only,
 * and `gap-y` only. When `rowGap` or `columnGap` is set we need to emit the split forms instead
 * of the unified `gap-*`. This helper does the resolution by hand using the engine's responsive
 * primitives so the result is breakpoint-prefixed identically to the rest of the recipe.
 *
 * Behavior:
 *  - `gap` alone           → emits `gap-*`
 *  - `gap` + `rowGap`      → emits `gap-x-*` (from gap) + `gap-y-*` (from rowGap)
 *  - `gap` + `columnGap`   → emits `gap-y-*` (from gap) + `gap-x-*` (from columnGap)
 *  - `rowGap` + `columnGap` (no `gap`) → emits both split forms; no combined `gap-*`.
 *
 * Every emitted token is a literal Tailwind utility present in `GAP_CLASSES`, so the JIT scanner
 * discovers all 39 (gap / gap-x / gap-y × 13 scale entries) at build time.
 */
export function gapClasses(
  gap: ResponsiveValue<StackGap> | undefined,
  rowGap: ResponsiveValue<StackGap> | undefined,
  columnGap: ResponsiveValue<StackGap> | undefined,
): string {
  const out: string[] = [];

  // When an override is present, the unified `gap-*` would set BOTH axes — which would defeat the
  // override. Split it into the *opposite* axis-only form so the override controls the other one.
  const hasRowOverride = isDefined(rowGap);
  const hasColOverride = isDefined(columnGap);

  if (isDefined(gap)) {
    if (hasRowOverride && hasColOverride) {
      // The unified `gap` is fully overridden; skip the combined form entirely so we don't emit
      // dead classes (tailwind-merge would resolve it, but emitting cleaner output is cheaper).
    } else if (hasRowOverride) {
      out.push(resolveGapAxis('gap-x', gap));
    } else if (hasColOverride) {
      out.push(resolveGapAxis('gap-y', gap));
    } else {
      out.push(resolveGapAxis('gap', gap));
    }
  }

  if (hasRowOverride) out.push(resolveGapAxis('gap-y', rowGap));
  if (hasColOverride) out.push(resolveGapAxis('gap-x', columnGap));

  return out.filter(Boolean).join(' ');
}

function isDefined<T>(value: ResponsiveValue<T> | undefined): value is ResponsiveValue<T> {
  return value !== undefined;
}

/**
 * Resolve a single gap axis (`gap` / `gap-x` / `gap-y`) into its responsive class string. Mirrors
 * the engine's per-axis `resolveAxis` logic but reads from the literal `GAP_CLASSES` table.
 */
function resolveGapAxis(
  axis: 'gap' | 'gap-x' | 'gap-y',
  raw: ResponsiveValue<StackGap>,
): string {
  const table = GAP_CLASSES[axis] as Record<string, string>;

  if (isResponsiveObject(raw)) {
    const parts: string[] = [];
    for (const [bp, value] of resolveResponsive(raw)) {
      const key = scaleKey(value);
      const cls = table[key];
      if (!cls) continue;
      parts.push(prefixClasses(cls, breakpointPrefix(bp)));
    }
    return parts.join(' ');
  }

  const key = scaleKey(raw);
  return table[key] ?? '';
}

/**
 * Spacing-scale tokens come in as `'px'`, `0`, `0.5`, `1`, …, `12`. Tailwind's `gap-0.5` lives
 * in its table under the literal key `'0.5'`, so we coerce numeric tokens to their string form.
 * Unsupported values fall through to the empty string (no class emitted).
 */
function scaleKey(value: unknown): string {
  if (value === 'px' || typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}