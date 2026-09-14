import type { DivProps } from '../Div';

/**
 * Reveal presets, named for what the element *does* rather than for the motion primitive it
 * uses. A template author picks an intent; the mapping to `Div`'s animation presets, the travel
 * distance and the easing are the design system's problem.
 */
export type RevealPreset = 'rise' | 'fade' | 'blur' | 'zoom' | 'left' | 'right';

/**
 * Delay before this element's own reveal starts. Named steps rather than seconds, so a template
 * cannot invent a fourth timing that drifts from the rest of the gallery.
 */
export type RevealDelay = 'none' | 'short' | 'medium';

/**
 * How a parent cascades its children.
 *
 * - `true` — each direct child follows the previous one by the house interval.
 * - `'row'` — children cascade **by row** rather than one at a time. Requires `columns`. This is
 *   the setting for any grid of more than six items: twelve cards cascading individually reads as
 *   a slot machine, and it also blows the choreography budget (see `Reveal`'s notes).
 */
export type RevealStagger = boolean | 'row';

export interface RevealProps
  extends Omit<
    DivProps,
    | 'animation'
    | 'animateOnView'
    | 'animationDelay'
    | 'animationDuration'
    | 'animationEase'
    | 'stagger'
    | 'staggerDelay'
  > {
  /** How the element arrives. Defaults to `'rise'` — a small upward move with a fade. */
  preset?: RevealPreset | undefined;

  /** Offset this element's own start. Defaults to `'none'`. */
  delay?: RevealDelay | undefined;

  /**
   * Cascade direct children instead of revealing them together. The children opt in simply by
   * being `Reveal`s themselves — they need no extra props.
   */
  stagger?: RevealStagger | undefined;

  /** Grid column count. Required by `stagger="row"`, ignored otherwise. */
  columns?: number | undefined;

  /**
   * This element is above the fold: play on mount rather than waiting for a scroll trigger.
   *
   * A separate prop rather than an `animateOnView={false}` escape hatch, because "this is above
   * the fold" is the thing the author actually knows — and it makes the rule (a hero must never
   * scroll-reveal, since the user is already looking at it) mechanical instead of remembered.
   */
  onMount?: boolean | undefined;

  /**
   * Slow this reveal down for a single large element — a hero image, a pull quote. Never use it
   * on anything with siblings: at this duration a staggered group runs past the point where the
   * page feels responsive.
   */
  emphasis?: boolean | undefined;
}
