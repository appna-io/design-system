import type { MotionShape } from '@apx-ui/engine';

/**
 * Motion tokens consumed by both CSS and Motion (the JS lib). Durations are stored in **milliseconds**
 * for direct use in CSS `transition-duration`. The engine's `transitionTokens` keeps the same names
 * but uses seconds for Motion's `transition.duration` field — both are derived from these numbers.
 */
export const motion: MotionShape = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
    // `slower` and `deliberate` are the *reveal* end of the scale, and they exist because the
    // three above are interaction timings. 150–300ms is how long a thing you are already looking
    // at should take to acknowledge you; a section entering the viewport is a different event and
    // reads as twitchy at that speed. 500ms is the house default for a scroll reveal and 700ms is
    // for a single large element (a hero image, a pull quote) that can carry the extra weight.
    //
    // The upper bound is a choreography budget, not taste: a section's reveal should finish
    // within ~1s of its trigger, so `duration + stagger x (count - 1) <= ~1000ms`. `deliberate`
    // plus a staggered grid blows that, which is why `slower` — not `deliberate` — is the default
    // for anything with siblings.
    slower: 500,
    deliberate: 700,
  },
  ease: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    /**
     * Overshoot. Crosses 1 on the way (y2 = 1.56) and settles back, which is what makes an
     * entrance read as arriving rather than sliding to a stop. Reserve it for reveals — an
     * overshoot on a button hover reads as a wobble, not as character.
     */
    expressive: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    /**
     * Long-tail decelerate. Covers most of the distance early then coasts, so a large element
     * settles without the abrupt arrival `decelerate` gives at reveal durations. This is the
     * curve for `deliberate`-length motion.
     */
    soft: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  reduceMotion: 'system',
};
/**
 * Ambient motion — the scale for animation that never resolves.
 *
 * Deliberately separate from `motion.duration` above. Those are 150–300**ms**: interaction
 * timings for something that starts, finishes and stops while you watch it. A logo ticker's cycle
 * is 20–60 **seconds**, and resolving a marquee's `speed="slow"` against the 300ms token gives a
 * strobe. They are different quantities and sharing one scale would only make that mistake easy
 * to write.
 *
 * ## Why px-per-second and not seconds-per-cycle
 *
 * Seconds-per-cycle is the intuitive unit and the wrong one: a 6-logo band and a 20-logo band
 * given the same cycle duration travel at *visibly different speeds*, because the longer track has
 * to cover three times the distance in the same time. Consumers then hand-tune a duration per
 * band, the tempo diverges across the site, and the token has bought nothing.
 *
 * A px-per-second rate is content-independent — every band on the site moves at the same physical
 * speed regardless of how many items it holds — so it's the quantity that can meaningfully be a
 * token. Components derive their own duration by measuring the track.
 *
 * The three values are the seconds-per-cycle tempos the design language calls for (60s / 40s /
 * 25s) evaluated at a 1440px reference track, then rounded.
 */
export const ambientMotion = {
  /** Travel rate in CSS pixels per second. */
  speed: {
    slow: 24,
    normal: 36,
    fast: 58,
  },
} as const;

/** Named ambient travel rates. */
export type AmbientSpeedToken = keyof typeof ambientMotion.speed;
