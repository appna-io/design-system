'use client';

import { createContext, useContext } from 'react';

import type { TabsContextValue } from './Tabs.types';

/**
 * The single context that wires `<Tabs.List>`, `<Tabs.Trigger>`, and `<Tabs.Panel>` to the
 * `<Tabs>` root. Throws a descriptive error when a subpart is rendered outside the root —
 * this is the most common authoring mistake (e.g. forgetting the wrapper or breaking the
 * subtree across portals).
 */
export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext(componentName: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside a <Tabs> ancestor.`,
    );
  }
  return ctx;
}