'use client';

import { createContext, useContext } from 'react';

import type { ToggleGroupContextValue } from './Toggle.types';

/**
 * `<ToggleGroup>` provides; `<ToggleGroup.Item>` consumes. Throws a descriptive error if an
 * Item renders outside a Group (the most common authoring mistake — `<ToggleGroup.Item>` used
 * standalone where `<Toggle>` was intended).
 */
export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export function useToggleGroupContext(componentName: string): ToggleGroupContextValue {
  const ctx = useContext(ToggleGroupContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside a <ToggleGroup> ancestor. ` +
        `For a standalone button, use <Toggle> instead.`,
    );
  }
  return ctx;
}