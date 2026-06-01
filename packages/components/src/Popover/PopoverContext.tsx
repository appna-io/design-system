'use client';

import { createContext, useContext } from 'react';

import type { PopoverContextValue } from './Popover.types';

/**
 * Single-context compound — Popover's subparts (`Trigger`, `Content`, `Arrow`, `Close`) all read
 * the same root state. We don't split this into root/item like Accordion because there's only
 * one trigger and one content per Popover instance (no per-item nesting like AccordionItem).
 *
 * The throwing helper `usePopoverContext(name)` catches the most common authoring bug — using
 * `<Popover.Trigger>` outside a `<Popover>` ancestor.
 */
export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(componentName: string): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside a <Popover> ancestor.`,
    );
  }
  return ctx;
}