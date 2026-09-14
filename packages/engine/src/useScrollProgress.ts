'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

import { useReducedMotion } from './motion';

/**
 * How far through its pass across the viewport an element is, as `0` → `1`.
 *
 * `0` is the moment the element's top reaches the bottom of the viewport (it is about to enter);
 * `1` is the moment its bottom leaves the top (it has fully passed). The midpoint is the element
 * centred. This is the range every scroll-linked effect actually wants — a page-level scroll
 * fraction is the wrong frame of reference for a section that occupies a fifth of the document.
 */
export interface ScrollProgressOptions {
  /**
   * Force the reduced-motion result on (`true`) or off (`false`), bypassing the media query.
   * Mirrors `useReducedMotion(forceValue)`; exists for tests and side-by-side documentation.
   */
  reduceMotion?: boolean | undefined;
}

/**
 * Tracks an element's progress through the viewport for scroll-linked effects.
 *
 * ## Reduced motion returns a frozen midpoint, not zero
 *
 * Under `prefers-reduced-motion: reduce` this returns a constant `0.5` and never listens to
 * scroll. `0.5` rather than `0` because consumers map this value onto an offset — a parallax
 * translate, a scrub position — and `0` is one *end* of that range, i.e. the most extreme
 * displacement. Returning `0` would leave a backdrop parked at its maximum offset forever, which
 * looks like a layout bug rather than like motion being switched off. `0.5` is the neutral,
 * centred frame: the state the effect passes through, and the one that reads as "no effect
 * applied".
 *
 * ## Why `scroll` + rAF and not IntersectionObserver
 *
 * `IntersectionObserver` reports *threshold crossings*, not a continuous position, so a smooth
 * scrub needs either an impractical number of thresholds or a scroll listener anyway. The
 * listener here is passive and coalesced into a single `requestAnimationFrame` per frame, so N
 * elements on a page cost N `getBoundingClientRect()` reads per frame and nothing else — no
 * layout thrash, because the hook only ever reads.
 *
 * @example
 *   const ref = useRef<HTMLDivElement>(null);
 *   const progress = useScrollProgress(ref);
 *   <Div ref={ref} style={{ transform: `translateY(${(progress - 0.5) * 40}px)` }} />
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  options: ScrollProgressOptions = {},
): number {
  const reduced = useReducedMotion(options.reduceMotion);
  const [progress, setProgress] = useState(0.5);
  const frame = useRef<number | null>(null);
  const pending = useRef(false);

  useEffect(() => {
    if (reduced) {
      setProgress(0.5);
      return;
    }

    const element = ref.current;
    if (!element || typeof window === 'undefined') return;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight || 0;

      // Total distance the element travels from "top edge at the viewport bottom" to "bottom edge
      // at the viewport top". Guarding against zero keeps an unlaid-out or zero-height element
      // from producing Infinity.
      const span = viewport + rect.height;
      if (span <= 0) return;

      const travelled = viewport - rect.top;
      const next = travelled / span;
      setProgress(next < 0 ? 0 : next > 1 ? 1 : next);
    };

    // Coalesce every scroll/resize event in a frame into one measurement. Without this a fast
    // scroll fires the handler many times per frame and every one of them does a layout read.
    // The "already scheduled" guard is a boolean set BEFORE the rAF call, not the frame id
    // returned by it. With the id, the guard depends on `frame.current = requestAnimationFrame(…)`
    // assigning before the callback runs — true in a browser, where rAF is async, and false the
    // moment anything runs it synchronously. In that case `measure` clears the id first and the
    // assignment then puts it back, so every later `schedule()` early-returns and the listener
    // goes permanently deaf. A flag cleared by the callback is correct either way.
    const schedule = () => {
      if (pending.current) return;
      pending.current = true;
      frame.current = requestAnimationFrame(() => {
        pending.current = false;
        measure();
      });
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      pending.current = false;
    };
  }, [ref, reduced]);

  return progress;
}
