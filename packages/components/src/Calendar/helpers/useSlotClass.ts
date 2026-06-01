'use client';

import type { VariantConfig, VariantFn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

/**
 * Thin slot wrapper around `useThemedClasses` — same pattern Scheduler uses. Returns just
 * the `className` string for a single Calendar slot. Keeps theme-override semantics intact
 * (everything flows through `useThemedClasses`) without bloating every call site.
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
    componentName: 'Calendar',
  }).className;
}