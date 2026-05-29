import { cv } from '@apx-ui/engine';

/**
 * Three-slot recipe for `<Switch />` — `root` (the `<label>`), `track` (the colored rail), and
 * `thumb` (the sliding pill). Mirrors the structure Phase 9 (Checkbox) established and the
 * structure Phase 11 (Radio) will mirror again.
 *
 * Track length × thumb diameter × slide distance are co-derived from `size` so the thumb never
 * overshoots:
 *   sm:  h-4 w-7  / size-3 / translate-x-3
 *   md:  h-5 w-9  / size-4 / translate-x-4
 *   lg:  h-6 w-11 / size-5 / translate-x-5
 *
 * Slide is a pure-CSS `transition-transform` — `prefers-reduced-motion` collapses it via the
 * Tailwind `motion-reduce` variant in `thumb.base`. No Motion dependency is paid for the slide.
 */
export const switchRecipes = {
  root: cv({
    base: [
      'group/switch inline-flex items-start cursor-pointer select-none align-top',
      'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
    ].join(' '),
    variants: {
      size: {
        sm: 'gap-1.5',
        md: 'gap-2',
        lg: 'gap-2.5',
      },
      labelPosition: {
        right: 'flex-row',
        left: 'flex-row-reverse',
      },
    },
    defaultVariants: { size: 'md', labelPosition: 'right' },
  }),
  track: cv({
    base: [
      'relative shrink-0 inline-flex items-center',
      'border border-border bg-bg-subtle',
      'transition-[background-color,border-color,box-shadow] duration-fast ease-standard',
      'outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg',
      'data-[invalid=true]:ring-2 data-[invalid=true]:ring-danger',
    ].join(' '),
    variants: {
      variant: {
        solid: '',
        outline: 'border-2 bg-transparent',
        soft: '',
      },
      size: {
        sm: 'h-4 w-7',
        md: 'h-5 w-9',
        lg: 'h-6 w-11',
      },
      shape: {
        pill: 'rounded-full',
        square: 'rounded-sm',
      },
      color: {
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
        neutral: '',
      },
    },
    compoundVariants: [
      // ── focus-ring color (always, regardless of checked state) ────────────────────────────
      { variant: 'solid', color: 'primary', class: 'peer-focus-visible:ring-primary' },
      { variant: 'solid', color: 'secondary', class: 'peer-focus-visible:ring-secondary' },
      { variant: 'solid', color: 'success', class: 'peer-focus-visible:ring-success' },
      { variant: 'solid', color: 'warning', class: 'peer-focus-visible:ring-warning' },
      { variant: 'solid', color: 'danger', class: 'peer-focus-visible:ring-danger' },
      { variant: 'solid', color: 'info', class: 'peer-focus-visible:ring-info' },
      { variant: 'solid', color: 'neutral', class: 'peer-focus-visible:ring-neutral' },
      { variant: 'outline', color: 'primary', class: 'peer-focus-visible:ring-primary' },
      { variant: 'outline', color: 'secondary', class: 'peer-focus-visible:ring-secondary' },
      { variant: 'outline', color: 'success', class: 'peer-focus-visible:ring-success' },
      { variant: 'outline', color: 'warning', class: 'peer-focus-visible:ring-warning' },
      { variant: 'outline', color: 'danger', class: 'peer-focus-visible:ring-danger' },
      { variant: 'outline', color: 'info', class: 'peer-focus-visible:ring-info' },
      { variant: 'outline', color: 'neutral', class: 'peer-focus-visible:ring-neutral' },
      { variant: 'soft', color: 'primary', class: 'peer-focus-visible:ring-primary' },
      { variant: 'soft', color: 'secondary', class: 'peer-focus-visible:ring-secondary' },
      { variant: 'soft', color: 'success', class: 'peer-focus-visible:ring-success' },
      { variant: 'soft', color: 'warning', class: 'peer-focus-visible:ring-warning' },
      { variant: 'soft', color: 'danger', class: 'peer-focus-visible:ring-danger' },
      { variant: 'soft', color: 'info', class: 'peer-focus-visible:ring-info' },
      { variant: 'soft', color: 'neutral', class: 'peer-focus-visible:ring-neutral' },
      // ── solid (7) — filled ON track ──────────────────────────────────────────────────────
      {
        variant: 'solid',
        color: 'primary',
        class: 'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
      },
      {
        variant: 'solid',
        color: 'secondary',
        class: 'data-[state=checked]:bg-secondary data-[state=checked]:border-secondary',
      },
      {
        variant: 'solid',
        color: 'success',
        class: 'data-[state=checked]:bg-success data-[state=checked]:border-success',
      },
      {
        variant: 'solid',
        color: 'warning',
        class: 'data-[state=checked]:bg-warning data-[state=checked]:border-warning',
      },
      {
        variant: 'solid',
        color: 'danger',
        class: 'data-[state=checked]:bg-danger data-[state=checked]:border-danger',
      },
      {
        variant: 'solid',
        color: 'info',
        class: 'data-[state=checked]:bg-info data-[state=checked]:border-info',
      },
      {
        variant: 'solid',
        color: 'neutral',
        class: 'data-[state=checked]:bg-neutral data-[state=checked]:border-neutral',
      },
      // ── outline (7) — transparent track, colored border ──────────────────────────────────
      { variant: 'outline', color: 'primary', class: 'data-[state=checked]:border-primary' },
      { variant: 'outline', color: 'secondary', class: 'data-[state=checked]:border-secondary' },
      { variant: 'outline', color: 'success', class: 'data-[state=checked]:border-success' },
      { variant: 'outline', color: 'warning', class: 'data-[state=checked]:border-warning' },
      { variant: 'outline', color: 'danger', class: 'data-[state=checked]:border-danger' },
      { variant: 'outline', color: 'info', class: 'data-[state=checked]:border-info' },
      { variant: 'outline', color: 'neutral', class: 'data-[state=checked]:border-neutral' },
      // ── soft (7) — subtle tinted ON track ────────────────────────────────────────────────
      {
        variant: 'soft',
        color: 'primary',
        class: 'data-[state=checked]:bg-primary-subtle data-[state=checked]:border-primary-border',
      },
      {
        variant: 'soft',
        color: 'secondary',
        class:
          'data-[state=checked]:bg-secondary-subtle data-[state=checked]:border-secondary-border',
      },
      {
        variant: 'soft',
        color: 'success',
        class: 'data-[state=checked]:bg-success-subtle data-[state=checked]:border-success-border',
      },
      {
        variant: 'soft',
        color: 'warning',
        class: 'data-[state=checked]:bg-warning-subtle data-[state=checked]:border-warning-border',
      },
      {
        variant: 'soft',
        color: 'danger',
        class: 'data-[state=checked]:bg-danger-subtle data-[state=checked]:border-danger-border',
      },
      {
        variant: 'soft',
        color: 'info',
        class: 'data-[state=checked]:bg-info-subtle data-[state=checked]:border-info-border',
      },
      {
        variant: 'soft',
        color: 'neutral',
        class: 'data-[state=checked]:bg-neutral-subtle data-[state=checked]:border-neutral-border',
      },
    ],
    defaultVariants: { variant: 'solid', size: 'md', shape: 'pill', color: 'primary' },
  }),
  thumb: cv({
    base: [
      'absolute start-0.5 inline-flex items-center justify-center',
      'bg-bg-paper shadow-sm text-fg',
      'transition-transform duration-fast ease-standard motion-reduce:transition-none',
      'rounded-full',
    ].join(' '),
    variants: {
      variant: {
        solid: '',
        // Outline + soft variants paint the thumb with the ON-color (per plan's matrix sketch),
        // matched 1:1 in compoundVariants below so the visual contrast against the
        // transparent / subtle track is strong enough to read.
        outline: '',
        soft: '',
      },
      size: {
        sm: 'size-3 data-[state=checked]:translate-x-3 [&_svg]:size-2',
        md: 'size-4 data-[state=checked]:translate-x-4 [&_svg]:size-2.5',
        lg: 'size-5 data-[state=checked]:translate-x-5 [&_svg]:size-3',
      },
      color: {
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
        neutral: '',
      },
    },
    compoundVariants: [
      // outline + soft: thumb takes the ON color when checked.
      {
        variant: 'outline',
        color: 'primary',
        class: 'data-[state=checked]:bg-primary data-[state=checked]:text-primary-contrast',
      },
      {
        variant: 'outline',
        color: 'secondary',
        class: 'data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-contrast',
      },
      {
        variant: 'outline',
        color: 'success',
        class: 'data-[state=checked]:bg-success data-[state=checked]:text-success-contrast',
      },
      {
        variant: 'outline',
        color: 'warning',
        class: 'data-[state=checked]:bg-warning data-[state=checked]:text-warning-contrast',
      },
      {
        variant: 'outline',
        color: 'danger',
        class: 'data-[state=checked]:bg-danger data-[state=checked]:text-danger-contrast',
      },
      {
        variant: 'outline',
        color: 'info',
        class: 'data-[state=checked]:bg-info data-[state=checked]:text-info-contrast',
      },
      {
        variant: 'outline',
        color: 'neutral',
        class: 'data-[state=checked]:bg-neutral data-[state=checked]:text-neutral-contrast',
      },
      {
        variant: 'soft',
        color: 'primary',
        class: 'data-[state=checked]:bg-primary data-[state=checked]:text-primary-contrast',
      },
      {
        variant: 'soft',
        color: 'secondary',
        class: 'data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-contrast',
      },
      {
        variant: 'soft',
        color: 'success',
        class: 'data-[state=checked]:bg-success data-[state=checked]:text-success-contrast',
      },
      {
        variant: 'soft',
        color: 'warning',
        class: 'data-[state=checked]:bg-warning data-[state=checked]:text-warning-contrast',
      },
      {
        variant: 'soft',
        color: 'danger',
        class: 'data-[state=checked]:bg-danger data-[state=checked]:text-danger-contrast',
      },
      {
        variant: 'soft',
        color: 'info',
        class: 'data-[state=checked]:bg-info data-[state=checked]:text-info-contrast',
      },
      {
        variant: 'soft',
        color: 'neutral',
        class: 'data-[state=checked]:bg-neutral data-[state=checked]:text-neutral-contrast',
      },
      // solid: track is filled with color, thumb stays paper-white for max contrast.
    ],
    defaultVariants: { variant: 'solid', size: 'md', color: 'primary' },
  }),
  label: cv({
    base: 'leading-tight select-none',
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: { size: 'md' },
  }),
};
