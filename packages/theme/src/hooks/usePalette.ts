'use client';

import type { PaletteShape } from '@apx-ui/engine';
import { useTheme } from './useTheme';

/**
 * Returns the active palette (light or dark, based on resolved mode). Components rarely need this
 * because CSS variables already handle mode switching — reach for it only when you need to derive
 * a color in JS (e.g., generating a `currentColor` mask programmatically).
 */
export function usePalette(): PaletteShape {
  const { theme, resolvedMode } = useTheme();
  return theme.palette[resolvedMode];
}
