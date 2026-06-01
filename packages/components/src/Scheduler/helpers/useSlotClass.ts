'use client';

import type { VariantConfig, VariantFn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

/**
 * Thin slot-wrapper around `useThemedClasses` that returns just the `className` string for
 * a single Scheduler slot.
 *
 * Why this exists: every Scheduler recipe call uses the same `componentName: 'Scheduler'`
 * plus a per-slot key — the full options-object form is too verbose for the ~25 recipes
 * the views compose. Wrapping it once here keeps the call sites readable AND keeps the
 * canonical theme-resolution path through `useThemedClasses` so theme overrides land at
 * exactly one extension point.
 *
 * Inline `style` is **not** returned — for the few slots that need theme-driven inline
 * style (none today), the view calls `useThemedClasses` directly. Keeping the common API
 * at "return a string" avoids the destructuring noise in every JSX expression.
 */
export function useSlotClass<P extends Record<string, unknown>>(
  slot: string,
  recipe: VariantFn<VariantConfig>,
  props: P,
): string {
  return useThemedClasses({
    recipe,
    props: props as P & { className?: string | undefined },
    slot,
    componentName: 'Scheduler',
  }).className;
}