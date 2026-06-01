'use client';

import {
  forwardRef,
  Slot,
  useDirection,
  useId,
  useControllableState,
} from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import { carouselRecipes } from './Carousel.recipe';
import { CarouselContext, useCarouselContext } from './CarouselContext';
import { clampIndex } from './computeSlideStep';
import { useAutoplay } from './useAutoplay';
import { useCarouselKeyboard } from './useCarouselKeyboard';
import { useCarouselScroll } from './useCarouselScroll';
import type {
  CarouselAutoplayControlProps,
  CarouselButtonProps,
  CarouselChangeSource,
  CarouselContextValue,
  CarouselControlsProps,
  CarouselIndicatorProps,
  CarouselIndicatorsProps,
  CarouselLiveRegionProps,
  CarouselProps,
  CarouselRef,
  CarouselSlideProps,
  CarouselTrackProps,
  CarouselViewportProps,
} from './Carousel.types';

const DEFAULT_AUTOPLAY_INTERVAL_MS = 5000;
const DEFAULT_ROLE_DESCRIPTION = 'carousel';
const DEFAULT_GAP_PX = 0;

/**
 * `<Carousel>` — accessible, keyboard- and touch-friendly carousel powered by CSS scroll-snap
 * with a thin JS coordination layer. Zero new dependencies; uses `IntersectionObserver` for
 * active-slide tracking and a small interval for opt-in autoplay.
 *
 * Two equivalent APIs:
 *  - **Prop-driven**: pass `<Carousel.Slide>` children; Viewport + Track + Controls + Indicators
 *    auto-wrap.
 *  - **Compound**: render the full `<Carousel.Viewport><Carousel.Track><Carousel.Slide /></…></…>`
 *    shape yourself for precise layout control.
 *
 * Autoplay is **off by default** per WCAG 2.2.2; when enabled, a visible pause/play control is
 * always rendered.
 */
