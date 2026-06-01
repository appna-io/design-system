import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Stylistic family of the ON-state track. OFF state is consistent across all three (neutral
 * track + paper-white thumb), so picking a variant only changes how a **checked** Switch paints.
 */
export type SwitchVariant = 'solid' | 'outline' | 'soft';

export type SwitchSize = 'sm' | 'md' | 'lg';

export type SwitchColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** Corner shape of the **track**. The thumb is always circular by visual convention. */
export type SwitchShape = 'pill' | 'square';

export type SwitchLabelPosition = 'left' | 'right';

/**
 * Optional glyph rendered **inside the thumb** in each binary state. Common patterns:
 *   `{ on: <Sun />, off: <Moon /> }`  (dark-mode toggle)
 *   `{ on: <Check />, off: null }`    (subtle confirmation)
 */
export interface SwitchThumbIcon {
  on?: ReactNode;
  off?: ReactNode;
}

export interface SwitchProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'color' | 'size' | 'type' | 'onChange'
  > {
  /** Stylistic family of the ON-state. @default 'solid' */
  variant?: ResponsiveValue<SwitchVariant> | undefined;
  /** Track length + thumb diameter + slide distance. @default 'md' */
  size?: ResponsiveValue<SwitchSize> | undefined;
  /** Palette role for the ON-state track / accent. @default 'primary' */
  color?: ResponsiveValue<SwitchColor> | undefined;
  /** Track corner shape. Thumb stays circular. @default 'pill' */
  shape?: SwitchShape | undefined;
  /** Logical label side. `right` = end side (LTR), start side (RTL). @default 'right' */
  labelPosition?: SwitchLabelPosition | undefined;
  /** Controlled checked state. */
  checked?: boolean | undefined;
  /** Uncontrolled initial state. @default false */
  defaultChecked?: boolean | undefined;
  /**
   * Async-toggle spinner inside the thumb. Sets `aria-busy` and blocks user toggling — useful
   * for "Connect to Slack"-style settings where the server must confirm the new state.
   */
  loading?: boolean | undefined;
  /** Visual + a11y invalid state. */
  invalid?: boolean | undefined;
  /** Optional glyphs rendered inside the thumb per state. */
  thumbIcon?: SwitchThumbIcon | undefined;
  /** Secondary text below the label, wired via `aria-describedby`. */
  description?: ReactNode;
  /** Canonical handler — receives the new boolean directly. */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /** Native change handler. Fires alongside `onCheckedChange`. */
  onChange?: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}