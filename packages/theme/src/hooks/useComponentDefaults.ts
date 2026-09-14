'use client';

import { useMemo } from 'react';

import { useTheme } from './useTheme';

/**
 * Layer `theme.components.<Name>.defaultProps` underneath a component's own props.
 *
 * ## Why this exists
 *
 * `useThemedClasses` already does this — for components built on a recipe. A **composed**
 * component (one that renders other DS components rather than emitting a class string) has no
 * recipe, so it never consulted the theme at all, and the only way to change its treatment was
 * per call site.
 *
 * That is not a cosmetic gap. `SectionHeading` was hardcoded to `bold` headings, `foreground.muted`
 * body copy and an uncapped title. Six of eight templates wanted something slightly different —
 * a lighter display weight, a narrower measure, a quieter body — so six of eight kept their own
 * hand-written copy and the shared component was used by one. The abstraction was right; it just
 * had no way to be told what a *template* looks like, only what a *heading* looks like.
 *
 * A template sets the treatment once, in its theme, and every section gets it:
 *
 * ```ts
 * components: { SectionHeading: { defaultProps: { titleWeight: 'medium', bodyTone: 'subtle' } } }
 * ```
 *
 * Consumer props still win, so a single section can still break the pattern deliberately.
 */
export function useComponentDefaults<P extends object>(componentName: string, props: P): P {
  const { theme } = useTheme();

  return useMemo(() => {
    const defaults = theme.components?.[componentName]?.defaultProps;
    if (!defaults) return props;

    // Only fill props the caller left undefined — an explicit value at the call site is a
    // deliberate exception to the template's pattern and has to outrank it.
    const merged = { ...defaults } as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined) merged[key] = value;
    }
    return merged as P;
  }, [theme, componentName, props]);
}
