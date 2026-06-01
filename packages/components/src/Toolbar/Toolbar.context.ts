'use client';

import { createContext, useContext } from 'react';

import type { ToolbarContextValue } from './Toolbar.types';

/**
 * Context shared between the toolbar root and its subparts (`Toolbar.Group`,
 * `Toolbar.Separator`, `Toolbar.Spacer`). The roving tabindex registry and the overflow state
 * intentionally do **not** cross this boundary — they're driven by the root via DOM walks +
 * effects, not by per-subpart registration callbacks. This keeps the context small (two fields)
 * and the subparts maximally cheap to render.
 */
export const ToolbarContext = createContext<ToolbarContextValue | null>(null);

/**
 * Read the toolbar context with a friendly dev error when a subpart escapes the root. Throws
 * loudly in dev so misuse is caught at the example level, not in axe / consumer code paths.
 */
export function useToolbarContext(subpartName: string): ToolbarContextValue {
  const ctx = useContext(ToolbarContext);
  if (!ctx) {
    throw new Error(
      `[${subpartName}] must be rendered inside a <Toolbar> — the toolbar context is missing.`,
    );
  }
  return ctx;
}

/**
 * Read the toolbar context **optionally**. Used by `Toolbar.Spacer` (which is also exported as
 * a top-level alias) so a bare `<Toolbar.Spacer />` doesn't blow up outside a toolbar — it just
 * falls back to the toolbar-default behavior (greedy spacer on the inline axis).
 */
export function useOptionalToolbarContext(): ToolbarContextValue | null {
  return useContext(ToolbarContext);
}