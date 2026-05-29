'use client';

import type { ThemeOverride } from '../mergeTheme';
import { useTheme } from './useTheme';

export interface UseThemeOverridesReturn {
  /** The current runtime overrides layered on top of `baseTheme + variant`. */
  overrides: ThemeOverride;
  /** Replace the entire override object. */
  setOverrides: (overrides: ThemeOverride) => void;
  /** Deep-merge a partial patch onto the current overrides. */
  patchOverrides: (patch: ThemeOverride) => void;
  /** Clear all overrides — DS returns to base + variant defaults. */
  resetOverrides: () => void;
  /** `true` when at least one override is currently applied. */
  hasOverrides: boolean;
}

/**
 * Access and mutate the runtime override layer. The Theme Studio uses this to drive live
 * editing; consumers can also use it from their own UIs (e.g. a "brand picker" in app
 * settings).
 *
 * @example
 *   const { patchOverrides, resetOverrides } = useThemeOverrides();
 *   patchOverrides({ palette: { light: { primary: { main: '#ff5722' } } } });
 *   // ...later
 *   resetOverrides();
 */
export function useThemeOverrides(): UseThemeOverridesReturn {
  const { overrides, setOverrides, patchOverrides, resetOverrides } = useTheme();
  return {
    overrides,
    setOverrides,
    patchOverrides,
    resetOverrides,
    hasOverrides: Object.keys(overrides).length > 0,
  };
}
