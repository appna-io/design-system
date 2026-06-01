import type { ResponsiveValue, Sx } from '@apx-ui/engine';
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  Ref,
} from 'react';

export type CarouselOrientation = 'horizontal' | 'vertical';
export type CarouselSnap = 'start' | 'center' | 'end' | 'none';
export type CarouselSize = 'sm' | 'md' | 'lg';
export type CarouselVariant = 'default' | 'ghost' | 'card';
export type CarouselIndicatorVariant = 'dots' | 'bars' | 'numbers';
export type CarouselAlign = 'start' | 'center' | 'end';
export type CarouselAutoplayDirection = 'forward' | 'backward';
export type CarouselLivePoliteness = 'off' | 'polite';
export type CarouselShowMode = 'auto' | 'always' | 'never';

/** How a slide change was initiated — useful for analytics, autoplay coordination, AT logic. */
export type CarouselChangeSource =
  | 'pointer'
  | 'keyboard'
  | 'autoplay'
  | 'control'
  | 'indicator'
  | 'programmatic'
  | 'scroll';

/** Imperative handle exposed via `ref` on the Carousel root. */
export interface CarouselRef {
  scrollTo(index: number, opts?: { behavior?: 'smooth' | 'auto' }): void;
  next(): void;
  prev(): void;
  getIndex(): number;
  getSlideCount(): number;
  isAutoplaying(): boolean;
  pauseAutoplay(): void;
  playAutoplay(): void;
}

/** Shared base for the root + subparts so they all accept `className` / `style` / `sx`. */
export interface CarouselBaseProps {
  className?: string;
  style?: CSSProperties;
  sx?: Sx;
}

export interface CarouselProps
  extends CarouselBaseProps,
    Omit<HTMLAttributes<HTMLElement>, 'children' | 'color' | 'aria-label' | 'aria-labelledby'> {
  /** Orientation of the scroll axis. Default `'horizontal'`. */
  orientation?: CarouselOrientation;
  /** Number of slides visible at once. Accepts a responsive value. Default `1`. */
  slidesPerView?: ResponsiveValue<number>;
  /** Inter-slide gap in the theme spacing scale. Default `0`. */
  gap?: ResponsiveValue<number>;
  /** Scroll-snap alignment per slide. Default `'start'`. */
  snap?: CarouselSnap;

  /** Controlled active-slide index. */
  index?: number;
  /** Uncontrolled initial index. Default `0`. */
  defaultIndex?: number;
  /** Fires whenever the active slide changes. */
  onIndexChange?: (index: number, source: CarouselChangeSource) => void;
  /** Enables wrap-around navigation past the last slide back to the first. Default `false`. */
  loop?: boolean;

  /** Enables interval-based auto-advance. **OFF by default** (WCAG 2.2.2). */
  autoplay?: boolean;
  /** Autoplay interval in ms. Default `5000`. */
  autoplayInterval?: number;
  /** Direction the autoplay advances. Default `'forward'`. */
  autoplayDirection?: CarouselAutoplayDirection;
  /** Pause the autoplay while the pointer hovers over the carousel. Default `true`. */
  pauseOnHover?: boolean;
  /** Pause the autoplay while any element inside the carousel is focused. Default `true`. */
  pauseOnFocus?: boolean;
  /** Pause the autoplay when `prefers-reduced-motion: reduce`. Default `true`. */
  pauseOnReducedMotion?: boolean;
  /** When to render the visible pause/play control. Default `'auto'` (when autoplay enabled). */
  showAutoplayControl?: CarouselShowMode;

  /** When to render the Prev/Next buttons. Default `'auto'` (only when scrolling is possible). */
  showControls?: CarouselShowMode;
  /** When to render the Indicators row. Default `'auto'`. */
  showIndicators?: CarouselShowMode;

  /** Required accessible name for the region. Pair with `ariaLabelledby` if labeling another element. */
  ariaLabel?: string;
  /** Alternative to `ariaLabel`: id of an element labeling the carousel region. */
  ariaLabelledby?: string;
  /** `aria-roledescription` for the region. Default `'carousel'`. Common overrides: `'gallery'`, `'banner'`. */
  ariaRoleDescription?: string;
  /** Politeness of the live region announcing slide changes. Default `'off'`. */
  liveRegionPoliteness?: CarouselLivePoliteness;

  /** Visual size scale; controls indicator + button sizing. Default `'md'`. */
  size?: CarouselSize;
  /** Visual variant of the root container. Default `'default'`. */
  variant?: CarouselVariant;
  /** Adds fade gradients on the leading + trailing scroll edges. Default `false`. */
  showShadows?: boolean;
  /** `scroll-behavior` for programmatic scrolls. `prefers-reduced-motion` auto-converts smooth → auto. */
  scrollBehavior?: 'smooth' | 'auto';

  /** Imperative handle. */
  ref?: Ref<CarouselRef>;
  /** Carousel children — usually `<Carousel.Slide>` elements (auto-wrapped) or the full compound shape. */
  children?: ReactNode;
}

