import { cv } from '@apx-ui/engine';

/**
 * Recipe slots for `<Carousel />`:
 *  - `root` — outer `<section>` wrapper; carries variant + size axes.
 *  - `viewport` — overflow scroll container; carries snap-axis + showShadows.
 *  - `track` — flex container of slides; carries orientation.
 *  - `slide` — flex item with `shrink-0`; basis driven by inline style.
 *  - `controlButton` — Prev/Next/Autoplay buttons; carries size + disabled.
 *  - `controls` — wrapper for the button row; carries position.
 *  - `indicators` — wrapper for the indicator buttons row; carries align + variant.
 *  - `indicator` — individual indicator button; carries active + variant.
 *
 * Tailwind classes are literal so the content scanner picks them up — no interpolation.
 */
export const carouselRecipes = {
  root: cv({
    base: 'relative w-full',
    variants: {
      variant: {
        default: '',
        ghost: '',
        card: 'rounded-lg border border-border bg-bg-default p-3',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }),
  viewport: cv({
    base: 'relative w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    variants: {
      orientation: {
        horizontal: 'overflow-x-auto overflow-y-hidden',
        vertical: 'overflow-y-auto overflow-x-hidden max-h-[600px]',
      },
      snap: {
        start: '',
        center: '',
        end: '',
        none: '',
      },
      scrollBehavior: {
        smooth: 'scroll-smooth motion-reduce:scroll-auto',
        auto: 'scroll-auto',
      },
      showShadows: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { orientation: 'horizontal', snap: 'start', class: '[scroll-snap-type:x_mandatory]' },
      { orientation: 'horizontal', snap: 'center', class: '[scroll-snap-type:x_mandatory]' },
      { orientation: 'horizontal', snap: 'end', class: '[scroll-snap-type:x_mandatory]' },
      { orientation: 'vertical', snap: 'start', class: '[scroll-snap-type:y_mandatory]' },
      { orientation: 'vertical', snap: 'center', class: '[scroll-snap-type:y_mandatory]' },
      { orientation: 'vertical', snap: 'end', class: '[scroll-snap-type:y_mandatory]' },
      {
        orientation: 'horizontal',
        showShadows: true,
        class: '[mask-image:linear-gradient(to_right,transparent_0,black_24px,black_calc(100%-24px),transparent_100%)]',
      },
      {
        orientation: 'vertical',
        showShadows: true,
        class: '[mask-image:linear-gradient(to_bottom,transparent_0,black_24px,black_calc(100%-24px),transparent_100%)]',
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      snap: 'start',
      scrollBehavior: 'smooth',
      showShadows: false,
    },
  }),
  track: cv({
    base: 'flex',
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      },
    },
    defaultVariants: { orientation: 'horizontal' },
  }),
  slide: cv({
    base: 'shrink-0 min-w-0',
    variants: {
      snap: {
        start: '[scroll-snap-align:start]',
        center: '[scroll-snap-align:center]',
        end: '[scroll-snap-align:end]',
        none: '',
      },
    },
    defaultVariants: { snap: 'start' },
  }),
  controls: cv({
    base: 'inline-flex items-center gap-2',
    variants: {
      position: {
        overlay: 'absolute inset-0 pointer-events-none flex justify-between items-center px-2',
        bottom: 'mt-3 justify-center',
        top: 'mb-3 justify-center',
      },
    },
    defaultVariants: { position: 'overlay' },
  }),
  controlButton: cv({
    base: 'inline-flex items-center justify-center rounded-full border border-border bg-bg-default text-fg-default shadow-sm transition-opacity transition-colors duration-fast ease-standard pointer-events-auto motion-reduce:transition-none hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-bg-default',
    variants: {
      size: {
        sm: 'h-7 w-7 [&_svg]:size-3.5',
        md: 'h-9 w-9 [&_svg]:size-4',
        lg: 'h-11 w-11 [&_svg]:size-5',
      },
    },
    defaultVariants: { size: 'md' },
  }),
  indicators: cv({
    base: 'flex w-full items-center gap-2 mt-3',
    variants: {
      align: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
      },
    },
    defaultVariants: { align: 'center' },
  }),
  indicator: cv({
    base: 'cursor-pointer outline-none transition-all duration-fast ease-standard motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-30',
    variants: {
      variant: {
        dots: 'h-2 w-2 rounded-full bg-border',
        bars: 'h-1 w-6 rounded-full bg-border',
        numbers:
          'h-7 min-w-7 px-1.5 rounded-md text-xs font-medium border border-border bg-bg-default text-fg-default flex items-center justify-center hover:bg-bg-subtle',
      },
      active: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { variant: 'dots', active: true, class: 'bg-primary scale-125' },
      { variant: 'bars', active: true, class: 'bg-primary w-8' },
      { variant: 'numbers', active: true, class: 'bg-primary text-primary-foreground border-primary' },
    ],
    defaultVariants: { variant: 'dots', active: false },
  }),
};