export const CarouselRoot = forwardRef<CarouselRef, CarouselProps>(function Carousel(props, ref) {
  const {
    orientation = 'horizontal',
    slidesPerView,
    gap,
    snap = 'start',
    index: indexProp,
    defaultIndex = 0,
    onIndexChange,
    loop = false,
    autoplay = false,
    autoplayInterval = DEFAULT_AUTOPLAY_INTERVAL_MS,
    autoplayDirection = 'forward',
    pauseOnHover = true,
    pauseOnFocus = true,
    pauseOnReducedMotion = true,
    showAutoplayControl = 'auto',
    showControls = 'auto',
    showIndicators = 'auto',
    ariaLabel,
    ariaLabelledby,
    ariaRoleDescription = DEFAULT_ROLE_DESCRIPTION,
    liveRegionPoliteness = 'off',
    size = 'md',
    variant = 'default',
    showShadows = false,
    scrollBehavior = 'smooth',
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  // `useDirection` is consumed by the subparts (PrevButton / NextButton / Viewport keyboard
  // handler) — root reads it indirectly through them.
  useDirection();

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const viewportId = useId();
  const liveRegionId = useId();
  const programmaticScrollRef = useRef(false);

  const resolvedSlidesPerView = resolveResponsiveNumber(slidesPerView, 1);
  const resolvedGapPx = resolveGapPx(gap);

  // Walk children once to count slides and detect whether the consumer used the explicit
  // compound API (i.e. supplied a Viewport themselves). Cheap; flat children walk.
  const detection = useMemo(() => detectStructure(children), [children]);
  const slideCount = detection.slideCount;
  const canScroll = slideCount > resolvedSlidesPerView;
  const [index = 0, setIndexInternal] = useControllableState<number>({
    value: indexProp,
    defaultValue: defaultIndex,
  });
  const [lastChangeSource, setLastChangeSource] = useState<CarouselChangeSource | null>(null);

  const goTo = useCallback(
    (
      next: number,
      source: CarouselChangeSource = 'programmatic',
      opts?: { behavior?: 'smooth' | 'auto' },
    ) => {
      const clamped = clampIndex({ index: next, count: slideCount, loop });
      setIndexInternal(clamped);
      setLastChangeSource(source);
      onIndexChange?.(clamped, source);

      const slideEl = slideRefs.current[clamped];
      const viewport = viewportRef.current;
      if (!slideEl || !viewport) return;

      const behavior = opts?.behavior ?? scrollBehavior;
      // Suppress IntersectionObserver-driven setIndex while we programmatically scroll —
      // otherwise the observer could race with the controlled state and bounce the index.
      programmaticScrollRef.current = true;
      // jsdom doesn't implement scrollTo — fall back to direct scrollLeft/Top assignment so
      // unit tests can drive the carousel without the runtime exploding. Real browsers always
      // have scrollTo; this is a pure environment guard.
      if (orientation === 'horizontal') {
        const targetLeft = slideEl.offsetLeft - viewport.offsetLeft;
        if (typeof viewport.scrollTo === 'function') {
          viewport.scrollTo({ left: targetLeft, behavior });
        } else {
          viewport.scrollLeft = targetLeft;
        }
      } else {
        const targetTop = slideEl.offsetTop - viewport.offsetTop;
        if (typeof viewport.scrollTo === 'function') {
          viewport.scrollTo({ top: targetTop, behavior });
        } else {
          viewport.scrollTop = targetTop;
        }
      }
      // Release the suppression on the next macrotask so any IO callbacks queued by the
      // smooth-scroll see the updated index immediately. We mutate a ref (not state) so React
      // doesn't trigger any reconciliation — no `act` wrapper needed in tests.
      window.setTimeout(() => {
        programmaticScrollRef.current = false;
      }, 350);
    },
    [orientation, scrollBehavior, slideCount, loop, onIndexChange, setIndexInternal],
  );

  const next = useCallback(
    (source: CarouselChangeSource = 'control') => {
      goTo(index + 1, source);
    },
    [goTo, index],
  );

  const prev = useCallback(
    (source: CarouselChangeSource = 'control') => {
      goTo(index - 1, source);
    },
    [goTo, index],
  );

  // Autoplay
  const autoplay$ = useAutoplay({
    enabled: autoplay,
    interval: autoplayInterval,
    direction: autoplayDirection,
    pauseOnHover,
    pauseOnFocus,
    pauseOnReducedMotion,
    viewportRef,
    next: useCallback(() => goTo(index + 1, 'autoplay'), [goTo, index]),
    prev: useCallback(() => goTo(index - 1, 'autoplay'), [goTo, index]),
  });

  // IntersectionObserver — only commits index changes while we're not in the middle of a
  // programmatic scroll (otherwise the observer races the controlled state).
  useCarouselScroll({
    viewportRef,
    slideRefs,
    slideCount,
    enabled: !programmaticScrollRef.current,
    onIndexChange: useCallback(
      (i) => {
        if (programmaticScrollRef.current) return;
        if (i === index) return;
        setIndexInternal(i);
        setLastChangeSource('scroll');
        onIndexChange?.(i, 'scroll');
      },
      [index, setIndexInternal, onIndexChange],
    ),
  });

  // Imperative ref API exposed to consumers via `<Carousel ref={…}>`.
  useImperativeHandle(
    ref,
    () => ({
      scrollTo: (i, opts) => goTo(i, 'programmatic', opts),
      next: () => next('programmatic'),
      prev: () => prev('programmatic'),
      getIndex: () => index,
      getSlideCount: () => slideCount,
      isAutoplaying: () => autoplay$.isPlaying,
      pauseAutoplay: () => autoplay$.userPause(),
      playAutoplay: () => autoplay$.userPlay(),
    }),
    [goTo, next, prev, index, slideCount, autoplay$],
  );

  const registerSlide = useCallback((i: number, node: HTMLElement | null) => {
    slideRefs.current[i] = node;
  }, []);

  const ctxValue = useMemo<CarouselContextValue>(
    () => ({
      viewportId,
      index,
      slideCount,
      goTo,
      next,
      prev,
      orientation,
      snap,
      size,
      loop,
      canScroll,
      slidesPerView: resolvedSlidesPerView,
      gapPx: resolvedGapPx,
      viewportRef,
      registerSlide,
      autoplayEnabled: autoplay,
      isAutoplayPlaying: autoplay$.isPlaying,
      userPauseAutoplay: autoplay$.userPause,
      userPlayAutoplay: autoplay$.userPlay,
      lastChangeSource,
      liveRegionPoliteness:
        liveRegionPoliteness === 'polite' || (autoplay && autoplay$.isUserPaused)
          ? 'polite'
          : 'off',
      ariaRoleDescription,
      showShadows,
      scrollBehavior,
    }),
    [
      viewportId,
      index,
      slideCount,
      goTo,
      next,
      prev,
      orientation,
      snap,
      size,
      loop,
      canScroll,
      resolvedSlidesPerView,
      resolvedGapPx,
      registerSlide,
      autoplay,
      autoplay$.isPlaying,
      autoplay$.userPause,
      autoplay$.userPlay,
      autoplay$.isUserPaused,
      lastChangeSource,
      liveRegionPoliteness,
      ariaRoleDescription,
      showShadows,
      scrollBehavior,
    ],
  );

  const { className: rootCls, style: rootStyle } = useThemedClasses({
    recipe: carouselRecipes.root,
    componentName: 'Carousel',
    slot: 'root',
    props: { variant, size, className, sx, style },
  });

  // Decide whether to render in compound mode (the user passed Viewport/Track explicitly) or
  // auto-wrap mode (the user passed bare Slides). Auto-wrap is the 90% case.
  const showAutoControl = shouldShow(showAutoplayControl, autoplay);
  const showAutoControlsBlock = shouldShow(showControls, canScroll);
  const showAutoIndicators = shouldShow(showIndicators, canScroll);

  let body: ReactNode;
  if (detection.hasExplicitViewport) {
    body = children;
  } else {
    body = (
      <>
        <CarouselViewport>
          <CarouselTrack>{children}</CarouselTrack>
        </CarouselViewport>
        {showAutoControlsBlock || showAutoControl ? (
          <CarouselControls position="overlay">
            {showAutoControlsBlock ? <CarouselPrevButton /> : null}
            {showAutoControlsBlock ? <CarouselNextButton /> : null}
          </CarouselControls>
        ) : null}
        {showAutoIndicators ? <CarouselIndicators /> : null}
        {showAutoControl ? (
          <div className="mt-2 flex justify-center">
            <CarouselAutoplayControl />
          </div>
        ) : null}
      </>
    );
  }

  // Resolve `aria-labelledby` / `aria-label` semantics: if neither is supplied, fall back to a
  // generic "Carousel" label so axe doesn't flag a missing accessible name.
  const resolvedAriaLabel = ariaLabel ?? (ariaLabelledby ? undefined : 'Carousel');

  return (
    <CarouselContext.Provider value={ctxValue}>
      <section
        aria-roledescription={ariaRoleDescription}
        aria-label={resolvedAriaLabel}
        aria-labelledby={ariaLabelledby}
        data-carousel-root=""
        data-orientation={orientation}
        className={rootCls}
        style={rootStyle ?? undefined}
        {...(rest as React.HTMLAttributes<HTMLElement>)}
      >
        {body}
        <CarouselLiveRegion id={liveRegionId} />
      </section>
    </CarouselContext.Provider>
  );
}, 'Carousel');

// ----------------------------------------------------------------------------
// Subparts
// ----------------------------------------------------------------------------

export const CarouselViewport = forwardRef<HTMLDivElement, CarouselViewportProps>(
  function CarouselViewport(props, ref) {
    const { className, style, sx, children, onKeyDown, ...rest } = props;
    const ctx = useCarouselContext('Carousel.Viewport');
    const isRtl = useDirection() === 'rtl';

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: carouselRecipes.viewport,
      componentName: 'Carousel',
      slot: 'viewport',
      props: {
        orientation: ctx.orientation,
        snap: ctx.snap,
        scrollBehavior: ctx.scrollBehavior,
        showShadows: ctx.showShadows,
        className,
        sx,
        style,
      },
    });

    const handleKeyDown = useCarouselKeyboard({
      orientation: ctx.orientation,
      isRtl,
      goTo: ctx.goTo,
      next: ctx.next,
      prev: ctx.prev,
      slideCount: ctx.slideCount,
      autoplayEnabled: ctx.autoplayEnabled,
      toggleAutoplay: () => {
        if (ctx.isAutoplayPlaying) ctx.userPauseAutoplay();
        else ctx.userPlayAutoplay();
      },
    });

    return (
      // The Viewport is the W3C APG Carousel keyboard target — it's the element users tab into
      // to drive Prev/Next/Home/End/PageUp/Down. It owns the keyboard handler and the
      // `tabIndex={0}` focus stop; this is a deliberate scrolling region with `role="group"`
      // and `aria-roledescription="carousel"`.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <div
        ref={(node) => {
          (ctx.viewportRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        id={ctx.viewportId}
        role="group"
        aria-roledescription={ctx.ariaRoleDescription}
        aria-atomic="false"
        aria-live={ctx.autoplayEnabled && ctx.isAutoplayPlaying ? 'off' : ctx.liveRegionPoliteness}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        data-carousel-viewport=""
        data-orientation={ctx.orientation}
        className={cls}
        style={rootStyle ?? undefined}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          handleKeyDown(event);
        }}
        {...rest}
      >
        {children}
      </div>
    );
  },
  'Carousel.Viewport',
);

