import type { ColorPickerTranslations } from '../../ColorPicker.types';

/**
 * English (default) translations for `<ColorPicker />`. Every visible string in the picker
 * flows through this object — consumers swap to Hebrew / Arabic / their own via the
 * `translations` prop or `<I18nProvider messages={{ ColorPicker: … }}>`.
 */
export const enColorPickerTranslations: ColorPickerTranslations = {
  trigger: 'Pick color',
  saturation: 'Saturation and brightness',
  brightness: 'Brightness',
  hue: 'Hue',
  alpha: 'Transparency',
  hex: 'Hex',
  red: 'R',
  green: 'G',
  blue: 'B',
  saturationShort: 'S',
  lightness: 'L',
  alphaShort: 'A',
  formatHex: 'HEX',
  formatRgb: 'RGB',
  formatHsl: 'HSL',
  eyedropper: 'Pick color from screen',
  presets: 'Color presets',
  presetLabel: (value) => `Use color ${value}`,
  contrast: (ratio, level) => `Contrast ratio ${ratio}:1 — ${level}`,
  contrastPass: 'passes',
  contrastFail: 'fails',
};