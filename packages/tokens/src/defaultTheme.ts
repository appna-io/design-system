import type { ThemeShape } from '@apx-ui/engine';
import { breakpoints } from './breakpoints';
import { motion } from './motion';
import { lightPalette, darkPalette } from './palette';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';
import { zIndex } from './zIndex';

/**
 * The DS's baseline theme. Consumers extend it via `defineTheme({ … })`. The object is **frozen**
 * to surface accidental mutation early.
 */
export const defaultTheme: ThemeShape = Object.freeze({
  name: 'apx-ds-default',
  palette: {
    light: lightPalette,
    dark: darkPalette,
  },
  mode: 'system',
  dir: 'ltr',
  variant: 'default',
  typography,
  spacing,
  radius,
  shadows,
  motion,
  breakpoints,
  zIndex,
}) as ThemeShape;