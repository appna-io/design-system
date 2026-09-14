'use client';

import {
  toMotionEase,
  transitionTokens,
  useIsomorphicLayoutEffect,
  useReducedMotion,
  type CubicBezierPoints,
} from '@apx-ui/engine';
import { animate, inView, useMotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/**
 * Seconds a count-up runs for.
 *
 * Not one of the `motion.duration` tokens, and deliberately so. That scale tops out at
 * `deliberate: 700ms`, which is a *choreography budget* — how long a section may take to finish
 * arriving. A count-up isn't arriving, it's being **read**: the digits have to change slowly
 * enough that a viewer registers the number moving rather than seeing a blur resolve. Below about
 * a second that doesn't happen and the effect is wasted; much above 1.5s the viewer has finished
 * reading and is waiting on it.
 *
 * Kept local rather than added to the shared scale because exactly one component needs it. If a
 * second one ever does, that's the moment it becomes a token.
 */
const COUNT_UP_SECONDS = 1.2;

/**
 * The DS's long-tail decelerate, in the tuple form Motion accepts.
 *
 * `toMotionEase` is typed `string | CubicBezierPoints` because a token *could* be one of Motion's
 * named easings rather than a `cubic-bezier()` string. Motion's own `Easing` type only admits its
 * specific named strings, so the union isn't assignable — narrowing with `Array.isArray` is what
 * makes this typecheck without a cast that would paper over a genuinely wrong value.
 *
 * `undefined` on the non-tuple branch is deliberate: Motion falls back to its own default curve.
 * The count still runs, just on a slightly different easing — which is the right failure for a
 * token that changed shape, given the alternative (#1's finding) is Motion throwing at runtime.
 */
const softEase: CubicBezierPoints | undefined = (() => {
  const resolved = toMotionEase(transitionTokens.ease.soft);
  return Array.isArray(resolved) ? resolved : undefined;
})();

/**
 * Drives a number from a start value to its target once the element enters the viewport.
 *
 * ## Why it fires once
 *
 * A stat that re-counts every time you scroll back past it is a distraction rather than a
 * delight — the same reason `defaultViewport.once` is `true` for reveals. The observer is
 * disconnected the moment it fires, so scrolling away and back leaves the final value in place.
 *
 * ## Why the animation is Motion's and not a hand-rolled rAF loop
 *
 * The easing is the whole effect. A linear count reads as a slot machine; the decelerating curve
 * is what makes it read as a value settling. Motion already owns curve evaluation and frame
 * scheduling, and `toMotionEase` already converts the DS's CSS easing tokens into the tuple form
 * Motion needs — re-implementing a cubic-bezier solver here would be a second, drifting copy of
 * something the engine has.
 *
 * ## Reduced motion
 *
 * Returns the target immediately and never observes anything. Note this is the *correct* failure
 * mode in both directions: the number is a fact, so unlike a reveal there is nothing to un-hide,
 * and unlike a decorative loop there is nothing lost by skipping it.
 */
export function useCountUp(
  target: number,
  enabled: boolean,
): { ref: (node: HTMLElement | null) => void; value: number; done: boolean } {
  const reduced = useReducedMotion();
  const active = enabled && !reduced && Number.isFinite(target);

  // Seeded with the TARGET, not with zero — this is the value the server renders.
  //
  // Starting at zero meant the SSR'd HTML said "0 Talks": a crawler indexed a zero, a reader with
  // JS disabled saw a zero permanently, and everyone else got a flash of zeros above the fold
  // before hydration replaced them. A count-up is decoration on top of a fact; the markup has to
  // carry the fact, and the decoration is what the client adds.
  const [value, setValue] = useState(target);
  const [node, setNode] = useState<HTMLElement | null>(null);
  const progress = useMotionValue(0);

  // Held in a ref so a re-render mid-count (a sibling updating, a theme switch) doesn't restart
  // the animation from zero — which would look like the stat glitching.
  const started = useRef(false);

  // Drop to zero on the client BEFORE the first paint, so there is no flash of the final value
  // between hydration and the count starting. A layout effect is load-bearing here: in a plain
  // `useEffect` the browser paints the target first and the number visibly snaps back to zero.
  // On the server this is inert, which is exactly what leaves the real number in the HTML.
  useIsomorphicLayoutEffect(() => {
    if (!active || started.current) return;
    if (typeof IntersectionObserver === 'undefined') return;
    setValue(0);
  }, [active]);

  useEffect(() => {
    if (!active) {
      setValue(target);
      return;
    }
    if (!node || started.current) return;

    // No IntersectionObserver (jsdom, very old browsers): show the real number rather than a
    // permanent zero. A count-up that never triggers must fail to the FACT, not to the animation's
    // start frame — the same rule #1 established for reveals, and for the same reason.
    if (typeof IntersectionObserver === 'undefined') {
      setValue(target);
      return;
    }

    // A holder rather than a bare `let`, because the callback below needs to call the stop
    // function that `inView` is in the middle of returning. IntersectionObserver callbacks are
    // asynchronous so a `const` would in practice be initialised by then — but relying on that is
    // relying on a scheduling detail, and this costs one object.
    const observer: { stop?: () => void } = {};
    let unsubscribe: (() => void) | undefined;
    let controls: { stop: () => void } | undefined;

    observer.stop = inView(
      node,
      () => {
        // `inView` fires its callback on EVERY entry, not just the first — scrolling away and
        // back re-enters. Without this guard the number counts again from zero each time, which
        // is precisely the "re-counts on scroll-back" behaviour the once-only rule forbids.
        if (started.current) return;
        started.current = true;

        // Animating a MotionValue rather than a bare number: it is the overload Motion types
        // cleanly, and it keeps the tween off React's render path — the subscription writes to
        // state at Motion's step rate instead of the tween itself living inside `setState`.
        progress.set(0);
        unsubscribe = progress.on('change', setValue);
        controls = animate(progress, target, {
          duration: COUNT_UP_SECONDS,
          // Spread rather than `ease: softEase` — the workspace runs
          // `exactOptionalPropertyTypes`, under which an optional `ease?: Easing` rejects an
          // explicit `undefined`. Omitting the key entirely is also the semantics we want: let
          // Motion pick its own default rather than telling it "no easing".
          ...(softEase ? { ease: softEase } : {}),
        });

        // Stop watching the moment it has fired. Nothing else can trigger it now, and it keeps
        // the observer off the scroll path for the rest of the page's life.
        observer.stop?.();

        // NOTE: deliberately no cleanup returned here. `inView` treats a returned function as an
        // on-exit callback, so stopping the tween there would cancel a count mid-flight whenever
        // the user scrolls past quickly — freezing the stat on an arbitrary intermediate number
        // like `$11,084.55` and, because `started` is already set, never correcting it. A count
        // that has begun must be allowed to finish.
      },
      { amount: 0.4 },
    );

    return () => {
      observer.stop?.();
      controls?.stop();
      unsubscribe?.();
    };
  }, [active, node, target, progress]);

  return { ref: setNode, value, done: !active || started.current };
}
