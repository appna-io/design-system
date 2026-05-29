/**
 * Compound assembly for `<Carousel>`. Same `Object.assign(root, { …subparts })` shape Card,
 * Tabs, Breadcrumbs, Stepper, Menu, Field, etc. use.
 */
import {
  CarouselAutoplayControl,
  CarouselControls,
  CarouselIndicator,
  CarouselIndicators,
  CarouselLiveRegion,
  CarouselNextButton,
  CarouselPrevButton,
  CarouselRoot,
  CarouselSlide,
  CarouselTrack,
  CarouselViewport,
} from './Carousel';

export const Carousel = Object.assign(CarouselRoot, {
  Viewport: CarouselViewport,
  Track: CarouselTrack,
  Slide: CarouselSlide,
  PrevButton: CarouselPrevButton,
  NextButton: CarouselNextButton,
  Controls: CarouselControls,
  Indicators: CarouselIndicators,
  Indicator: CarouselIndicator,
  AutoplayControl: CarouselAutoplayControl,
  LiveRegion: CarouselLiveRegion,
});

export { CarouselContext, useCarouselContext } from './CarouselContext';
export { clampIndex, computeSlideStep, computeSlideTarget } from './computeSlideStep';

export type {
  CarouselAlign,
  CarouselAutoplayControlProps,
  CarouselAutoplayDirection,
  CarouselBaseProps,
  CarouselButtonProps,
  CarouselChangeSource,
  CarouselContextValue,
  CarouselControlsProps,
  CarouselIndicatorProps,
  CarouselIndicatorVariant,
  CarouselIndicatorsProps,
  CarouselLivePoliteness,
  CarouselLiveRegionProps,
  CarouselOrientation,
  CarouselProps,
  CarouselRef,
  CarouselShowMode,
  CarouselSize,
  CarouselSlideProps,
  CarouselSnap,
  CarouselTrackProps,
  CarouselVariant,
  CarouselViewportProps,
} from './Carousel.types';
