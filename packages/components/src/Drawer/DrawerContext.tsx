'use client';

import { createContext, useContext } from 'react';

import type { DrawerContextValue } from './Drawer.types';

/**
 * Single context shared across every Drawer subpart. Same shape as Modal's context — Drawer
 * differs only in layout (`side` vs `placement`); state ownership is identical.
 */
export const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawerContext(componentName: string): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside a <Drawer> ancestor.`,
    );
  }
  return ctx;
}
