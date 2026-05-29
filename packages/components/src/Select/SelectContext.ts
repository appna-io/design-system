'use client';

import { createContext, useContext } from 'react';

import type { SelectContextValue } from './Select.types';

/**
 * Single context for the Select compound (compare with Menu's three). Select is simpler:
 *
 *  - No submenu nesting → no `SelectSubContext`.
 *  - Single value at root (not group-scoped) → no `SelectRadioGroupContext`.
 *
 * Hence one context to rule them all — Trigger / Content / Item / Group / Label / Separator all
 * read from it.
 */
export const SelectContext = createContext<SelectContextValue | null>(null);

export function useSelectContext(componentName: string): SelectContextValue {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside a <Select> ancestor.`,
    );
  }
  return ctx;
}
