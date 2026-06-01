import type { ColorPickerTranslations } from '../../ColorPicker.types';

/** Hebrew (he-IL) translations for `<ColorPicker />`. */
export const heColorPickerTranslations: ColorPickerTranslations = {
  trigger: 'בחר צבע',
  saturation: 'רוויה ובהירות',
  brightness: 'בהירות',
  hue: 'גוון',
  alpha: 'שקיפות',
  hex: 'הקס',
  red: 'R',
  green: 'G',
  blue: 'B',
  saturationShort: 'S',
  lightness: 'L',
  alphaShort: 'A',
  formatHex: 'HEX',
  formatRgb: 'RGB',
  formatHsl: 'HSL',
  eyedropper: 'בחר צבע מהמסך',
  presets: 'צבעים מוגדרים מראש',
  presetLabel: (value) => `השתמש בצבע ${value}`,
  contrast: (ratio, level) => `יחס ניגודיות ${ratio}:1 — ${level}`,
  contrastPass: 'עובר',
  contrastFail: 'נכשל',
};