export const CarouselTrack = forwardRef<HTMLDivElement, CarouselTrackProps>(function CarouselTrack(
  props,
  ref,
) {
  const { className, style, sx, children, ...rest } = props;
  const ctx = useCarouselContext('Carousel.Track');

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: carouselRecipes.track,
    componentName: 'Carousel',
    slot: 'track',
    props: { orientation: ctx.orientation, className, sx, style },
  });

  // Per-slide flex-basis is computed once here from slidesPerView + gapPx and applied via
  // inline style. Tailwind's `flex-basis` arbitrary class isn't dynamic enough for our matrix.
  const trackStyle = useMemo<React.CSSProperties>(() => {
    const gap = `${ctx.gapPx}px`;
    return {
      gap,
      ...(rootStyle ?? {}),
    };
  }, [ctx.gapPx, rootStyle]);

  // Walk children and inject the running index onto each `<Carousel.Slide>` via cloneElement.
  // The slide can then auto-derive its `aria-label="Slide N of M"` and its DOM ref slot.
  let index = 0;
  const decoratedChildren: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      decoratedChildren.push(child);
      return;
    }
    const displayName = getDisplayName(child);
    if (displayName === 'Carousel.Slide') {
      const slideIndex = index++;
      decoratedChildren.push(
        cloneSlideWithIndex(child as ReactElement<CarouselSlideProps>, slideIndex),
      );
    } else {
      decoratedChildren.push(child);
    }
  });

  return (
    <div ref={ref} data-carousel-track="" className={cls} style={trackStyle} {...rest}>
      {decoratedChildren}
    </div>
  );
}, 'Carousel.Track');

