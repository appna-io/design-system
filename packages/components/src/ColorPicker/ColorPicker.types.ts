import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { Sx } from '@apx-ui/engine';

/**
 * Visual density. `sm` is the inline-with-form-row size, `md` is the default standalone form
 * field size, `lg` is the prominent "theme studio" hero size.
 */
export type ColorPickerSize = 'sm' | 'md' | 'lg';

/**
 * Three trigger shapes for the popover. `swatch` is the default chip-only trigger, `button`
 * shows a labelled button (e.g. "Pick color"), `input` exposes the hex / CSS value as an
 * editable text input with the swatch as a left-addon.
 */
export type ColorPickerTriggerVariant = 'swatch' | 'button' | 'input';

/**
 * Output format. `'auto'` preserves the incoming format (hex stays hex, hsl stays hsl). The
 * other three force a specific serialization regardless of input.
 */
export type ColorPickerFormat = 'hex' | 'rgb' | 'hsl' | 'auto';

/** Which surface inside the picker drove the change. Useful for analytics. */
export type ColorPickerChangeSource =
  | 'sb'
  | 'hue'
  | 'alpha'
  | 'input'
  | 'preset'
  | 'eyedropper';

export interface ColorPickerChangeMeta {
  /** Final serialization format used for the emitted value. */
  format: 'hex' | 'rgb' | 'hsl';
  /** Surface that triggered the change. */
  source: ColorPickerChangeSource;
}

export type ColorPickerChangeHandler = (value: string, meta: ColorPickerChangeMeta) => void;

export interface ColorPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'color'> {
  /** Controlled color (any CSS-valid format). Pair with `onChange`. */
  value?: string | undefined;
  /** Uncontrolled initial color. */
  defaultValue?: string | undefined;
  /** Fires on every committed value change. */
  onChange?: ColorPickerChangeHandler | undefined;

  /**
   * Output format. `'auto'` (default) preserves the incoming format. `'hex'` / `'rgb'` /
   * `'hsl'` force the named serialization.
   */
  format?: ColorPickerFormat | undefined;

  /** When true, the alpha slider appears + alpha is preserved in the emitted string. */
  enableAlpha?: boolean | undefined;

  /** Optional palette of preset swatches displayed inside the picker. */
  presets?: ReadonlyArray<string> | undefined;
  /** Disable the freeform picker and show only the presets grid. */
  presetsOnly?: boolean | undefined;
  /** When `presetsOnly`, close the popover the moment a preset is clicked. */
  closeOnSelect?: boolean | undefined;

  /** Show the browser EyeDropper API button (gated on `window.EyeDropper`). */
  enableEyedropper?: boolean | undefined;

  /** Show a contrast chip comparing the current color against `contrastAgainst`. */
  enableContrastCheck?: boolean | undefined;
  /** Background color the contrast chip checks against. @default '#FFFFFF' */
  contrastAgainst?: string | undefined;

  /** Trigger shape. @default 'swatch' */
  triggerVariant?: ColorPickerTriggerVariant | undefined;

  /** Visual density. @default 'md' */
  size?: ColorPickerSize | undefined;

  /** Visible label above the trigger (becomes the accessible name when set). */
  label?: ReactNode | undefined;
  /** Hint text between the label and the trigger. */
  description?: ReactNode | undefined;
  /** Bottom helper text. Hidden when `error` is set. */
  helperText?: ReactNode | undefined;
  /** Bottom error text. Announced via `aria-describedby`; sets `data-invalid` on the trigger. */
  error?: ReactNode | undefined;
  /** Visually hide the label (still sr-only for AT). @default false */
  hideLabel?: boolean | undefined;

  /** Sets `required` on the hidden input (native validation carries the semantics). */
  required?: boolean | undefined;
  /** Block all interaction. */
  disabled?: boolean | undefined;
  /** Render the trigger as static (no popover). */
  readOnly?: boolean | undefined;

  /** Hidden-input name for HTML form submission. */
  name?: string | undefined;
  /** Override id on the trigger. */
  id?: string | undefined;

  /** Override accessible name when no visible label is provided. */
  ariaLabel?: string | undefined;

  /** Per-instance translations override. Falls back to the I18nProvider, then English defaults. */
  translations?: Partial<ColorPickerTranslations> | undefined;

  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
  /** Standard inline style. */
  style?: CSSProperties | undefined;
  /** Override className on the trigger. */
  className?: string | undefined;
}

/** Public props for the standalone read-only swatch chip. */
export interface ColorSwatchProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** Color in any CSS-valid format. */
  value: string;
  /** Visual density. @default 'md' */
  size?: ColorPickerSize | undefined;
  /** Optional inline label text rendered to the right of the swatch. */
  showLabel?: ReactNode | undefined;
  /** Accessible name when no label is shown. */
  ariaLabel?: string | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

/** Public props for the standalone `<ColorInput />` text-only variant. */
export interface ColorInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'color'> {
  /** Controlled color (any CSS-valid format). */
  value?: string | undefined;
  /** Uncontrolled initial color. */
  defaultValue?: string | undefined;
  /** Fires on commit (Enter / blur). */
  onChange?: ColorPickerChangeHandler | undefined;

  /** Output format. `'auto'` preserves the incoming format. @default 'auto' */
  format?: ColorPickerFormat | undefined;
  /** Preserve alpha in the emitted string. @default false */
  enableAlpha?: boolean | undefined;

  /** Visual density. @default 'md' */
  size?: ColorPickerSize | undefined;

  /** Visible label. */
  label?: ReactNode | undefined;
  /** Description text. */
  description?: ReactNode | undefined;
  /** Helper text. */
  helperText?: ReactNode | undefined;
  /** Error text — announced via `aria-describedby`; sets `data-invalid`. */
  error?: ReactNode | undefined;
  /** Visually hide the label. @default false */
  hideLabel?: boolean | undefined;

  /** Sets `required` on the hidden input (native validation carries the semantics). */
  required?: boolean | undefined;
  /** Block all interaction. */
  disabled?: boolean | undefined;
  /** Set the input as read-only. */
  readOnly?: boolean | undefined;

  /** Hidden-input name for HTML form submission. */
  name?: string | undefined;
  /** Override id on the input. */
  id?: string | undefined;
  /** Accessible name when no label is shown. */
  ariaLabel?: string | undefined;

  /** Theme-aware inline style. */
  sx?: Sx | undefined;
  /** Standard inline style. */
  style?: CSSProperties | undefined;
  /** Override className. */
  className?: string | undefined;
}

/**
 * The translation bag the picker exposes to `<I18nProvider messages={{ ColorPicker: … }}>`.
 * Every visible string in the picker flows through this object so consumers can swap the whole
 * surface into Hebrew / Arabic / their own language via one prop or one provider call.
 */
export interface ColorPickerTranslations {
  trigger: string;
  saturation: string;
  brightness: string;
  hue: string;
  alpha: string;
  hex: string;
  red: string;
  green: string;
  blue: string;
  saturationShort: string;
  lightness: string;
  alphaShort: string;
  formatHex: string;
  formatRgb: string;
  formatHsl: string;
  eyedropper: string;
  presets: string;
  presetLabel: (value: string) => string;
  contrast: (ratio: string, level: string) => string;
  contrastPass: string;
  contrastFail: string;
}