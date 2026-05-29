'use client';

import { createContext, useContext } from 'react';

import type { StepperContextValue } from './Stepper.types';

/**
 * Context that flows resolved variant / orientation / size / clickability info from
 * `<Stepper>` to `<Stepper.Step>` subparts.
 *
 * Throws when subparts render outside the root — the most common authoring mistake is using
 * `<Stepper.Step>` without a wrapping `<Stepper>`.
 */
export const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepperContext(componentName: string): StepperContextValue {
  const ctx = useContext(StepperContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside a <Stepper> ancestor.`,
    );
  }
  return ctx;
}
