'use client';

import { createContext, useContext } from 'react';

import type { EmptyStateContextValue } from './EmptyState.types';

/**
 * Bridges the **root → subpart** density / variant / alignment flow. `<EmptyState>` provides;
 * `<EmptyState.Icon>`, `.Illustration`, `.Title`, `.Description`, `.Actions` read. Avoids
 * prop-drilling without forcing consumers to declare a wrapper context themselves.
 *
 * Default value (`size: 'md'`, `variant: 'default'`, `align: 'center'`) lets a subpart render
 * outside an `<EmptyState>` parent without crashing — useful for documentation pages that
 * showcase a single subpart in isolation, and for the renderer's per-subpart `<PropsTable />`.
 */
export const EmptyStateContext = createContext<EmptyStateContextValue>({
  size: 'md',
  variant: 'default',
  align: 'center',
});

/** Read the active EmptyState defaults. Stable shape across all five subparts. */
export function useEmptyStateContext(): EmptyStateContextValue {
  return useContext(EmptyStateContext);
}
