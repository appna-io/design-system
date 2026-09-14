import { forwardRef, warn } from '@apx-ui/engine';

import { Div } from '../Div';
import type { RevealDelay, RevealPreset, RevealProps } from './Reveal.types';

/**
 * `<Reveal />` — scroll-reveal with the design language's choreography already applied.
 *
 * `Div` supplies the mechanism (viewport trigger, variant orchestration, reduced-motion gate).
 * This supplies the *judgement*: which preset, how long, how far apart, when to fire. Those are
 * design decisions, and the moment they live at the call site every template invents its own —
 * which is exactly what happened before this existed, in five different templates.
 *
 * So the rule this component encodes is: **a template author should never be able to type a
 * number that encodes design.** There is no `distance`, no stagger interval, no easing name and
 * no duration in milliseconds anywhere in the API. Every knob is a named intent.
 *
 * ```tsx
 * <Reveal />                            // the default: rise, on scroll, once
 * <Reveal preset="blur" emphasis />     // one large element
 * <Reveal stagger>…</Reveal>            // children cascade
 * <Reveal stagger="row" columns={3}>…</Reveal>   // a grid cascades by row
 * <Reveal onMount stagger>…</Reveal>    // above the fold: plays immediately
 * ```
 *
 * ## The choreography budget
 *
 * A section's reveal has to finish within about a second of its trigger, or the page feels like
 * it is waiting on itself:
 *
 * ```
 * duration + stagger x (count - 1) <= ~1000ms
 * ```
 *
 * That single rule sets three of the defaults below. `slower` (500ms) is the house duration
 * because it survives a staggered group and `deliberate` (700ms) does not — which is why
 * `emphasis` is documented as single-element-only. And it is the real reason for `stagger="row"`:
 * a twelve-item grid at the house interval finishes at 500 + 80x11 = 1380ms, comfortably over.
 *
 * ## How `stagger="row"` works
 *
 * It does **not** restructure the DOM into rows. It divides the house interval by the column
 * count, so consecutive items in a row start a fraction apart while each new row starts a full
 * interval after the last. Three columns at 80ms gives a 27ms intra-row sweep and 80ms between
 * rows — the cascade reads by row, and the arithmetic keeps the whole grid inside the budget no
 * matter how many items it holds.
 *
 * ## Reduced motion
 *
 * Inherited from `Div`, which short-circuits to a plain element. Children render fully visible
 * and final — never stuck at `opacity: 0`, which is the failure mode that matters most here: a
 * scroll-reveal that fails closed is a blank page for the users who most need it not to be.
 */

/** Preset intent → the `Div` animation preset that expresses it. */
const PRESET_TO_ANIMATION = {
  rise: 'riseIn',
  fade: 'fadeIn',
  blur: 'blurIn',
  zoom: 'zoomIn',
  left: 'slideInFromLeft',
  right: 'slideInFromRight',
} as const satisfies Record<RevealPreset, string>;

/** Named delay steps, in seconds. Short enough to feel deliberate, not enough to feel broken. */
const DELAY_SECONDS = {
  none: undefined,
  short: 0.1,
  medium: 0.2,
} as const satisfies Record<RevealDelay, number | undefined>;

/**
 * Seconds between siblings. Below ~0.05 a cascade reads as one blob; above ~0.12 it reads as the
 * page being slow. 0.08 is the middle of that window and it is the only stagger value the
 * gallery uses.
 */
const HOUSE_STAGGER = 0.08;

export const Reveal = forwardRef<HTMLElement, RevealProps>(function Reveal(props, ref) {
  const {
    preset = 'rise',
    delay = 'none',
    stagger,
    columns,
    onMount = false,
    emphasis = false,
    children,
    ...rest
  } = props;

  warn(
    !(stagger === 'row' && (columns === undefined || columns < 1)),
    'Reveal: `stagger="row"` needs `columns` to know where the rows break — without it there is no row to cascade by. Pass the grid\'s column count, or use `stagger` for a plain one-at-a-time cascade.',
  );

  const orchestrates = stagger !== undefined && stagger !== false;

  // Row cascade: dividing the interval by the column count makes each *row* start one full
  // interval after the last, while items inside a row sweep a fraction apart.
  const staggerSeconds = orchestrates
    ? stagger === 'row' && columns && columns > 0
      ? HOUSE_STAGGER / columns
      : HOUSE_STAGGER
    : undefined;

  return (
    <Div
      ref={ref}
      // A parent that only orchestrates has no animation of its own — it exists to time its
      // children. One that reveals itself carries the preset.
      {...(orchestrates ? {} : { animation: PRESET_TO_ANIMATION[preset] })}
      {...(onMount ? {} : { animateOnView: true })}
      animationDuration={emphasis ? 'deliberate' : 'slower'}
      // `zoom` is an arrival, so it takes the overshoot curve. Everything else settles on the
      // long-tail decelerate, which is what stops a 500ms move ending abruptly.
      animationEase={preset === 'zoom' && !orchestrates ? 'expressive' : 'soft'}
      {...(DELAY_SECONDS[delay] !== undefined ? { animationDelay: DELAY_SECONDS[delay] } : {})}
      {...(staggerSeconds !== undefined ? { stagger: staggerSeconds } : {})}
      {...rest}
    >
      {children}
    </Div>
  );
}, 'Reveal');
