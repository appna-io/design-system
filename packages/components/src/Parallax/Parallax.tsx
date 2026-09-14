'use client';

import { forwardRef, mergeRefs, useScrollProgress, warn } from '@apx-ui/engine';
import { createElement, useRef, type CSSProperties, type ElementType } from 'react';

import type { ParallaxProps } from './Parallax.types';

/**
 * The hard ceiling on drift, as a fraction of the layer's travel through the viewport.
 *
 * Enforced rather than documented. A documented limit is a limit until the first template that
 * wants "just a bit more", and parallax is the effect where "a bit more" is the whole difference
 * between a page that feels deep and one that feels cheap — the layer starts visibly disagreeing
 * with the scroll gesture. It is also a vestibular trigger for people who would never think to
 * enable `prefers-reduced-motion`, so the ceiling is an accessibility bound as much as a
 * taste one.
 */
const MAX_SPEED = 0.1;

function clampSpeed(speed: number): number {
  if (!Number.isFinite(speed)) return 0;
  return Math.max(-MAX_SPEED, Math.min(MAX_SPEED, speed));
}

/**
 * `<Parallax />` — a scroll-linked layer that drifts against (or with) the scroll.
 *
 * ## For backgrounds, not for content
 *
 * Wrap the atmosphere: a hero backdrop, a decorative image, a gradient wash. **Never body copy or
 * a heading.** Text that moves at a different rate from the surface it sits on is hard to read
 * while scrolling and is the clearest tell of a template that reached for an effect instead of a
 * design.
 *
 * ## Reduced motion
 *
 * `useScrollProgress` freezes at its midpoint under `prefers-reduced-motion`, so the offset here
 * resolves to exactly `0` — the layer renders in its neutral position and no scroll listener is
 * ever attached. Note this is why the hook's frozen value is `0.5` and not `0`: `0` is one *end*
 * of the range, and would have parked every backdrop at maximum displacement.
 *
 * @example
 *   <Div className="relative overflow-hidden">
 *     <Parallax speed={-0.08}>
 *       <Image src="/hero.jpg" alt="" />
 *     </Parallax>
 *     <Div className="relative">…copy, which does NOT move…</Div>
 *   </Div>
 */
export const Parallax = forwardRef<HTMLElement, ParallaxProps>(function Parallax(props, ref) {
  const {
    children,
    speed = -0.06,
    reduceMotion,
    as = 'div',
    className,
    style,
    sx,
    ...rest
  } = props;

  const innerRef = useRef<HTMLElement | null>(null);

  if (process.env.NODE_ENV !== 'production') {
    // Two different mistakes, so two different messages — telling someone their NaN was "clamped
    // to ±0.1" sends them looking for a range problem they don't have.
    warn(
      Number.isFinite(speed),
      `Parallax: \`speed\` must be a finite number; received ${String(speed)}. Falling back to no drift.`,
      'PARALLAX_SPEED_INVALID',
    );
    warn(
      !Number.isFinite(speed) || Math.abs(speed) <= MAX_SPEED,
      `Parallax: \`speed\` is clamped to ±${MAX_SPEED}; received ${speed}. Larger drift makes the layer visibly disagree with the scroll and is a vestibular trigger above the reduced-motion threshold. If the effect isn't reading strongly enough, the layer needs more contrast with what's behind it — not more travel.`,
      'PARALLAX_SPEED_CLAMPED',
    );
  }

  const progress = useScrollProgress(innerRef, { reduceMotion });

  // `progress - 0.5` centres the range on the element's midpoint, so the layer sits at its
  // authored position when centred and drifts symmetrically either side. Anchoring at 0 instead
  // would mean the layer is only ever in the right place at one edge of its pass.
  const offset = (progress - 0.5) * clampSpeed(speed) * 100;

  const composed: CSSProperties = {
    ...(sx ? {} : {}),
    ...(style ?? {}),
    transform: offset === 0 ? undefined : `translate3d(0, ${offset.toFixed(2)}%, 0)`,
    ...(offset === 0 ? {} : { willChange: 'transform' }),
  };

  return createElement(
    as as ElementType,
    {
      ref: mergeRefs(innerRef, ref),
      className,
      style: composed,
      'data-parallax': '',
      ...rest,
    },
    children,
  );
}, 'Parallax');