interface SlideInternalProps extends CarouselSlideProps {
  __carouselIndex?: number;
}

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(function CarouselSlide(
  props,
  ref,
) {
  const { className, style, sx, asChild, ariaLabel, children, ...rest } = props;
  // `__carouselIndex` is injected by the parent `Carousel.Track` via `cloneElement` and is not a
  // public prop. Strip it before spreading on the DOM so React doesn't warn about an unknown
  // attribute.
  const { __carouselIndex: injectedIndex, ...domRest } = rest as SlideInternalProps;
  const ctx = useCarouselContext('Carousel.Slide');
  const slideIndex = typeof injectedIndex === 'number' ? injectedIndex : 0;

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: carouselRecipes.slide,
    componentName: 'Carousel',
    slot: 'slide',
    props: { snap: ctx.snap, className, sx, style },
  });

  // Flex basis derived from slidesPerView + gap. Inline so consumers can override via `style`.
  const basisStyle: React.CSSProperties = useMemo(() => {
    const sp = Math.max(1, ctx.slidesPerView);
    const gapTotalPx = ctx.gapPx * (sp - 1);
    return ctx.orientation === 'horizontal'
      ? { flex: `0 0 calc((100% - ${gapTotalPx}px) / ${sp})` }
      : { flex: `0 0 calc((100% - ${gapTotalPx}px) / ${sp})` };
  }, [ctx.slidesPerView, ctx.gapPx, ctx.orientation]);

  const isActive = ctx.index === slideIndex;
  const composedAriaLabel = ariaLabel ?? `Slide ${slideIndex + 1} of ${ctx.slideCount}`;

  const setRef = (node: HTMLDivElement | null) => {
    ctx.registerSlide(slideIndex, node);
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  const styleCombined: React.CSSProperties = {
    ...basisStyle,
    ...(rootStyle ?? {}),
  };

  if (asChild) {
    return (
      <Slot
        ref={setRef as unknown as React.Ref<HTMLElement>}
        role="group"
        aria-roledescription="slide"
        aria-label={composedAriaLabel}
        aria-current={isActive ? 'true' : undefined}
        data-carousel-slide=""
        data-carousel-slide-index={slideIndex}
        data-active={isActive ? 'true' : undefined}
        className={cls}
        style={styleCombined}
        {...(domRest as React.HTMLAttributes<HTMLElement>)}
      >
        {children}
      </Slot>
    );
  }

  return (
    <div
      ref={setRef}
      role="group"
      aria-roledescription="slide"
      aria-label={composedAriaLabel}
      aria-current={isActive ? 'true' : undefined}
      data-carousel-slide=""
      data-carousel-slide-index={slideIndex}
      data-active={isActive ? 'true' : undefined}
      className={cls}
      style={styleCombined}
      {...domRest}
    >
      {children}
    </div>
  );
}, 'Carousel.Slide');

