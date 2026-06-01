'use client';

import { useTheme } from './useTheme';
import type { ModeSetting, ResolvedMode } from '../context';

export interface UseModeReturn {
  /** What the user picked (`'light'`/`'dark'`/`'system'`). */
  mode: ModeSetting;
  /** What it currently resolves to (`'light'` or `'dark'`). */
  resolvedMode: ResolvedMode;
  /** Switch and persist. */
  setMode: (mode: ModeSetting) => void;
  /** Convenience toggler that flips between light and dark (system → opposite of current). */
  toggleMode: () => void;
}

export function useMode(): UseModeReturn {
  const { mode, resolvedMode, setMode } = useTheme();
  return {
    mode,
    resolvedMode,
    setMode,
    toggleMode: () => setMode(resolvedMode === 'dark' ? 'light' : 'dark'),
  };
}