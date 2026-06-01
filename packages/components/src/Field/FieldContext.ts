'use client';

import { createContext, useContext } from 'react';

import type { FieldContextValue } from './Field.types';

/**
 * Context that `<Field>` publishes for its 5 subparts *and* for every form control that consumes
 * the shared `useFormFieldA11y` hook. `null` is the deliberate default — form controls treat the
 * absence of FieldContext as "standalone, use my own props" so wrapping in `<Field>` is fully
 * opt-in and never changes standalone behavior.
 */
export const FieldContext = createContext<FieldContextValue | null>(null);
FieldContext.displayName = 'FieldContext';

/**
 * Returns the current `FieldContext`, or `null` when the consumer is not wrapped in `<Field>`.
 * Form controls call this from `useFormFieldA11y` to detect whether to defer their a11y wiring
 * to Field; Field subparts call this to read the resolved ids / state / size.
 */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}