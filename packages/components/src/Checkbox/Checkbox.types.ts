import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Stylistic family for the checked-state indicator. All three variants share the same unchecked
 * appearance (an outlined box) so the family selection only changes how a *checked* (or
 * *indeterminate*) cell paints.
 */
export type CheckboxVariant = 'solid' | 'outline' | 'soft';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export type CheckboxColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** Corner shape of the indicator box. */
export type CheckboxShape = 'square' | 'rounded' | 'circle';

/** Label slot positioning. Logical (start/end), maps to LTR/RTL via `flex-row` / `flex-row-reverse`. */
export type CheckboxLabelPosition = 'left' | 'right';

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'color' | 'size' | 'type' | 'onChange'
  > {
  /** Stylistic family of the checked indicator. @default 'solid' */
  variant?: ResponsiveValue<CheckboxVariant> | undefined;
  /** Box + glyph + label size. @default 'md' */
  size?: ResponsiveValue<CheckboxSize> | undefined;
  /** Semantic palette role driving checked fill / outline / glyph color. @default 'primary' */
  color?: ResponsiveValue<CheckboxColor> | undefined;
  /** Corner shape of the indicator box. @default 'square' */
  shape?: CheckboxShape | undefined;
  /**
   * Where the label renders relative to the box. Logical: `right` = end side in LTR, start side
   * in RTL. @default 'right'
   */
  labelPosition?: CheckboxLabelPosition | undefined;
  /** Controlled checked state. */
  checked?: boolean | undefined;
  /** Uncontrolled initial checked state. @default false */
  defaultChecked?: boolean | undefined;
  /**
   * Tri-state visual. Sets `aria-checked="mixed"` and applies the indeterminate glyph + styling.
   * Per native HTML semantics, `indeterminate` is a separate axis from `checked` — the
   * component renders the indeterminate look whenever `indeterminate && !checked`.
   */
  indeterminate?: boolean | undefined;
  /** Visual + a11y invalid state (sets `aria-invalid` + `data-invalid`). */
  invalid?: boolean | undefined;
  /** Optional secondary text rendered below the label, wired via `aria-describedby`. */
  description?: ReactNode;
  /**
   * Canonical handler — receives the new boolean directly. Use alongside or instead of `onChange`
   * (which still fires with the native `ChangeEvent`).
   */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /** Native change handler. Preserved alongside `onCheckedChange`. */
  onChange?: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined;
  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
}
