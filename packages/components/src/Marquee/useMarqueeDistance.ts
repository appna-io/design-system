'use client';

import { useIsomorphicLayoutEffect } from '@apx-ui/engine';
import { useRef, useState, type RefObject } from 'react';

/**
 * Measures how far the track must travel for one seamless cycle: the width (or height) of one
 * content group, plus the gap that sits between the two groups.
 *
 * ## Why this has to be measured
 *
 * The loop's travel distance is the only thing that lets speed be expressed as a *rate* rather
 * than a duration — and a rate is the only unit under which a 6-item band and a 20-item band move
 * at the same visible speed. A fixed seconds-per-cycle makes the long band race, which is the
 * classic marquee bug and the reason marquee tempos drift apart across a site.
 *
 * CSS can't do this alone: deriving a duration from a distance needs a length ÷ length division,
 * which `calc()` does not support.
 *
 * ## Why a ResizeObserver rather than a one-shot measurement
 *
 * The number is wrong at first paint more often than not — web fonts swap in and reflow every
 * text item, images load and change their intrinsic size, and the container's width itself changes
 * on rotate or resize. A one-shot read on mount captures whichever of those hadn't happened yet
 * and leaves the band running at the wrong tempo for the rest of the session.
 *
 * Returns `null` until the first measurement lands, so callers can fall back to a percentage-based
 * approximation for the SSR / pre-measure frame rather than rendering a stopped track.
 */
export function useMarqueeDistance(
  axis: 'horizontal' | 'vertical',
  enabled: boolean,
): { groupRef: RefObject<HTMLDivElement | null>; distance: number | null } {
  const groupRef = useRef<HTMLDivElement | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!enabled) {
      setDistance(null);
      return;
    }

    const group = groupRef.current;
    const track = group?.parentElement;
    if (!group || !track) return;

    const measure = () => {
      const rect = group.getBoundingClientRect();
      const size = axis === 'horizontal' ? rect.width : rect.height;

      // The gap between the two groups is part of the travel distance: the clone has to arrive
      // exactly where the original started, and the original starts one gap after the clone's
      // leading edge. Read from computed style rather than re-deriving it from the `gap` prop, so
      // a consumer overriding the gap through `className` or `sx` is measured correctly too.
      const styles = getComputedStyle(track);
      const gap = parseFloat(axis === 'horizontal' ? styles.columnGap : styles.rowGap) || 0;

      // A zero measurement means the element isn't laid out yet — `display: none`, an unmounted
      // tab panel, a collapsed accordion. Writing 0 would pin the animation at a zero-length
      // travel and the band would sit frozen once revealed, so keep the previous value instead.
      if (size <= 0) return;

      setDistance(size + gap);
    };

    measure();

    if (typeof ResizeObserver === 'undefined') return;

    // Observing the group catches content reflow (fonts, images); observing the track catches
    // container resizes that change wrapping.
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    observer.observe(track);
    return () => observer.disconnect();
  }, [axis, enabled]);

  return { groupRef, distance };
}
