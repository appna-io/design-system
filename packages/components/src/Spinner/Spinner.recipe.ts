import { cv } from '@apx-ui/engine';

import type { SpinnerSize, SpinnerSpeed } from './Spinner.types';

/**
 * Pixel diameter for each token size. The number drops to inline `width` / `height` on the SVG /
 * pulse disc / dots row so consumers can mix and match `<Spinner size="sm" />` next to text and
 * `<Spinner size={120} />` in an EmptyState graphic without recipe churn.
 */
export const SPINNER_SIZE_PX: Record<Exclude<SpinnerSize, number>, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 32,
  xl: 48,
};

/**
 * Animation duration (ms) for each `speed` token. Mapped at render time onto inline
 * `animation-duration` so the keyframe utility class can stay stable across every speed.
 *
 * - `slow`   — 1200 ms · "deliberate, still working"
 * - `normal` —  800 ms · default, matches Tailwind's built-in `animate-spin`
 * - `fast`   —  500 ms · "almost done"
 */
export const SPINNER_SPEED_MS: Record<SpinnerSpeed, number> = {
  slow: 1200,
  normal: 800,
  fast: 500,
};

/**
 * Stagger delays for the three `dots` variant children. The 0 / 160 / 320 ms offsets are the
 * classic "loading dots" gap — small enough to read as a single animated unit, large enough to
 * stay visibly staggered at the `fast` speed.
 */
export const SPINNER_DOT_DELAYS_MS: readonly [number, number, number] = [0, 160, 320];

/**
 * Outer wrapper recipe. Owns the flex direction when a visible label is rendered. `labelPlacement`
 * is the only variant axis — the visual glyph (ring / dots / pulse) styling lives on its own
 * inline structure so each variant can keep its own DOM shape.
 */
export const spinnerWrapperRecipe = cv({
  base: 'inline-flex shrink-0',
  variants: {
    labelPlacement: {
      hidden: 'items-center justify-center',
      end: 'items-center gap-2 flex-row',
      bottom: 'items-center gap-1 flex-col',
    },
  },
  defaultVariants: {
    labelPlacement: 'hidden',
  },
});

/**
 * Glyph recipe (applies to the inner element that actually carries the animation: the SVG for
 * `ring`, the row container for `dots`, the disc for `pulse`).
 *
 * Color paths map to the same Tailwind utility namespace the rest of the DS uses (`text-primary`,
 * `text-success`, …). Omitting the `color` prop entirely keeps the spinner on `currentColor`
 * which is the right behavior for nesting inside `<Button>` / `<a>` / any text surface.
 *
 * Adding an 8th palette role = one entry in `@apx-ui/tokens` + one row in `color` below.
 */
export const spinnerGlyphRecipe = cv({
  base: 'inline-block shrink-0',
  variants: {
    variant: {
      ring: 'animate-spin motion-reduce:animate-none',
      dots: 'inline-flex items-center justify-center',
      pulse: 'rounded-full bg-current animate-spinner-pulse motion-reduce:animate-none',
    },
    color: {
      primary: 'text-primary',
      secondary: 'text-secondary',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      info: 'text-info',
      neutral: 'text-fg-muted',
    },
  },
});

/**
 * Per-dot recipe inside the `dots` variant. Each dot is a `bg-current` circle so it picks up
 * whichever color the glyph carries; the bounce keyframe + per-dot delay produces the staggered
 * thinking-dots gesture.
 */
export const spinnerDotRecipe = cv({
  base: 'inline-block rounded-full bg-current animate-spinner-bounce motion-reduce:animate-none',
});

/**
 * Visible label recipe. `sr-only` when hidden so the announcement is still present for AT but
 * invisible to sighted users; sized at the spinner's neighbouring text scale otherwise.
 */
export const spinnerLabelRecipe = cv({
  base: 'text-fg-muted',
  variants: {
    labelPlacement: {
      hidden: 'sr-only',
      end: 'text-sm leading-none',
      bottom: 'text-xs leading-none',
    },
  },
  defaultVariants: {
    labelPlacement: 'hidden',
  },
});