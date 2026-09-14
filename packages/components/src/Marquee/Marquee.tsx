'use client';

import { forwardRef, useReducedMotion } from '@apx-ui/engine';
import { ambientMotion } from '@apx-ui/tokens';
import { useThemedClasses } from '@apx-ui/theme';
import {
  createElement,
  Fragment,
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
} from 'react';

import { fadeMask } from './fadeMask';
import { useMarqueeDistance } from './useMarqueeDistance';
import {
  marqueeGroupRecipe,
  marqueeRootRecipe,
  marqueeTrackRecipe,
} from './Marquee.recipe';
import type { MarqueeDirection, MarqueeProps } from './Marquee.types';

/**
 * The travel distance assumed for the first frame, before the real measurement lands.
 *
 * `50%` of the track is one group plus half a gap — half a gap short of the true seam, so the
 * fallback frame is very slightly off. That is the correct trade: it is one frame of imprecision
 * on a 40-second loop, against the alternative of rendering a visibly stopped band during SSR and
 * hydration.
 */
const PRE_MEASURE_DISTANCE = '50%';

/** Reference track length the `ambientMotion.speed` rates were tuned against. */
const REFERENCE_TRACK_PX = 1440;

/** Which directions run the keyframe backwards. */
const REVERSED: Record<MarqueeDirection, boolean> = {
  left: false,
  right: true,
  up: false,
  down: true,
};

function axisFor(direction: MarqueeDirection): 'horizontal' | 'vertical' {
  return direction === 'up' || direction === 'down' ? 'vertical' : 'horizontal';
}

/**
 * `<Marquee />` — a continuously scrolling band.
 *
 * The canonical use is a logo ticker, but it is the same primitive behind category rails,
 * "as seen in" strips, and testimonial ribbons. It is pure CSS: the track renders its children
 * twice and translates by one copy on a `linear infinite` keyframe, so there is no frame loop, no
 * scroll listener, and no per-frame layout work — a marquee costs the same whether it's onscreen
 * or three sections down.
 *
 * ## Reduced motion
 *
 * Under `prefers-reduced-motion: reduce` this does **not** simply stop animating. A stopped
 * marquee is a trap: the items past the container edge become unreachable, so the content is
 * worse than if it had never scrolled. Instead the component drops the `aria-hidden` clone and
 * turns the container into a native scroll region — every item is still reachable by wheel, drag,
 * and keyboard, and nothing moves on its own. That difference is the reason the reduced-motion
 * branch changes the markup and not just a class.
 *
 * ## Accessibility
 *
 * The duplicate copy carries `aria-hidden` so assistive tech reads each item exactly once. The
 * root is not given a `role`; it is a presentational band, and the semantics belong to whatever
 * the consumer puts inside it (a `<ul>` of logos, a list of links).
 *
 * @example
 *   <Marquee speed="slow" fade gap={12}>
 *     {logos.map((l) => <BrandLogo key={l.id} {...l} />)}
 *   </Marquee>
 *
 * @example  // interactive items — pause so they can be clicked
 *   <Marquee pauseOnHover direction="right" repeat={2}>
 *     {tags.map((t) => <Badge key={t}>{t}</Badge>)}
 *   </Marquee>
 */
