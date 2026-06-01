'use client';

import { createContext, useContext } from 'react';

import type { HSVA } from './_shared/color';
import type { ColorPickerChangeSource, ColorPickerTranslations } from './ColorPicker.types';

/**
 * Internal context shared between `<ColorPicker />` and its private subparts
 * (`SaturationSquare`, `HueSlider`, `AlphaSlider`, `HexInput`, `RgbInput`, `HslInput`,
 * `PresetsGrid`, `EyedropperButton`, `ContrastChip`).
 *
 * Why a context and not prop drilling? Six subparts share five values (hsva, enableAlpha,
 * translations, size, commit fn). Threading those by hand would balloon every subcomponent's
 * prop list and force `<ColorPicker />` to memo aggressively to keep the tree quiet. A single
 * context value memoized at the root is cheaper and keeps the subparts uncluttered.
 */
export interface ColorPickerContextValue {
  /** Live HSVA value driving the picker visuals. */
  hsva: HSVA;
  /** Whether the alpha slider + alpha channel are exposed. */
  enableAlpha: boolean;
  /** Visual density. */
  size: 'sm' | 'md' | 'lg';
  /** Resolved translations bag. */
  t: ColorPickerTranslations;
  /** Commit a new HSVA to the picker. The source feeds analytics via `onChange`'s `meta`. */
  commitHsva: (next: HSVA, source: ColorPickerChangeSource) => void;
  /** Disabled state — subparts mirror this in `aria-disabled`. */
  disabled: boolean;
  /** Read-only state — interaction blocked but visuals stay. */
  readOnly: boolean;
}

export const ColorPickerContext = createContext<ColorPickerContextValue | null>(null);

export function useColorPickerContext(componentName: string): ColorPickerContextValue {
  const ctx = useContext(ColorPickerContext);
  if (!ctx) {
    throw new Error(
      `<${componentName}> must be rendered inside <ColorPicker>. This is an internal subpart and isn't exported for direct use.`,
    );
  }
  return ctx;
}