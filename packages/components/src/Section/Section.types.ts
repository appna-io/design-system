import type { ReactNode } from 'react';
import type { SurfaceProps, SurfaceTone } from '../Surface';

/**
 * Vertical rhythm. Named steps rather than padding values, because the whole point is that five
 * templates cannot drift into five different vertical rhythms.
 *
 * - `compact` — a band that supports the one above it (a logo strip, a stat row).
 * - `default` — every ordinary content section.
 * - `spacious` — a hero or a closing CTA, where the extra air is the emphasis.
 * - `flush` — no vertical padding at all, for a band that owns its own (a full-bleed image, a
 *   marquee that should touch the sections above and below).
 */
export type SectionRhythm = 'compact' | 'default' | 'spacious' | 'flush';

/**
 * Content width.
 *
 * - `default` — the house container.
 * - `narrow` — prose measure, for a section that is mostly running text (an FAQ, a manifesto).
 * - `wide` — for a dense grid that would look starved at the house width.
 * - `full` — the *ground* bleeds edge to edge while the children stay in the house container, so
 *   a full-bleed band still has copy aligned with every other section on the page.
 */
export type SectionWidth = 'default' | 'narrow' | 'wide' | 'full';

/** Where the atmospheric wash is anchored. The second wash is derived from the first. */
export type SectionAtmosphereAnchor = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface SectionAtmosphere {
  /** Palette role the primary wash is cut from. Defaults to `'primary.subtle'`. */
  from?: string | undefined;
  /** Corner the primary wash sits in. The counter-wash goes to the opposite corner. */
  anchor?: SectionAtmosphereAnchor | undefined;
  /** Palette role for the counter-wash. Defaults to `'secondary.subtle'`. */
  counter?: string | undefined;
}

export interface SectionProps extends Omit<SurfaceProps, 'children' | 'tone'> {
  /** Ground for this band and everything in it — forwarded straight to `Surface`. */
  tone?: SurfaceTone | undefined;
  /** Vertical rhythm. Defaults to `'default'`. */
  rhythm?: SectionRhythm | undefined;
  /** Content width. Defaults to `'default'`. */
  width?: SectionWidth | undefined;
  /**
   * Atmospheric background — two offset radial washes, which is what reads as *light* rather
   * than as a band. `true` uses the defaults; an object tunes the roles and the anchor.
   */
  atmosphere?: boolean | SectionAtmosphere | undefined;
  /** Extra classes for the inner container, where `className` styles the outer ground. */
  containerClassName?: string | undefined;
  children?: ReactNode;
}
