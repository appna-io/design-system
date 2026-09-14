import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import type { Sx } from '@apx-ui/engine';

/**
 * Travel direction of the track.
 *
 * `'left'` / `'right'` are the **visual** directions, deliberately not flipped for RTL: a logo
 * ticker is authored motion, not reading order, and a designer asking for "logos drifting left"
 * means left on screen in every locale. Consumers that genuinely want direction-aware travel
 * read `useDirection()` themselves and pick the value — the same call `motionPresets`'
 * `slideInFromLeft` / `slideInFromRight` make.
 */
export type MarqueeDirection = 'left' | 'right' | 'up' | 'down';

/**
 * Named travel speeds, resolved from `ambientMotion.speed` in `@apx-ui/tokens`.
 *
 * These are **not** the `motion.duration` tokens: those are 150–300ms interaction timings, and a
 * marquee cycle at 300ms is a strobe. Ambient motion that never resolves is a different quantity
 * and gets its own scale.
 *
 * The scale is in **pixels per second**, not seconds per cycle. A cycle duration would make a
 * 6-item band and a 20-item band travel at visibly different speeds — the longer track covers
 * three times the distance in the same time — so every band would need its own hand-tuned number
 * and the site's tempo would drift. A rate is content-independent; the component measures its own
 * track and derives the duration.
 */
export type MarqueeSpeed = 'slow' | 'normal' | 'fast';

/** Gap between items, in DS spacing steps (`gap={6}` → `gap-6`). */
export type MarqueeGap = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;

export interface MarqueeProps
  extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'className' | 'children'> {
  /**
   * The items to scroll. Rendered twice — once visibly, once as an `aria-hidden` clone — so the
   * track can loop seamlessly. Keep the set small enough to fill the container at least once;
   * see `repeat` when it isn't.
   */
  children: ReactNode;
  /** @default 'left' */
  direction?: MarqueeDirection;
  /** Travel rate, from the `ambientMotion.speed` token scale. @default 'normal' */
  speed?: MarqueeSpeed;
  /**
   * Seconds for one full cycle, overriding `speed` entirely.
   *
   * The escape hatch, and a narrow one: pinning a duration re-introduces exactly the
   * content-length coupling `speed` exists to remove, so a band using it will not match the tempo
   * of the bands around it once its content changes. Reach for it only when a single band is
   * genuinely meant to run at its own pace.
   */
  duration?: number;
  /**
   * Freeze the track while the pointer is over it. Off by default: a marquee that stops under the
   * cursor is a hover *affordance*, which is only correct when the items are interactive.
   *
   * This governs the **pointer** only. The track always pauses on `focus-within`, whatever this is
   * set to — a keyboard user must not have to chase a moving link.
   *
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * How many times to repeat the children within a single half of the track. The seamless loop
   * requires the track to be at least twice the container's length; when the child set is short
   * (three logos in a wide band), one copy leaves a visible gap. @default 1
   */
  repeat?: number;
  /** Space between items. @default 8 */
  gap?: MarqueeGap;
  /**
   * Fade the leading and trailing edges with a `mask-image` gradient, so items dissolve rather
   * than clipping against the container edge.
   *
   * On by default: a hard clip at the container edge is the tell that a band was assembled rather
   * than designed. Turning it off is opting out of the reviewed design, which is occasionally
   * right — a marquee inside an already-masked or full-bleed container doesn't need a second one.
   *
   * @default true
   */
  fade?: boolean;
  /**
   * Width of each fade edge as a CSS length.
   *
   * The default is percentage-based so the mask scales with the band, but capped in absolute
   * terms: at 12% a 360px phone gets 43px of mask on *each* side, which stops softening the edge
   * and starts cropping the first logo. `min()` keeps it a fade at every width.
   *
   * @default 'min(12%, 48px)'
   */
  fadeWidth?: string;
  /**
   * Force the reduced-motion presentation on (`true`) or off (`false`), bypassing the media
   * query. Mirrors `useReducedMotion(forceValue)`; exists for tests and for stories that need to
   * show both presentations side by side.
   */
  reduceMotion?: boolean;
  /** Element rendered for the outer container. @default 'div' */
  as?: 'div' | 'section' | 'aside';
  className?: string;
  style?: CSSProperties;
  /** Theme-aware inline style. */
  sx?: Sx;
  ref?: Ref<HTMLElement>;
}
