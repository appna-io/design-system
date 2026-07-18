/**
 * Overlay + inverse-context tokens — the values sections layer OVER imagery
 * (scrims, decorative gradients) and the foreground treatment that keeps text
 * readable on top of them.
 *
 * Promoted out of `apx-ui-kit`'s Hero variant matrix (rulebook #3 rule 4:
 * variant styling resolves through token matrices, never inline literals).
 * Section recipes import these instead of carrying their own rgba strings, so
 * a future re-tune re-paints every section at once.
 */

/** Gradient/veil layers rendered between a background image and the content. */
export const overlays = {
  /** Dark veil for full-bleed imagery (luxe heroes, gallery covers). */
  scrimDark:
    'linear-gradient(to bottom, rgba(10, 10, 20, 0.55), rgba(10, 10, 20, 0.75))',
  /** Soft indigo wash used by the airy `aero` look. */
  gradientAero:
    'linear-gradient(135deg, rgba(99, 102, 241, 0.10) 0%, rgba(236, 233, 254, 0.55) 45%, rgba(255, 255, 255, 0) 100%)',
} as const;

/** Foreground treatment over dark imagery/scrims (inverse of the page context). */
export const inverse = {
  /** Text/icon color over a dark scrim. */
  fg: '#fff',
  /** Border color for outline controls over a dark scrim. */
  border: 'rgba(255, 255, 255, 0.72)',
} as const;

export type Overlays = typeof overlays;
export type InverseContext = typeof inverse;
