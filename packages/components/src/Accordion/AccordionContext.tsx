'use client';

import { createContext, useContext } from 'react';

import type { AccordionItemContextValue, AccordionRootContextValue } from './Accordion.types';

/**
 * Two paired contexts:
 *
 *  - `AccordionRootContext` is provided once by `<Accordion>` and carries everything every
 *    descendant subpart needs: the variant axes, the controlled-or-uncontrolled value+setter,
 *    the keyboard registration helpers, and the shared `baseId` used to pair each trigger to
 *    its content via `aria-controls` / `aria-labelledby`.
 *
 *  - `AccordionItemContext` is provided by every `<Accordion.Item>` and carries the per-item
 *    state — value, open/closed, disabled, and the trigger/content ids. `<Accordion.Trigger>`
 *    and `<Accordion.Content>` consume it.
 *
 * Both contexts throw a descriptive error if a subpart renders outside its required ancestor,
 * which catches the most common authoring mistake (using `<Accordion.Trigger>` without an
 * enclosing `<Accordion.Item>`).
 */
export const AccordionRootContext = createContext<AccordionRootContextValue | null>(null);

export function useAccordionRootContext(componentName: string): AccordionRootContextValue {
  const ctx = useContext(AccordionRootContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside an <Accordion> ancestor.`,
    );
  }
  return ctx;
}

export const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export function useAccordionItemContext(componentName: string): AccordionItemContextValue {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside an <Accordion.Item> ancestor.`,
    );
  }
  return ctx;
}