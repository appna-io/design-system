import type { HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Stylistic family. Each variant defines a different "fill" story for the badge surface — Badge
 * intentionally ships **four** variants (not three like Button) because the `subtle` look is its
 * own affordance for count/number badges that should never dominate.
 */
export type BadgeVariant = 'solid' | 'outline' | 'soft' | 'subtle';

export type BadgeSize = 'sm' | 'md' | 'lg';

export type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** Corner radius family. `rounded` is the default — softer than Button, looser than `square`. */
export type BadgeShape = 'rounded' | 'pill' | 'square';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** Stylistic family. @default 'soft' */
  variant?: ResponsiveValue<BadgeVariant> | undefined;
  /** Visual height + horizontal padding + font size. @default 'md' */
  size?: ResponsiveValue<BadgeSize> | undefined;
  /** Semantic palette role driving fill / text / dot colors. @default 'primary' */
  color?: ResponsiveValue<BadgeColor> | undefined;
  /** Corner radius family. @default 'rounded' */
  shape?: BadgeShape | undefined;
  /**
   * Renders a tiny status dot before the label. Decorative — always `aria-hidden`. Mutually
   * exclusive with `leftIcon` (the dot wins when both are passed).
   */
  withDot?: boolean | undefined;
  /**
   * Animates the dot with a slow CSS pulse for "Live" / "Streaming" / "Active" indicators. Only
   * applies when `withDot` is also true. Respects `prefers-reduced-motion`.
   */
  dotPulse?: boolean | undefined;
  /** Element rendered before the label (e.g. a `lucide-react` icon). Ignored when `withDot`. */
  leftIcon?: ReactNode;
  /** Element rendered after the label. Ignored when `removable` (the × button takes that slot). */
  rightIcon?: ReactNode;
  /**
   * Adds a built-in `<button>` after the label that fires `onRemove` when clicked. The button is
   * keyboard-reachable and auto-derives `aria-label="Remove {children}"` when `children` is a
   * string; consumers can override via `removeLabel`.
   */
  removable?: boolean | undefined;
  /** Fires when the user clicks (or activates via keyboard) the built-in × button. */
  onRemove?: (() => void) | undefined;
  /**
   * Explicit aria-label for the remove button. Required when `children` isn't a plain string
   * (e.g. when wrapping JSX) — the engine `warn` fires if it's missing in that case.
   */
  removeLabel?: string | undefined;
  /**
   * Radix-style polymorphism. When `true`, Badge merges its props/className/ref onto the single
   * child element (e.g. wrap an `<a>` to render as a styled link/notification badge).
   */
  asChild?: boolean | undefined;
  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
}
