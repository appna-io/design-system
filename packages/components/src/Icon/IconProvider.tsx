'use client';

import { useMemo, type ReactElement } from 'react';

import { IconRegistryContext, type IconRegistryContextValue } from './IconRegistry.context';
import type { IconProviderProps } from './Icon.types';

/**
 * `<IconProvider>` — wires an `IconRegistry` (from `createIconRegistry`) into the React tree
 * so every `<Icon name="…" />` below can resolve names without per-instance imports. Optional
 * provider-level defaults (`defaultSize` / `defaultColor` / `defaultVariant`) cascade into
 * children; an Icon's own props always override the provider defaults.
 *
 * Nesting providers is supported and behaves as "innermost wins" for both the registry and
 * the defaults. Useful for theme-aware sections (e.g. a marketing CTA that wants a different
 * icon variant inside a generally-utility-styled app).
 */
export function IconProvider(props: IconProviderProps): ReactElement {
  const {
    value,
    defaultSize,
    defaultColor,
    defaultVariant,
    fallback,
    onMissing,
    children,
  } = props;

  // Memoize so the context-stability contract holds — every Icon under us only re-renders
  // when one of the provider knobs actually changes. The registry itself is expected to have
  // stable identity (consumers construct it at module scope or via `useMemo`).
  const ctxValue = useMemo<IconRegistryContextValue>(
    () => ({
      registry: value,
      defaultSize,
      defaultColor,
      defaultVariant,
      fallback: fallback ?? null,
      onMissing,
    }),
    [value, defaultSize, defaultColor, defaultVariant, fallback, onMissing],
  );

  return <IconRegistryContext.Provider value={ctxValue}>{children}</IconRegistryContext.Provider>;
}

IconProvider.displayName = 'IconProvider';
