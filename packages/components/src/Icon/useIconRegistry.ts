'use client';

import { useContext } from 'react';

import { IconRegistryContext } from './IconRegistry.context';
import type { IconComponent } from './IconRegistry';

/**
 * Public hook that exposes the active icon registry. Three methods cover the common cases:
 *
 *  - `resolve(name)` — returns the component or `undefined`. Use for graceful-degradation paths.
 *  - `has(name)` — boolean check without a component reference.
 *  - `resolveOrThrow(name)` — throws when the name is missing. Use in development assertions
 *    where a missing icon is a bug, not a graceful condition.
 *
 * The hook subscribes via React context, so any `<IconProvider>` change triggers a re-render
 * on consumers naturally — no manual store subscription required.
 */
export interface UseIconRegistryReturn {
  resolve: (name: string) => IconComponent | undefined;
  resolveOrThrow: (name: string) => IconComponent;
  has: (name: string) => boolean;
  keys: () => string[];
}

export function useIconRegistry(): UseIconRegistryReturn {
  const { registry } = useContext(IconRegistryContext);
  return {
    resolve: (name) => registry.resolve(name),
    has: (name) => registry.has(name),
    keys: () => registry.keys(),
    resolveOrThrow: (name) => {
      const c = registry.resolve(name);
      if (!c) {
        throw new Error(
          `[apx-ds] useIconRegistry.resolveOrThrow: no icon registered for "${name}". ` +
            `Register it via createIconRegistry({ "${name}": YourIcon }) and pass to <IconProvider value=…>.`,
        );
      }
      return c;
    },
  };
}