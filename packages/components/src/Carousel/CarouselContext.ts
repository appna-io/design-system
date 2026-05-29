'use client';

import { createContext, useContext } from 'react';

import type { CarouselContextValue } from './Carousel.types';

/**
 * Context that `<Carousel>` publishes for all its subparts. `null` is the deliberate default —
 * subparts called outside the root throw a clear error so misuse surfaces immediately.
 */
export const CarouselContext = createContext<CarouselContextValue | null>(null);
CarouselContext.displayName = 'CarouselContext';

/**
 * Returns the current `CarouselContext`. Throws if called outside `<Carousel>`. Pass the calling
 * component's display name (`'Carousel.Slide'`, `'Carousel.PrevButton'`, …) for clearer errors.
 */
export function useCarouselContext(componentName: string): CarouselContextValue {
  const ctx = useContext(CarouselContext);
  if (!ctx) {
    throw new Error(`<${componentName}> must be rendered inside <Carousel>.`);
  }
  return ctx;
}
