import type { InputHTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Border + background story of the input. Four families ship out of the box:
 *
 *  - `outline` — 1px border, paper bg. The default for new screens.
 *  - `solid`   — filled tint (`bg.subtle`), border-less. Best on a paper parent.
 *  - `ghost`   — invisible at rest; gains a tint + border only on hover/focus.
 *  - `underline` — single bottom rule. Material-style, minimalist dense forms.
 */
export type InputVariant = 'outline' | 'solid' | 'ghost' | 'underline';

export type InputSize = 'sm' | 'md' | 'lg';

export type InputColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Props for the canonical single-line `<Input />`. We `Omit` the conflicting native props (the
 * HTML `size` attribute is a character-count hint and `color` is a string color attr); the
 * stylistic equivalents live on `InputProps` and the native escape hatch lives on `htmlSize`.
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'color' | 'size'> {
  /** Border + background story. @default 'outline' */
  variant?: ResponsiveValue<InputVariant> | undefined;
  /** Visual height + horizontal padding + font-size. @default 'md' */
  size?: ResponsiveValue<InputSize> | undefined;
  /** Accent for the focus ring + focused border. @default 'primary' */
  color?: ResponsiveValue<InputColor> | undefined;
  /** Stretch to fill the parent's inline-size. @default true */
  fullWidth?: ResponsiveValue<boolean> | undefined;
  /** Visual + `aria-invalid` invalid state. Wins over the active `color` for border + ring. */
  invalid?: boolean | undefined;
  /**
   * When `true`, the field is locked from edits, gains `aria-busy`, and renders a spinner in the
   * right-icon slot. Stays tab-focusable (uses `readOnly`, not `disabled`) so screen readers can
   * still announce the busy state and the field participates in form submission.
   */
  loading?: boolean | undefined;
  /** Icon rendered **inside** the input's left padding. Doesn't capture pointer events. */
  leftIcon?: ReactNode;
  /** Icon rendered **inside** the input's right padding. Replaced by the spinner while `loading`. */
  rightIcon?: ReactNode;
  /** Sibling element joined visually with the input via a shared border-radius collapse. */
  leftAddon?: ReactNode;
  /** Sibling element joined visually with the input via a shared border-radius collapse. */
  rightAddon?: ReactNode;
  /** Native HTML `size` attribute (character-count hint), since we steal `size` for sizing. */
  htmlSize?: number | undefined;
  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
}
