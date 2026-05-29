'use client';

import { createContext, useContext } from 'react';

import type { CardContextValue } from './Card.types';

/**
 * Bridges the **root → subpart** size + orientation flow. `<Card>` provides; `<Card.Header>`,
 * `<Card.Body>`, `<Card.Footer>`, `<Card.Media>` read. Bypasses prop-drilling without forcing
 * consumers to declare a wrapper context themselves.
 *
 * The default value (`size: 'md'`, `orientation: 'vertical'`) lets a subpart render *outside* a
 * `<Card>` parent without crashing — useful for SSR snapshotting and for documentation pages that
 * showcase a single subpart in isolation.
 */
export const CardContext = createContext<CardContextValue>({
  size: 'md',
  orientation: 'vertical',
});

/** Read the active Card defaults. Stable shape across all five subparts. */
export function useCardContext(): CardContextValue {
  return useContext(CardContext);
}
