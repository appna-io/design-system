import { cv } from '@apx-ui/engine';

/**
 * Seven-slot recipe for `<Slider />`. The slots are intentionally small + composable so theme
 * authors can re-skin any one independently:
 *
 *   root        — outer `<div>`. Owns orientation + disabled visual state.
 *   track       — the off-state rail. Variant changes its tone but not its length.
 *   fill        — the on-state colored portion between min thumb and max thumb.
 *   thumb       — each draggable handle. `data-dragging` triggers the scale-up, `data-focus`
 *                 paints the colored focus ring.
 *   mark        — small tick dot at a given mark value.
 *   markLabel   — caption text beside a mark.
 *   valueLabel  — floating value bubble above (horizontal) / beside (vertical) each thumb.
 *
 * **Compound-variant minimization.** The plan's sketch suggests ~28 cells per color-aware slot;
 * we collapse most of those by:
 *   - giving each `color` a `bg-<color>` / `border-<color>` base, then
 *   - using `variant` only as an opacity / -subtle tone modifier.
 * Net: 7 compound cells on `fill`, 21 on `thumb`. Total ~35 cells across the namespace,
 * comfortably under the < 3 KB gz bundle target.
 */
export const sliderRecipes = {
  root: cv({
    base: [
      'group/slider relative inline-flex',
      'data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed',
    ].join(' '),
    variants: {
      orientation: {
        horizontal: 'w-full flex-row items-center min-h-6',
        vertical: 'h-full flex-col items-center min-w-6',
      },
    },
    defaultVariants: { orientation: 'horizontal' },
  }),

  track: cv({
    base: [
      'relative shrink-0 rounded-full bg-bg-subtle',
      'touch-none select-none',
      'transition-colors duration-fast ease-standard motion-reduce:transition-none',
    ].join(' '),
    variants: {
      variant: {
        solid: '',
        outline: 'bg-transparent border border-border',
        soft: '',
        minimal: '',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      orientation: {
        horizontal: 'w-full',
        vertical: 'h-full inline-block',
      },
    },
    compoundVariants: [
      // size × orientation: thickness lives on the non-major axis only.
      { orientation: 'horizontal', size: 'sm', class: 'h-1' },
      { orientation: 'horizontal', size: 'md', class: 'h-1.5' },
      { orientation: 'horizontal', size: 'lg', class: 'h-2' },
      { orientation: 'vertical', size: 'sm', class: 'w-1' },
      { orientation: 'vertical', size: 'md', class: 'w-1.5' },
      { orientation: 'vertical', size: 'lg', class: 'w-2' },
    ],
    defaultVariants: { variant: 'solid', size: 'md', orientation: 'horizontal' },
  }),

  fill: cv({
    base: [
      'absolute rounded-full',
      'transition-[inset-inline-start,inset-block-end,width,height] duration-fast ease-standard',
      'motion-reduce:transition-none',
      'data-[dragging=true]:transition-none',
    ].join(' '),
    variants: {
      color: {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        success: 'bg-success',
        warning: 'bg-warning',
        danger: 'bg-danger',
        info: 'bg-info',
        neutral: 'bg-neutral',
      },
      variant: {
        solid: '',
        outline: '',
        soft: '',
        minimal: 'opacity-70',
      },
      orientation: {
        horizontal: 'h-full top-0',
        vertical: 'w-full start-0',
      },
    },
    compoundVariants: [
      // soft variant: filled track uses the -subtle tone so the colored thumb provides contrast.
      { variant: 'soft', color: 'primary', class: 'bg-primary-subtle' },
      { variant: 'soft', color: 'secondary', class: 'bg-secondary-subtle' },
      { variant: 'soft', color: 'success', class: 'bg-success-subtle' },
      { variant: 'soft', color: 'warning', class: 'bg-warning-subtle' },
      { variant: 'soft', color: 'danger', class: 'bg-danger-subtle' },
      { variant: 'soft', color: 'info', class: 'bg-info-subtle' },
      { variant: 'soft', color: 'neutral', class: 'bg-neutral-subtle' },
    ],
    defaultVariants: { variant: 'solid', color: 'primary', orientation: 'horizontal' },
  }),

  thumb: cv({
    base: [
      'absolute block rounded-full bg-bg-paper border-2 shadow-sm',
      'cursor-grab touch-none select-none',
      '-translate-x-1/2 -translate-y-1/2',
      'transition-[transform,box-shadow,background-color,border-color] duration-fast ease-standard',
      'motion-reduce:transition-none',
      'data-[dragging=true]:scale-110 data-[dragging=true]:cursor-grabbing',
      'data-[dragging=true]:shadow-md',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
      'data-[invalid=true]:ring-2 data-[invalid=true]:ring-danger',
      // outline / soft / minimal: fill the thumb with the color. Driven by `data-variant` instead
      // of 21 compoundVariant cells — each `color.<x>` axis paints `text-<x>` once, and
      // `bg-current` pulls the bg from the same color token. Cuts the recipe by ~1.5 KB gz.
      'data-[variant=outline]:bg-current data-[variant=soft]:bg-current data-[variant=minimal]:bg-current',
    ].join(' '),
    variants: {
      size: {
        sm: 'h-[14px] w-[14px]',
        md: 'h-[18px] w-[18px]',
        lg: 'h-[22px] w-[22px]',
      },
      orientation: {
        horizontal: 'top-1/2',
        vertical: 'start-1/2',
      },
      variant: {
        solid: '',
        outline: '',
        soft: '',
        minimal: 'border-0',
      },
      color: {
        primary: 'text-primary border-primary focus-visible:ring-primary',
        secondary: 'text-secondary border-secondary focus-visible:ring-secondary',
        success: 'text-success border-success focus-visible:ring-success',
        warning: 'text-warning border-warning focus-visible:ring-warning',
        danger: 'text-danger border-danger focus-visible:ring-danger',
        info: 'text-info border-info focus-visible:ring-info',
        neutral: 'text-neutral border-neutral focus-visible:ring-neutral',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
      color: 'primary',
      orientation: 'horizontal',
    },
  }),

  mark: cv({
    base: [
      'absolute size-1 rounded-full bg-fg-muted/60',
      '-translate-x-1/2 -translate-y-1/2',
      'data-[active=true]:bg-bg-paper',
      'pointer-events-none',
    ].join(' '),
    variants: {
      orientation: {
        horizontal: 'top-1/2',
        vertical: 'start-1/2',
      },
    },
    defaultVariants: { orientation: 'horizontal' },
  }),

  markLabel: cv({
    base: 'absolute text-fg-muted whitespace-nowrap pointer-events-none select-none',
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      orientation: {
        horizontal: 'top-full mt-2 -translate-x-1/2',
        vertical: 'start-full ms-2 -translate-y-1/2',
      },
    },
    defaultVariants: { size: 'md', orientation: 'horizontal' },
  }),

  valueLabel: cv({
    base: [
      'absolute px-2 py-0.5 rounded-md',
      'bg-fg text-bg text-xs font-medium whitespace-nowrap',
      'pointer-events-none select-none shadow-sm',
      'transition-opacity duration-fast ease-standard motion-reduce:transition-none',
      'data-[visible=true]:opacity-100 data-[visible=false]:opacity-0',
    ].join(' '),
    variants: {
      orientation: {
        horizontal: 'bottom-full mb-2 -translate-x-1/2 left-0',
        vertical: 'start-full ms-2 -translate-y-1/2 top-0',
      },
    },
    defaultVariants: { orientation: 'horizontal' },
  }),
};
