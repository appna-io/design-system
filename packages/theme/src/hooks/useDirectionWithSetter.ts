'use client';

import type { Direction } from '@apx-ui/engine';
import { useTheme } from './useTheme';

export interface UseThemeDirectionReturn {
  dir: Direction;
  setDir: (dir: Direction) => void;
  /** Convenience toggler between `'ltr'` and `'rtl'`. */
  toggleDir: () => void;
}

/**
 * Theme-aware direction hook with a setter. For read-only access prefer `useDirection()` from
 * the engine — that works without a provider in the tree.
 */
export function useThemeDirection(): UseThemeDirectionReturn {
  const { dir, setDir } = useTheme();
  return {
    dir,
    setDir,
    toggleDir: () => setDir(dir === 'rtl' ? 'ltr' : 'rtl'),
  };
}