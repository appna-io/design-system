import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import type { Sx } from '@apx-ui/engine';

export interface ParallaxProps
  extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'className' | 'children'> {
  /** The layer to displace. Backgrounds and imagery — never body copy. */
  children: ReactNode;
  /**
   * How far the layer drifts, as a fraction of the distance it travels through the viewport.
   *
   * **Clamped to ±0.1**, and that ceiling is the point of the prop rather than a safety net. Large
   * parallax is the single fastest way to make a page feel cheap: the layer visibly disagrees with
   * the scroll, so the page stops feeling like a surface being moved and starts feeling like it is
   * fighting the gesture. It is also a vestibular trigger well above the threshold where someone
   * would think to turn on `prefers-reduced-motion`.
   *
   * Negative drifts against the scroll (the usual "background lags behind" reading); positive
   * drifts with it.
   *
   * @default -0.06
   */
  speed?: number;
  /**
   * Force the reduced-motion behaviour on (`true`) or off (`false`), bypassing the media query.
   * Mirrors `useReducedMotion(forceValue)`; for tests and side-by-side documentation.
   */
  reduceMotion?: boolean;
  /** Element rendered for the wrapper. @default 'div' */
  as?: 'div' | 'span';
  className?: string;
  style?: CSSProperties;
  /** Theme-aware inline style. */
  sx?: Sx;
  ref?: Ref<HTMLElement>;
}