export const CarouselPrevButton = forwardRef<HTMLButtonElement, CarouselButtonProps>(
  function CarouselPrevButton(props, ref) {
    const { ariaLabel = 'Previous slide', children, className, onClick, disabled: disabledProp, ...rest } =
      props;
    const ctx = useCarouselContext('Carousel.PrevButton');
    const isRtl = useDirection() === 'rtl';

    const atStart = ctx.index <= 0 && !ctx.loop;
    const disabled = disabledProp ?? atStart;

    const { className: cls } = useThemedClasses({
      recipe: carouselRecipes.controlButton,
      componentName: 'Carousel',
      slot: 'controlButton',
      props: { size: ctx.size, className },
    });

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        aria-controls={ctx.viewportId}
        disabled={disabled}
        className={cls}
        data-carousel-prev=""
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) ctx.prev('control');
        }}
        {...rest}
      >
        {children ?? <ChevronGlyph direction={isRtl ? 'right' : 'left'} />}
      </button>
    );
  },
  'Carousel.PrevButton',
);

export const CarouselNextButton = forwardRef<HTMLButtonElement, CarouselButtonProps>(
  function CarouselNextButton(props, ref) {
    const { ariaLabel = 'Next slide', children, className, onClick, disabled: disabledProp, ...rest } =
      props;
    const ctx = useCarouselContext('Carousel.NextButton');
    const isRtl = useDirection() === 'rtl';

    const atEnd = ctx.index >= ctx.slideCount - 1 && !ctx.loop;
    const disabled = disabledProp ?? atEnd;

    const { className: cls } = useThemedClasses({
      recipe: carouselRecipes.controlButton,
      componentName: 'Carousel',
      slot: 'controlButton',
      props: { size: ctx.size, className },
    });

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        aria-controls={ctx.viewportId}
        disabled={disabled}
        className={cls}
        data-carousel-next=""
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) ctx.next('control');
        }}
        {...rest}
      >
        {children ?? <ChevronGlyph direction={isRtl ? 'left' : 'right'} />}
      </button>
    );
  },
  'Carousel.NextButton',
);

