import type { CSSProperties, FocusEventHandler, KeyboardEventHandler, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

import type { InputColor, InputSize, InputVariant } from '../Input/Input.types';

/**
 * Re-export Input's visual axes — NumberInput is a `<input type="text">` wearing Input's frame, so
 * the variant / size / color story is identical. Adding a new Input variant means NumberInput
 * picks it up automatically; we deliberately avoid declaring our own enum here.
 */
export type NumberInputVariant = InputVariant;
export type NumberInputSize = InputSize;
export type NumberInputColor = InputColor;

/** Where the +/− buttons sit. `split` puts `−` on the logical start and `+` on the logical end. */
export type StepperPosition = 'start' | 'end' | 'split';

export interface NumberInputProps {
  /** Controlled value. `null` means "input is empty". */
  value?: number | null | undefined;
  /** Initial value for the uncontrolled flow. `null` means the field starts empty. */
  defaultValue?: number | null | undefined;
  /**
   * Fires on every committed change (typing + stepper + keyboard). `null` means the input is
   * empty. Consumers receive a real `number`, never a string — this is the whole point of the
   * component.
   */
  onChange?: ((value: number | null) => void) | undefined;
  /** Fires on blur / Enter — useful for "save when done editing" UX. */
  onChangeEnd?: ((value: number | null) => void) | undefined;

  /** Inclusive lower bound. When `clampOnBlur` is true, values below `min` snap to `min` on commit. */
  min?: number | undefined;
  /** Inclusive upper bound. When `clampOnBlur` is true, values above `max` snap to `max` on commit. */
  max?: number | undefined;
  /** Increment used by arrow keys and the +/− buttons. @default 1 */
  step?: number | undefined;
  /** Increment for Shift+Arrow / PageUp / PageDown / Shift+wheel. @default `step * 10` */
  largeStep?: number | undefined;
  /** Decimal places to round to on commit. Avoid passing 0 if `allowDecimals=false` — use the latter. */
  precision?: number | undefined;
  /** Snap out-of-range values into [`min`, `max`] on blur / Enter. @default true */
  clampOnBlur?: boolean | undefined;
  /** Reject negative input entirely (no minus sign accepted). @default true */
  allowNegative?: boolean | undefined;
  /** Reject decimal separators entirely. @default true */
  allowDecimals?: boolean | undefined;

  /** BCP-47 locale used for both parsing and formatting. Defaults to the browser locale. */
  locale?: string | undefined;
  /** Pass-through `Intl.NumberFormat` options used for the *display* string. */
  format?: Intl.NumberFormatOptions | undefined;
  /**
   * Custom parser. Receives the raw input string + the active locale. Returns `number | null`.
   * When omitted, a locale-aware parser is used (handles thousand separators + Arabic-Indic /
   * Persian digits + locale-specific decimal separators).
   */
  parse?: ((rawInput: string, locale: string) => number | null) | undefined;

  /** Hide the +/− buttons. Arrow keys + wheel (opt-in) still work. @default false */
  hideStepperButtons?: boolean | undefined;
  /** Place +/− on `start` / `end` (stacked vertically) or `split` (one each side). @default 'end' */
  stepperPosition?: StepperPosition | undefined;
  /** Wheel scroll changes value when the input is focused. Opt-in to avoid surprise. @default false */
  enableScrollWheel?: boolean | undefined;

  /** Visual variant — inherited from Input. @default 'outline' */
  variant?: ResponsiveValue<NumberInputVariant> | undefined;
  /** Visual size — inherited from Input. @default 'md' */
  size?: ResponsiveValue<NumberInputSize> | undefined;
  /** Accent color for focus ring + stepper hover. @default 'primary' */
  color?: ResponsiveValue<NumberInputColor> | undefined;
  /** Stretch to fill the parent's inline-size. @default true */
  fullWidth?: ResponsiveValue<boolean> | undefined;
  /** `aria-invalid` + danger ring/border. */
  invalid?: boolean | undefined;
  /** Locks the field from edits + dims it. Stepper buttons disable too. */
  disabled?: boolean | undefined;
  /** Field accepts focus but rejects edits + stepper clicks. Form still submits. */
  readOnly?: boolean | undefined;
  /** Mirrors the native `required` attribute. */
  required?: boolean | undefined;

  /** Native form name — propagates to the hidden `<input>` so submission sees a canonical value. */
  name?: string | undefined;
  /** Native `id` for the visible `<input>`. Auto-generated when omitted. */
  id?: string | undefined;
  /** Placeholder for the visible `<input>`. */
  placeholder?: string | undefined;

  /** Accessible label fall-back for the input + the stepper buttons. */
  'aria-label'?: string | undefined;
  /** Existing labelledby id (e.g. from a paired `<label>`). */
  'aria-labelledby'?: string | undefined;
  /** Existing describedby id (helper / error text). */
  'aria-describedby'?: string | undefined;

  /** Translatable label for the `+` stepper button. @default 'Increment' */
  incrementLabel?: string | undefined;
  /** Translatable label for the `−` stepper button. @default 'Decrement' */
  decrementLabel?: string | undefined;

  /** Visible left-edge content (icons / addons). Renders inside the input frame. */
  leftAddon?: ReactNode;
  /** Visible right-edge content (icons / addons). Renders inside the input frame, before steppers. */
  rightAddon?: ReactNode;

  onFocus?: FocusEventHandler<HTMLInputElement> | undefined;
  onBlur?: FocusEventHandler<HTMLInputElement> | undefined;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement> | undefined;

  className?: string | undefined;
  style?: CSSProperties | undefined;
  sx?: Sx | undefined;
}
