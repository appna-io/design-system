import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Stylistic family. Phase 5 ships only `solid`; Phase 6 fills in `outline` and `ghost` plus their
 * compound-variant cells so the very same component picks up the new looks without re-rendering.
 */
export type ButtonVariant = 'solid' | 'outline' | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Stylistic family. @default 'solid' */
  variant?: ResponsiveValue<ButtonVariant> | undefined;
  /** Visual height + horizontal padding. @default 'md' */
  size?: ResponsiveValue<ButtonSize> | undefined;
  /** Semantic palette role driving fill / text / focus-ring colors. @default 'primary' */
  color?: ResponsiveValue<ButtonColor> | undefined;
  /** Stretch to fill the parent's inline-size. @default false */
  fullWidth?: ResponsiveValue<boolean> | undefined;
  /**
   * Force the square icon-only layout. Inferred automatically when `children` is empty and at
   * least one of `leftIcon` / `rightIcon` is provided. Requires `aria-label`.
   */
  iconOnly?: boolean | undefined;
  /** Element rendered before the label (e.g. an icon). Visually swaps with `rightIcon` in RTL. */
  leftIcon?: ReactNode;
  /** Element rendered after the label. */
  rightIcon?: ReactNode;
  /** When `true`, blocks interaction, sets `aria-busy`, and shows a spinner. */
  loading?: boolean | undefined;
  /** Optional label rendered (and announced) in place of `children` while loading. */
  loadingText?: string | undefined;
  /**
   * Radix-style polymorphism. When `true`, Button merges its props/className/ref onto the single
   * child element (e.g. wrap an `<a>` to render as a styled link).
   */
  asChild?: boolean | undefined;
  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
}