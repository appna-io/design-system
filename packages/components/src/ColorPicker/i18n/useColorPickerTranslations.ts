'use client';

import { useI18n } from '@apx-ui/engine';
import { useMemo } from 'react';

import type { ColorPickerTranslations } from '../ColorPicker.types';
import { enColorPickerTranslations } from './locales/en';

/**
 * Resolve the effective translations for a ColorPicker instance, applying the three-layer
 * precedence rule (highest → lowest):
 *
 *  1. Inline `translations={…}` prop (partial — every key falls through to lower layers)
 *  2. `<I18nProvider messages={{ ColorPicker: {…} }}>` context
 *  3. Built-in English defaults
 */
export function useColorPickerTranslations(
  propsLayer?: Partial<ColorPickerTranslations>,
): ColorPickerTranslations {
  const i18n = useI18n();
  const providerLayer = i18n?.get<Partial<ColorPickerTranslations>>('ColorPicker');

  return useMemo(
    () => mergeColorPickerTranslations(enColorPickerTranslations, providerLayer, propsLayer),
    [providerLayer, propsLayer],
  );
}

/**
 * Pure merger — exposed for tests and for headless consumers that want to compose the bag
 * outside React's lifecycle. Shallow-merges every key; functions in `propsLayer` win.
 */
export function mergeColorPickerTranslations(
  defaults: ColorPickerTranslations,
  fromProvider: Partial<ColorPickerTranslations> | undefined,
  fromProps: Partial<ColorPickerTranslations> | undefined,
): ColorPickerTranslations {
  return {
    ...defaults,
    ...(fromProvider ?? {}),
    ...(fromProps ?? {}),
  };
}