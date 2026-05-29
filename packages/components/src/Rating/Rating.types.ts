import type { HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Visual density. `sm` is the inline-with-text size, `md` is the default standalone form-field
 * size, `lg` is the prominent "rate-this-product" hero size.
 */
export type RatingSize = 'sm' | 'md' | 'lg';

/**
 * Glyph color. `warning` is the gold-star convention (the default); the other roles are useful
 * for editorial / brand-immersive contexts where the universal-yellow doesn't fit.
 */
export type RatingColor = 'warning' | 'primary' | 'success' | 'danger' | 'neutral';

/**
 * Selection granularity.
 *
 * - `1`        — whole stars only. The default.
 * - `0.5`      — half-step interactive. Clicking the left half of star N sets `N - 0.5`.
 * - `'exact'`  — **read-only only.** Render an arbitrary fractional fill (e.g. `3.71`) for
 *                displaying averages. Throws in dev if used with `readOnly={false}`.
 */
export type RatingPrecision = 1 | 0.5 | 'exact';

/** Provenance of the change. Lets consumers tell click-from-keyboard apart in analytics. */
export type RatingChangeSource = 'click' | 'keyboard' | 'clear';

export interface RatingChangeMeta {
  source: RatingChangeSource;
}

export type RatingChangeHandler = (value: number, meta: RatingChangeMeta) => void;

/** Visual + accessible label override for the `aria-valuetext` announcement. */
export type RatingValueFormatter = (value: number, max: number) => string;

export interface RatingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'color'> {
  /** Controlled value. Pair with `onChange`. */
  value?: number | undefined;
  /** Uncontrolled initial value. Use `value` for controlled. @default 0 */
  defaultValue?: number | undefined;
  /** Called on every committed value change. */
  onChange?: RatingChangeHandler | undefined;

  /** Number of stars in the scale. @default 5 */
  max?: number | undefined;
  /** Selection granularity. @default 1 */
  precision?: RatingPrecision | undefined;
  /** Clicking the currently-selected value clears it to 0. @default false */
  allowClear?: boolean | undefined;

  /** Filled-state glyph. Defaults to an inline SVG star. */
  icon?: ReactNode | undefined;
  /** Empty-state glyph. Defaults to the outline version of the filled glyph. */
  emptyIcon?: ReactNode | undefined;

  /** Render the control as static display. Disables click / keyboard. */
  readOnly?: boolean | undefined;
  /** Mirrors the native `disabled` attribute. Blocks all interaction. */
  disabled?: boolean | undefined;
  /** Sets `aria-required="true"` and `required` on the hidden input. */
  required?: boolean | undefined;

  /** Hidden-input name for HTML form submission. */
  name?: string | undefined;

  /** Visual density. @default 'md' */
  size?: ResponsiveValue<RatingSize> | undefined;
  /** Glyph color. @default 'warning' */
  color?: ResponsiveValue<RatingColor> | undefined;
  /** Append a `"{value} of {max}"` text node next to the stars. @default false */
  showValue?: boolean | undefined;

  /** Visible label above the stars (becomes the accessible name when set). */
  label?: ReactNode | undefined;
  /** Hint text between the label and the stars. */
  description?: ReactNode | undefined;
  /** Bottom helper text. Hidden when `error` is set. */
  helperText?: ReactNode | undefined;
  /** Bottom error text. Sets `aria-invalid="true"` when present. */
  error?: ReactNode | undefined;
  /** Visually hide the label (still sr-only for AT). @default false */
  hideLabel?: boolean | undefined;
  /** Override accessible name when no visible label is provided. */
  ariaLabel?: string | undefined;

  /** Override the `aria-valuetext` string. Defaults to `"{value} out of {max} stars"`. */
  formatValueText?: RatingValueFormatter | undefined;

  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
}
