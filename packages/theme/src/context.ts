import type { Direction, ThemeShape } from '@apx-ui/engine';
import type { ThemePlatform } from '@apx-ui/tokens';
import { createContext } from 'react';
import type { ThemeOverride } from './mergeTheme';

export type ResolvedMode = 'light' | 'dark';
export type ModeSetting = ResolvedMode | 'system';

/**
 * `'auto'` defers to runtime detection; `'apple'` / `'other'` pin the value explicitly. Useful
 * for screenshot tests, design reviews, or apps that want to ignore browser sniffing.
 */
export type PlatformSetting = ThemePlatform | 'auto';

export interface ThemeContextValue {
  /** The fully-merged theme object (defaults + consumer overrides + active variant tokens + runtime overrides). */
  theme: ThemeShape;
  /** What the user *picked*: `'light'`, `'dark'`, or `'system'`. */
  mode: ModeSetting;
  /** What `mode` resolves to right now (`'system'` → the OS preference). */
  resolvedMode: ResolvedMode;
  /** Currently active theme variant name (e.g. `'default'`, `'tetsu'`, `'origami'`). */
  variant: string;
  /** What `platform` resolves to right now (`'auto'` → runtime browser detection). */
  resolvedPlatform: ThemePlatform;
  /** What the user *picked*: `'apple'`, `'other'`, or `'auto'`. */
  platform: PlatformSetting;
  /** Currently active direction. */
  dir: Direction;
  /**
   * Runtime overrides layered on top of `baseTheme + variant`. Used by the Theme Studio so any
   * palette color or engine token can be tweaked live with no rebuild. Empty object `{}` means
   * "no overrides — DS defaults win".
   */
  overrides: ThemeOverride;
  /** Switch the mode setting. Persists if the provider has a `storageKey`. */
  setMode: (mode: ModeSetting) => void;
  /** Switch the active theme variant. */
  setVariant: (variant: string) => void;
  /** Pin the platform (or pass `'auto'` to re-enable detection). */
  setPlatform: (platform: PlatformSetting) => void;
  /** Switch the direction. */
  setDir: (dir: Direction) => void;
  /** Replace the entire override object. Pass `{}` to clear (use `resetOverrides` for clarity). */
  setOverrides: (overrides: ThemeOverride) => void;
  /** Deep-merge a partial patch onto the current overrides. */
  patchOverrides: (patch: ThemeOverride) => void;
  /** Drop all runtime overrides; the DS returns to `baseTheme + variant`. */
  resetOverrides: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
ThemeContext.displayName = 'ApxThemeContext';