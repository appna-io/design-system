'use client';

import { useCallback, type KeyboardEvent } from 'react';

import type { CarouselContextValue, CarouselOrientation } from './Carousel.types';

export interface UseCarouselKeyboardOptions {
  orientation: CarouselOrientation;
  /** Reading direction — flips arrow semantics in RTL. */
  isRtl: boolean;
  /** Slide index controls. */
  goTo: CarouselContextValue['goTo'];
  next: CarouselContextValue['next'];
  prev: CarouselContextValue['prev'];
  slideCount: number;
  /** When autoplay is enabled, Space toggles user pause/play. */
  autoplayEnabled: boolean;
  toggleAutoplay: () => void;
}

/**
 * Returns a `KeyboardEventHandler` for the Viewport that implements the W3C APG Carousel
 * keyboard pattern: ArrowLeft / ArrowRight (or ArrowUp / ArrowDown for vertical), Home, End,
 * PageUp / PageDown, and Space (toggle autoplay when enabled).
 *
 * `event.preventDefault()` is called on handled keys to prevent the parent page from scrolling.
 * Unhandled keys bubble up unchanged.
 */
export function useCarouselKeyboard(options: UseCarouselKeyboardOptions) {
  const {
    orientation,
    isRtl,
    goTo,
    next,
    prev,
    slideCount,
    autoplayEnabled,
    toggleAutoplay,
  } = options;

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.defaultPrevented) return;
      const key = event.key;

      const handlePrev = () => {
        prev('keyboard');
        event.preventDefault();
      };
      const handleNext = () => {
        next('keyboard');
        event.preventDefault();
      };

      if (orientation === 'horizontal') {
        if (key === 'ArrowLeft') {
          if (isRtl) handleNext();
          else handlePrev();
          return;
        }
        if (key === 'ArrowRight') {
          if (isRtl) handlePrev();
          else handleNext();
          return;
        }
      } else {
        if (key === 'ArrowUp') {
          handlePrev();
          return;
        }
        if (key === 'ArrowDown') {
          handleNext();
          return;
        }
      }

      if (key === 'PageUp') {
        handlePrev();
        return;
      }
      if (key === 'PageDown') {
        handleNext();
        return;
      }
      if (key === 'Home') {
        goTo(0, 'keyboard');
        event.preventDefault();
        return;
      }
      if (key === 'End') {
        goTo(Math.max(0, slideCount - 1), 'keyboard');
        event.preventDefault();
        return;
      }
      if (key === ' ' && autoplayEnabled) {
        toggleAutoplay();
        event.preventDefault();
        return;
      }
    },
    [orientation, isRtl, goTo, next, prev, slideCount, autoplayEnabled, toggleAutoplay],
  );
}