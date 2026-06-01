'use client';

import { useEffect, useRef } from 'react';

export interface UseCarouselScrollOptions {
  viewportRef: React.RefObject<HTMLElement | null>;
  /** Ref to each slide element; subscribed via IntersectionObserver. */
  slideRefs: React.MutableRefObject<Array<HTMLElement | null>>;
  /** Called whenever the most-visible slide changes. */
  onIndexChange: (index: number) => void;
  /** Slide count (used to size the observer's bookkeeping). */
  slideCount: number;
  /** Disables observation (e.g. while suppressing scroll events during programmatic scroll). */
  enabled: boolean;
}

const THRESHOLDS = [0.25, 0.5, 0.75, 1];

/**
 * Tracks the active slide index via `IntersectionObserver`. The slide with the highest
 * intersection ratio is the active slide. RAF-throttled so rapid scroll events coalesce into a
 * single index update per frame.
 *
 * jsdom doesn't ship IntersectionObserver — we no-op there and let tests drive `onIndexChange`
 * manually via programmatic scrolls + the imperative ref.
 */
export function useCarouselScroll(options: UseCarouselScrollOptions): void {
  const { viewportRef, slideRefs, onIndexChange, slideCount, enabled } = options;

  const ratiosRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastIndexRef = useRef<number>(-1);
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  });

  useEffect(() => {
    ratiosRef.current = new Array(slideCount).fill(0);
    lastIndexRef.current = -1;
  }, [slideCount]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    if (typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
      return undefined;
    }

    const ratios = ratiosRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!enabledRef.current) return;
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const indexAttr = target.getAttribute('data-carousel-slide-index');
          if (indexAttr == null) continue;
          const idx = Number(indexAttr);
          if (!Number.isFinite(idx) || idx < 0 || idx >= ratios.length) continue;
          ratios[idx] = entry.intersectionRatio;
        }

        if (rafRef.current != null) return;
        const requestFrame = window.requestAnimationFrame ?? ((cb: FrameRequestCallback) => setTimeout(cb, 16));
        rafRef.current = requestFrame(() => {
          rafRef.current = null;
          let bestIndex = 0;
          let bestRatio = -1;
          for (let i = 0; i < ratios.length; i++) {
            const r = ratios[i] ?? 0;
            if (r > bestRatio) {
              bestRatio = r;
              bestIndex = i;
            }
          }
          if (bestRatio > 0 && bestIndex !== lastIndexRef.current) {
            lastIndexRef.current = bestIndex;
            onIndexChange(bestIndex);
          }
        });
      },
      {
        root: viewport,
        threshold: THRESHOLDS,
      },
    );

    const slides = slideRefs.current;
    for (const slide of slides) {
      if (slide) observer.observe(slide);
    }

    return () => {
      observer.disconnect();
      if (rafRef.current != null) {
        const cancelFrame = window.cancelAnimationFrame ?? clearTimeout;
        cancelFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [viewportRef, slideRefs, slideCount, onIndexChange]);
}