export const CarouselControls = forwardRef<HTMLDivElement, CarouselControlsProps>(
  function CarouselControls(props, ref) {
    const { className, style, sx, position = 'overlay', children, ...rest } = props;
    useCarouselContext('Carousel.Controls');

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: carouselRecipes.controls,
      componentName: 'Carousel',
      slot: 'controls',
      props: { position, className, sx, style },
    });

    return (
      <div
        ref={ref}
        data-carousel-controls=""
        data-position={position}
        className={cls}
        style={rootStyle ?? undefined}
        {...rest}
      >
        {children}
      </div>
    );
  },
  'Carousel.Controls',
);

export const CarouselIndicators = forwardRef<HTMLDivElement, CarouselIndicatorsProps>(
  function CarouselIndicators(props, ref) {
    const {
      className,
      style,
      sx,
      variant = 'dots',
      align = 'center',
      renderLabel,
      children,
      ...rest
    } = props;
    const ctx = useCarouselContext('Carousel.Indicators');

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: carouselRecipes.indicators,
      componentName: 'Carousel',
      slot: 'indicators',
      props: { align, className, sx, style },
    });

    const items = children
      ? children
      : Array.from({ length: ctx.slideCount }, (_, i) => {
          const label = renderLabel
            ? renderLabel(i, ctx.slideCount)
            : `Go to slide ${i + 1}`;
          return (
            <CarouselIndicator key={i} index={i} aria-label={label} data-variant={variant}>
              {variant === 'numbers' ? i + 1 : null}
            </CarouselIndicator>
          );
        });

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label="Carousel slides"
        data-carousel-indicators=""
        className={cls}
        style={rootStyle ?? undefined}
        {...rest}
      >
        {items}
      </div>
    );
  },
  'Carousel.Indicators',
);

export const CarouselIndicator = forwardRef<HTMLButtonElement, CarouselIndicatorProps>(
  function CarouselIndicator(props, ref) {
    const { index, className, onClick, children, ...rest } = props;
    const ctx = useCarouselContext('Carousel.Indicator');
    const active = ctx.index === index;
    const variant = (rest as { 'data-variant'?: 'dots' | 'bars' | 'numbers' })['data-variant'] ?? 'dots';

    const { className: cls } = useThemedClasses({
      recipe: carouselRecipes.indicator,
      componentName: 'Carousel',
      slot: 'indicator',
      props: { variant, active, className },
    });

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={active}
        aria-current={active ? 'true' : undefined}
        aria-controls={ctx.viewportId}
        data-carousel-indicator=""
        data-active={active ? 'true' : undefined}
        className={cls}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) ctx.goTo(index, 'indicator');
        }}
        {...rest}
      >
        {children}
      </button>
    );
  },
  'Carousel.Indicator',
);

export const CarouselAutoplayControl = forwardRef<HTMLButtonElement, CarouselAutoplayControlProps>(
  function CarouselAutoplayControl(props, ref) {
    const {
      ariaLabelPlay = 'Play carousel',
      ariaLabelPause = 'Pause carousel',
      className,
      onClick,
      children,
      ...rest
    } = props;
    const ctx = useCarouselContext('Carousel.AutoplayControl');

    const isPlaying = ctx.isAutoplayPlaying;
    const label = isPlaying ? ariaLabelPause : ariaLabelPlay;

    const { className: cls } = useThemedClasses({
      recipe: carouselRecipes.controlButton,
      componentName: 'Carousel',
      slot: 'controlButton',
      props: { size: ctx.size, className },
    });

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-pressed={!isPlaying}
        aria-controls={ctx.viewportId}
        data-carousel-autoplay-control=""
        data-state={isPlaying ? 'playing' : 'paused'}
        className={cls}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (isPlaying) ctx.userPauseAutoplay();
          else ctx.userPlayAutoplay();
        }}
        {...rest}
      >
        {children ?? (isPlaying ? <PauseGlyph /> : <PlayGlyph />)}
      </button>
    );
  },
  'Carousel.AutoplayControl',
);

