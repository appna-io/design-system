'use client';

import { createContext, useContext } from 'react';

import type { FormApi } from './Form.types';

/**
 * Context that `<Form>` publishes for `<FormField>`, nested submit-buttons, and any consumer
 * `useFormContext()` call. `null` default means "no `<Form>` ancestor" — `useFormContext()`
 * returns `null` in that case rather than throwing, so components like `<FormField>` can fail
 * gracefully (or warn) when used outside a Form.
 */
export const FormContext = createContext<FormApi<Record<string, unknown>> | null>(null);
FormContext.displayName = 'FormContext';

/**
 * Hook overload — call with no generic for ambient `Record<string, unknown>` form values, or
 * pass a concrete `Values` type to narrow:
 *
 *   const form = useFormContext<{ email: string; password: string }>();
 *
 * Returns `null` if no `<Form>` ancestor is present.
 */
export function useFormContext<Values extends Record<string, unknown> = Record<string, unknown>>(): FormApi<Values> | null {
  return useContext(FormContext) as FormApi<Values> | null;
}
