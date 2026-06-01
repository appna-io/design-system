import type { ChangeEvent, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Stylistic family of the **checked** indicator. The unchecked appearance is identical across
 * all three families (outlined ring, no inner dot), so picking a variant only changes how a
 * selected radio paints.
 */
export type RadioVariant = 'solid' | 'outline' | 'soft';

export type RadioSize = 'sm' | 'md' | 'lg';

export type RadioColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** Logical label side. `right` = end side in LTR / start side in RTL. */
export type RadioLabelPosition = 'left' | 'right';

/** Layout axis of a `<RadioGroup>`. Vertical is the default form-fields look. */
export type RadioGroupOrientation = 'vertical' | 'horizontal';

export interface RadioProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'color' | 'size' | 'type' | 'onChange' | 'value'
  > {
  /**
   * Form value the selection submits as. Required even outside a group — a radio without a
   * `value` can't participate in form submission. Dev-warns if missing (`RADIO_NO_VALUE`).
   */
  value: string;
  /** Stylistic family of the checked indicator. @default 'solid' */
  variant?: ResponsiveValue<RadioVariant> | undefined;
  /** Ring + dot + label size. @default 'md' */
  size?: ResponsiveValue<RadioSize> | undefined;
  /** Semantic palette role driving the checked fill / ring / dot color. @default 'primary' */
  color?: ResponsiveValue<RadioColor> | undefined;
  /** Logical label side. @default 'right' */
  labelPosition?: RadioLabelPosition | undefined;
  /** Controlled checked state. Only meaningful when the Radio is **not** inside a `<RadioGroup>`. */
  checked?: boolean | undefined;
  /** Uncontrolled initial checked state. Only meaningful outside a `<RadioGroup>`. @default false */
  defaultChecked?: boolean | undefined;
  /** Visual + a11y invalid state (sets `aria-invalid` + `data-invalid` on the indicator). */
  invalid?: boolean | undefined;
  /** Optional secondary text rendered below the label, wired via `aria-describedby`. */
  description?: ReactNode;
  /**
   * Canonical handler — receives the new boolean directly. Use alongside or instead of
   * `onChange` (which still fires with the native `ChangeEvent`).
   *
   * Inside a `<RadioGroup>`, prefer `<RadioGroup onValueChange>` — it gives you the **string**
   * value of the selected option, which is almost always what you want.
   */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /** Native change handler. Preserved alongside `onCheckedChange`. */
  onChange?: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined;
  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
}

export interface RadioGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selected value. */
  value?: string | undefined;
  /** Uncontrolled initial selected value. */
  defaultValue?: string | undefined;
  /** Fires with the new selected `value` whenever the user picks an option. */
  onValueChange?: ((value: string) => void) | undefined;
  /** Shared form `name` for every child `<Radio>`. Avoids wiring `name=` on each child. */
  name?: string | undefined;
  /** Mirrors `aria-required` on the group. */
  required?: boolean | undefined;
  /** Propagates to every child `<Radio>`, disabling the entire group. */
  disabled?: boolean | undefined;
  /** Propagates to every child + sets `aria-invalid` on the group container. */
  invalid?: boolean | undefined;
  /** Layout axis. `horizontal` lays the radios in a row; `vertical` stacks them. @default 'vertical' */
  orientation?: ResponsiveValue<RadioGroupOrientation> | undefined;
  /** Default `variant` propagated to each child — per-Radio overrides win. */
  variant?: RadioVariant | undefined;
  /** Default `size` propagated to each child — per-Radio overrides win. */
  size?: RadioSize | undefined;
  /** Default `color` propagated to each child — per-Radio overrides win. */
  color?: RadioColor | undefined;
  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
}