export const CarouselLiveRegion = forwardRef<HTMLDivElement, CarouselLiveRegionProps>(
  function CarouselLiveRegion(props, ref) {
    const { id, ...rest } = props;
    const ctx = useCarouselContext('Carousel.LiveRegion');

    // Announce only when the consumer requested polite (or when autoplay+user-paused).
    const shouldAnnounce =
      ctx.liveRegionPoliteness === 'polite' &&
      ctx.lastChangeSource != null &&
      ctx.lastChangeSource !== 'scroll';

    return (
      <div
        ref={ref}
        id={id}
        aria-live={ctx.liveRegionPoliteness}
        aria-atomic="true"
        data-carousel-live-region=""
        className="sr-only"
        {...rest}
      >
        {shouldAnnounce ? `Slide ${ctx.index + 1} of ${ctx.slideCount}` : ''}
      </div>
    );
  },
  'Carousel.LiveRegion',
);

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

interface StructureDetection {
  slideCount: number;
  hasExplicitViewport: boolean;
}

function detectStructure(children: ReactNode): StructureDetection {
  let slideCount = 0;
  let hasExplicitViewport = false;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const displayName = getDisplayName(child);
    if (displayName === 'Carousel.Slide') {
      slideCount++;
    } else if (displayName === 'Carousel.Viewport') {
      hasExplicitViewport = true;
      // Count slides nested inside the viewport/track too.
      const viewportProps = child.props as { children?: ReactNode };
      Children.forEach(viewportProps.children, (vChild) => {
        if (!isValidElement(vChild)) return;
        if (getDisplayName(vChild) === 'Carousel.Track') {
          const trackProps = vChild.props as { children?: ReactNode };
          Children.forEach(trackProps.children, (tChild) => {
            if (isValidElement(tChild) && getDisplayName(tChild) === 'Carousel.Slide') {
              slideCount++;
            }
          });
        } else if (getDisplayName(vChild) === 'Carousel.Slide') {
          slideCount++;
        }
      });
    }
  });

  return { slideCount, hasExplicitViewport };
}

function getDisplayName(element: ReactElement): string | undefined {
  const type = element.type as { displayName?: string; name?: string } | string | undefined;
  if (typeof type === 'string') return type;
  return type?.displayName ?? type?.name;
}

function cloneSlideWithIndex(child: ReactElement<CarouselSlideProps>, index: number): ReactElement {
  return cloneElement(child, { __carouselIndex: index } as Partial<SlideInternalProps>);
}

function shouldShow(mode: 'auto' | 'always' | 'never', auto: boolean): boolean {
  if (mode === 'always') return true;
  if (mode === 'never') return false;
  return auto;
}

function resolveResponsiveNumber(
  value: number | Record<string, number> | undefined,
  fallback: number,
): number {
  if (value === undefined) return fallback;
  if (typeof value === 'number') return value;
  const obj = value as Partial<Record<string, number>>;
  return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? fallback;
}

function resolveGapPx(value: number | Record<string, number> | undefined): number {
  // Spacing scale resolution defers to Tailwind's 4px-per-step scale (1 → 4px, 2 → 8px, …).
  const n = resolveResponsiveNumber(value, DEFAULT_GAP_PX);
  return n * 4;
}

function ChevronGlyph({ direction }: { direction: 'left' | 'right' | 'up' | 'down' }) {
  const path =
    direction === 'left'
      ? 'M15 18l-6-6 6-6'
      : direction === 'right'
      ? 'M9 6l6 6-6 6'
      : direction === 'up'
      ? 'M18 15l-6-6-6 6'
      : 'M6 9l6 6 6-6';
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  );
}