export interface CarouselViewportProps
  extends CarouselBaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
}

export interface CarouselTrackProps
  extends CarouselBaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
}

export interface CarouselSlideProps
  extends CarouselBaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Polymorphic — render as the single child element (via `Slot`) instead of `<div>`. */
  asChild?: boolean;
  /** Override the auto-generated `aria-label` ("Slide N of M"). */
  ariaLabel?: string;
  children?: ReactNode;
}

export interface CarouselButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Override the default accessible name. */
  ariaLabel?: string;
  /** Optional icon override. Default chevron-left / chevron-right. */
  children?: ReactNode;
}

export interface CarouselControlsProps
  extends CarouselBaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Position of the Controls block. Default `'overlay'` (absolutely positioned over the edges). */
  position?: 'overlay' | 'bottom' | 'top';
  children?: ReactNode;
}

export interface CarouselIndicatorsProps
  extends CarouselBaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: CarouselIndicatorVariant;
  align?: CarouselAlign;
  /** Override label for each indicator. `(index, total) => string`. */
  renderLabel?: (index: number, total: number) => string;
  children?: ReactNode;
}

export interface CarouselIndicatorProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** 0-based index of the slide this indicator targets. */
  index: number;
  /** Custom child content (e.g. thumbnails). Default depends on `Indicators.variant`. */
  children?: ReactNode;
}

export interface CarouselAutoplayControlProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  ariaLabelPause?: string;
  ariaLabelPlay?: string;
  children?: ReactNode;
}

export type CarouselLiveRegionProps = HTMLAttributes<HTMLDivElement>;

/** Value published on `CarouselContext`. */
export interface CarouselContextValue {
  /** Stable id for the viewport (used to wire `aria-labelledby` from external elements). */
  viewportId: string;
  /** Active 0-based slide index. */
  index: number;
  /** Total number of "real" slides (excluding loop clones). */
  slideCount: number;
  /** Sets the active index from external triggers and scrolls the viewport. */
  goTo: (index: number, source?: CarouselChangeSource, opts?: { behavior?: 'smooth' | 'auto' }) => void;
  /** Goes to the next slide (with loop awareness). */
  next: (source?: CarouselChangeSource) => void;
  /** Goes to the previous slide (with loop awareness). */
  prev: (source?: CarouselChangeSource) => void;
  /** Resolved orientation. */
  orientation: CarouselOrientation;
  /** Resolved snap mode. */
  snap: CarouselSnap;
  /** Resolved size. */
  size: CarouselSize;
  /** Loop mode flag. */
  loop: boolean;
  /** True when the scroll axis can scroll (slide count > slides visible). */
  canScroll: boolean;
  /** Resolved slidesPerView (post-responsive collapse, snapshot of current breakpoint). */
  slidesPerView: number;
  /** Resolved gap in px (resolved from theme spacing scale). */
  gapPx: number;
  /** Ref to the viewport element. */
  viewportRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Internal: each `<Carousel.Slide>` registers its DOM node here on mount keyed by its
   * 0-based index. The root uses this map to drive programmatic scrolling and to feed the
   * IntersectionObserver in `useCarouselScroll`.
   */
  registerSlide: (index: number, node: HTMLElement | null) => void;
  /** Whether autoplay is configured. */
  autoplayEnabled: boolean;
  /** True when autoplay is currently running (i.e. not paused by user/hover/focus/etc.). */
  isAutoplayPlaying: boolean;
  /** User toggled pause/play via the AutoplayControl button. */
  userPauseAutoplay: () => void;
  userPlayAutoplay: () => void;
  /** Most recent change source — used by the live region to gate announcements. */
  lastChangeSource: CarouselChangeSource | null;
  /** Resolved live-region politeness. */
  liveRegionPoliteness: CarouselLivePoliteness;
  /** `aria-roledescription` value (default `'carousel'`). */
  ariaRoleDescription: string;
  /** Whether the viewport should paint fade gradients on its leading + trailing edges. */
  showShadows: boolean;
  /** Programmatic scroll behavior (`'smooth'` / `'auto'`). */
  scrollBehavior: 'smooth' | 'auto';
}