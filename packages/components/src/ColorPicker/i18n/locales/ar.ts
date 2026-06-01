import type { ColorPickerTranslations } from '../../ColorPicker.types';

/** Arabic (ar) translations for `<ColorPicker />`. */
export const arColorPickerTranslations: ColorPickerTranslations = {
  trigger: 'اختر اللون',
  saturation: 'التشبع والسطوع',
  brightness: 'السطوع',
  hue: 'تدرج اللون',
  alpha: 'الشفافية',
  hex: 'سداسي',
  red: 'R',
  green: 'G',
  blue: 'B',
  saturationShort: 'S',
  lightness: 'L',
  alphaShort: 'A',
  formatHex: 'HEX',
  formatRgb: 'RGB',
  formatHsl: 'HSL',
  eyedropper: 'اختر اللون من الشاشة',
  presets: 'الألوان المحددة مسبقًا',
  presetLabel: (value) => `استخدم اللون ${value}`,
  contrast: (ratio, level) => `نسبة التباين ${ratio}:1 — ${level}`,
  contrastPass: 'ناجح',
  contrastFail: 'فاشل',
};