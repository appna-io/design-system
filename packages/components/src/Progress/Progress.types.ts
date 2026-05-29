import type { HTMLAttributes } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Stylistic family for `<Progress />` (linear). `solid` uses a neutral track + role-colored fill;
 * `soft` swaps the track for the role's `-subtle` shade so the bar sits inside its own tinted
 * lane; `striped` is `solid` with a diagonal CSS-gradient overlay on the bar (consumers reach for
 * it on long-running uploads / installs to communicate "active work").
 */
export type ProgressVariant = 'solid' | 'soft' | 'striped';

/**
 * Stylistic family for `<CircularProgress />`. No `striped` — SVG strokes can't carry a diagonal
 * pattern without a `<pattern>` def, which is out of scope for V1 (logged in the plan as a
 * deferred follow-up).
 */
export type CircularProgressVariant = 'solid' | 'soft';

/** Three-step size scale shared by both shapes. */
export type ProgressSize = 'sm' | 'md' | 'lg';

/** Semantic palette role driving the bar / arc color. */
export type ProgressColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** Corner-radius family for the **linear** track. The arc on `<CircularProgress />` is round-cap. */
export type ProgressRounded = 'sm' | 'md' | 'lg' | 'full';

/**
 * Format function for the optional inline label. Receives the **clamped** current value plus the
 * `max` so consumers can render percentages or domain-specific units like `"2.4 GB / 4 GB"`.
 */
export type ProgressLabelFormatter = (value: number, max: number) => string;

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /**
   * Current value. Clamped into `[min, max]` before being painted. Ignored when `indeterminate`
   * is `true`. @default 0
   */
  value?: number | undefined;
  /** Range minimum. @default 0 */
  min?: number | undefined;
  /** Range maximum. @default 100 */
  max?: number | undefined;
  /**
   * When `true`, the bar paints a CSS-driven sweeping animation and `aria-valuenow` is omitted —
   * the correct ARIA semantics for "we don't know how far along we are" progress.
   */
  indeterminate?: boolean | undefined;
  /** Stylistic family. @default 'solid' */
  variant?: ResponsiveValue<ProgressVariant> | undefined;
  /** Track height / label size. @default 'md' */
  size?: ResponsiveValue<ProgressSize> | undefined;
  /** Palette role driving the bar fill. @default 'primary' */
  color?: ResponsiveValue<ProgressColor> | undefined;
  /** Corner-radius family. @default 'full' */
  rounded?: ResponsiveValue<ProgressRounded> | undefined;
  /**
   * Render the percentage (or `labelFormat` output) inside the track. The label is `aria-hidden`
   * because the percentage is already exposed via `aria-valuenow` / `aria-valuetext`. @default false
   */
  showLabel?: boolean | undefined;
  /** Custom formatter. Falls back to `Math.round(percent) + '%'` when omitted. */
  labelFormat?: ProgressLabelFormatter | undefined;
  /**
   * Animate the bar's width transition when `value` changes. Honors `prefers-reduced-motion`
   * (the Tailwind preset wires that for the indeterminate animation). @default true
   */
  animated?: boolean | undefined;
  /**
   * Diagonal stripes overlay. Setting this to `true` is equivalent to `variant='striped'`; both
   * paths land on the same compound rule. @default false
   */
  striped?: boolean | undefined;
  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
}

export interface CircularProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /**
   * Current value. Clamped into `[min, max]` before being painted. Ignored when `indeterminate`
   * is `true`. @default 0
   */
  value?: number | undefined;
  /** Range minimum. @default 0 */
  min?: number | undefined;
  /** Range maximum. @default 100 */
  max?: number | undefined;
  /**
   * Indeterminate spinner mode. The arc rotates and stretches via two CSS keyframes; `aria-valuenow`
   * is omitted (correct ARIA).
   */
  indeterminate?: boolean | undefined;
  /** Stylistic family. @default 'solid' */
  variant?: CircularProgressVariant | undefined;
  /**
   * Diameter. Token values map to fixed pixel sizes; a `number` sets the diameter directly (and
   * defaults `thickness` to `size / 10`). @default 'md'
   */
  size?: ProgressSize | number | undefined;
  /** Palette role driving the arc stroke. @default 'primary' */
  color?: ResponsiveValue<ProgressColor> | undefined;
  /**
   * Stroke width in pixels. Defaults scale with `size` (`sm: 3, md: 4, lg: 5`); when `size` is a
   * number the default is `Math.max(2, size / 10)`.
   */
  thickness?: number | undefined;
  /** Render the numeric label centered inside the ring. @default false */
  showLabel?: boolean | undefined;
  /** Custom formatter — same shape as the linear variant. */
  labelFormat?: ProgressLabelFormatter | undefined;
  /**
   * Animate the stroke-dashoffset transition when `value` changes. Honors
   * `prefers-reduced-motion`. @default true
   */
  animated?: boolean | undefined;
  /**
   * Opacity of the unfilled track (0–1). Lets consumers dial down a busy backdrop without
   * touching the role color itself. @default 0.2
   */
  trackOpacity?: number | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}
