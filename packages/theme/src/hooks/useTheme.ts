'use client';

import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from '../context';

/**
 * Access the full theme context. Throws a helpful error when called outside a `<ThemeProvider>`,
 * because every DS component relies on it.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error(
      '[apx-ds] useTheme() called outside of <ThemeProvider>. Wrap your app with <ThemeProvider> from apx-ds.',
    );
  }
  return ctx;
}
