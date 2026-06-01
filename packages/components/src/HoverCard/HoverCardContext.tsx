'use client';

import { createContext, useContext } from 'react';

import type { HoverCardContextValue } from './HoverCard.types';

/**
 * Single-context compound — same shape as Popover. Subparts (`Trigger`, `Content`, `Arrow`) all
 * read from one root state. The throwing helper catches the most common authoring bug —
 * `<HoverCard.Trigger>` outside a `<HoverCard>` ancestor.
 */
export const HoverCardContext = createContext<HoverCardContextValue | null>(null);

export function useHoverCardContext(componentName: string): HoverCardContextValue {
  const ctx = useContext(HoverCardContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside a <HoverCard> ancestor.`,
    );
  }
  return ctx;
}