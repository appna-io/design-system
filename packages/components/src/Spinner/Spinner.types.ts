import type { HTMLAttributes } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Visual style of the spinner glyph.
 *
 * - `ring`  — SVG arc rotating around a faint track. The default; matches the spinner already
 *   rendered inside `<Button loading>` and `<CircularProgress indeterminate>`.
 * - `dots`  — three dots scaling + fading on staggered delays. Reads as "thinking".
 * - `pulse` — single disc expanding sonar-style. Subtle; pairs well with cards / empty states.
 */
export type SpinnerVariant = 'ring' | 'dots' | 'pulse';

/**
 * Size token. Numeric escape hatch coerces to px on both axes — a square diameter for `ring` and
 * `pulse`, and the overall row height for `dots`.
 */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

/**
 * Animation duration family. `slow` reads as deliberate, `normal` is the default, `fast` is the
 * "we're actually working" tone for short waits. Routed via inline `animation-duration` so the
 * keyframe utility class stays stable.
 *
 * | speed    | duration |
 * | -------- | -------- |
 * | `slow`   | 1200 ms  |
 * | `normal` |  800 ms  |
 * | `fast`   |  500 ms  |
 */
export type SpinnerSpeed = 'slow' | 'normal' | 'fast';

/**
 * Ring stroke width. Enum (not free number) because off-pixel stroke widths render fuzzily and
 * three steps cover every real need.
 */
export type SpinnerThickness = 1 | 2 | 3;

/**
 * Semantic palette role for the spinner glyph. When omitted, the spinner inherits `currentColor`
 * from its surrounding text — drop it inside a `<Button>` / link / inverse-tone surface and it
 * just works without any role override.
 */
export type SpinnerColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Where (or whether) to render the visible label.
 *
 * - `hidden` — label is screen-reader-only (default).
 * - `end`    — label sits to the inline-end of the spinner glyph.
 * - `bottom` — label stacks under the spinner glyph.
 *
 * In all three modes the wrapper still carries `role="status"` + `aria-busy="true"` so screen
 * readers announce the loading state once.
 */
export type SpinnerLabelPlacement = 'hidden' | 'end' | 'bottom';

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Visual style. @default 'ring' */
  variant?: ResponsiveValue<SpinnerVariant> | undefined;
  /** Diameter (token or px). @default 'md' */
  size?: SpinnerSize | undefined;
  /**
   * Palette role driving the spinner glyph color. Omit to inherit `currentColor` from the
   * surrounding text — the right move when nesting inside `<Button>`, `<a>`, or any colored
   * surface that already sets `color`.
   */
  color?: ResponsiveValue<SpinnerColor> | undefined;
  /** Ring stroke width in px. `ring` variant only. @default 2 */
  thickness?: SpinnerThickness | undefined;
  /** Animation duration family. @default 'normal' */
  speed?: SpinnerSpeed | undefined;
  /**
   * Opacity of the ring's background track (0..1). `ring` variant only. Lower it to 0 for a
   * trackless ring. @default 0.2
   */
  trackOpacity?: number | undefined;
  /**
   * Accessible label. Defaults to `"Loading"` so the spinner is always announced. Override to
   * disambiguate (`"Loading users"`, `"Fetching invoices"`, …) or to localize.
   */
  label?: string | undefined;
  /** Where (or whether) to render the visible label text. @default 'hidden' */
  labelPlacement?: SpinnerLabelPlacement | undefined;
  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
}