function MarqueeImpl(props: MarqueeProps, ref: ForwardedRef<HTMLElement>): ReactElement {
  const {
    children,
    direction = 'left',
    speed = 'normal',
    duration,
    pauseOnHover = false,
    repeat = 1,
    gap = 8,
    fade = true,
    // Capped in absolute terms as well as relative — see the prop's note. 12% of a 360px band is
    // 43px per edge, which crops the first item rather than softening it.
    fadeWidth = 'min(12%, 48px)',
    reduceMotion,
    as = 'div',
    className,
    style,
    sx,
    ...rest
  } = props;

  const reduced = useReducedMotion(reduceMotion);
  const axis = axisFor(direction);
  const gapKey = String(gap);

  // Measured, not derived from the prop count: it's the only way `speed` can be a RATE. See
  // `useMarqueeDistance` for why a seconds-per-cycle duration is the wrong unit here.
  const { groupRef, distance } = useMarqueeDistance(axis, !reduced);

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: marqueeRootRecipe,
    componentName: 'Marquee',
    slot: 'root',
    props: { reduced: String(reduced), axis, className, sx, style },
  });

  const { className: trackClass } = useThemedClasses({
    recipe: marqueeTrackRecipe,
    componentName: 'Marquee',
    slot: 'track',
    props: {
      axis,
      gap: gapKey,
      reverse: String(REVERSED[direction]),
      pauseOnHover: String(pauseOnHover && !reduced),
      running: String(!reduced),
    },
  });

  const { className: groupClass } = useThemedClasses({
    recipe: marqueeGroupRecipe,
    componentName: 'Marquee',
    slot: 'group',
    props: { axis, gap: gapKey },
  });

  // `repeat` renders the children N times as siblings INSIDE one group, not as N nested groups.
  // That keeps every item a direct flex child of the group, so the `gap-*` rhythm is identical
  // everywhere — between two items of one copy and across the join between copies — and both
  // groups stay exactly equal in size, which is the invariant the `-50%` seam depends on.
  const copyCount = Math.max(1, Math.trunc(repeat));

  const groupChildren = Array.from({ length: copyCount }, (_, i) => (
    <Fragment key={i}>{children}</Fragment>
  ));

  // Seconds for one cycle = distance ÷ rate. Until the measurement lands we substitute the
  // reference track the rates were tuned against, so the first frame runs at the intended tempo
  // for a typical band rather than at some arbitrary fallback.
  const pixelsPerSecond = ambientMotion.speed[speed];
  const travelPx = distance ?? REFERENCE_TRACK_PX;
  const seconds = duration ?? travelPx / pixelsPerSecond;

  const trackStyle: CSSProperties = {
    // The exact travel for one cycle, consumed by the `marquee-x` / `marquee-y` keyframes. A
    // measured pixel distance rather than a percentage: it lands precisely on the seam, where a
    // percentage has to be corrected for the inter-group gap and is only ever approximately right.
    ['--sds-marquee-distance' as string]: distance !== null ? `${distance}px` : PRE_MEASURE_DISTANCE,
    animationDuration: `${seconds.toFixed(2)}s`,
  };

  const composedRootStyle: CSSProperties | undefined =
    fade && !reduced
      ? { ...fadeMask(axis, fadeWidth), ...(rootStyle ?? {}) }
      : (rootStyle ?? undefined);

  return createElement(
    as,
    {
      ref,
      // `group/marquee` is the named scope the track's pause classes target. It is present
      // whenever the track is animating — not only when `pauseOnHover` is set — because the
      // focus pause rides on it and that one is unconditional (see the recipe).
      //
      // Named rather than a bare `group` so a Marquee nested inside a consumer's own `group` — a
      // card that lifts on hover, say — reacts to its own band and not to that outer hover.
      className: reduced ? rootClass : `group/marquee ${rootClass}`,
      style: composedRootStyle,
      'data-marquee-root': '',
      'data-direction': direction,
      'data-reduced': reduced ? 'true' : undefined,
      ...rest,
    },
    <div className={trackClass} style={reduced ? undefined : trackStyle} data-marquee-track>
      <div ref={groupRef} className={groupClass} data-marquee-group>
        {groupChildren}
      </div>
      {/*
        The loop copy. `inert` — not just `aria-hidden` — because the clone's contents are often
        links or buttons: `aria-hidden` alone leaves them focusable, so a keyboard user tabs into
        a duplicate set of controls that are mid-flight toward the container edge, and the focus
        ring travels off-screen with them. `inert` removes them from the a11y tree AND the tab
        order in one attribute.

        Omitted entirely in the reduced-motion branch: there is no loop to seed there, so a
        second copy would just be the same content listed twice inside a scroll region.
      */}
      {!reduced ? (
        <div inert className={groupClass} data-marquee-clone>
          {groupChildren.map((_, i) => (
            <Fragment key={i}>{children}</Fragment>
          ))}
        </div>
      ) : null}
    </div>,
  );
}

export const Marquee = forwardRef<HTMLElement, MarqueeProps>(MarqueeImpl, 'Marquee');
