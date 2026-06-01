import { cv } from '@apx-ui/engine';

/**
 * Two recipes for `<HoverCard>` — `content` (the floating surface) and `arrow` (the SVG tip).
 * Mirrors Popover's recipe shape because HoverCard intentionally shares the same visual
 * vocabulary (3 variants × 7 colors compound matrix written out flat for Tailwind's literal
 * scanner). The only delta vs Popover is bundle scope: HoverCard ships with arrow on by default,
 * carries no `close` button (additive overlay, no dismiss UI), and no backdrop (never modal).
 *
 * 14 compound rows total: 7 outline + 7 soft (solid is color-neutral and lives on the variant
 * row directly). Same DRY justification as Badge / Alert / Tooltip / Popover.
 */
export const hoverCardContentRecipe = cv({
  base: [
    'group/hover-card',
    'relative outline-none',
    'rounded-md border bg-bg-paper text-fg-default',
    'shadow-lg',
    'z-overlay',
    'transition-[opacity,transform] duration-fast ease-standard',
    'focus-visible:outline-none',
  ].join(' '),
  variants: {
    variant: {
      solid:
        'border-border-default [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-border-default',
      outline: '',
      soft: '',
    },
    size: {
      sm: 'p-3 min-w-48 max-w-xs text-sm',
      md: 'p-4 min-w-56 max-w-sm text-sm',
      lg: 'p-5 min-w-72 max-w-md text-base',
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
    // outline (7) — paper bg, colored border. Arrow fill = paper bg; stroke = border color.
    {
      variant: 'outline',
      color: 'primary',
      class:
        'border-primary [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-primary',
    },
    {
      variant: 'outline',
      color: 'secondary',
      class:
        'border-secondary [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-secondary',
    },
    {
      variant: 'outline',
      color: 'success',
      class:
        'border-success [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-success',
    },
    {
      variant: 'outline',
      color: 'warning',
      class:
        'border-warning [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-warning',
    },
    {
      variant: 'outline',
      color: 'danger',
      class:
        'border-danger [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-danger',
    },
    {
      variant: 'outline',
      color: 'info',
      class: 'border-info [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-info',
    },
    {
      variant: 'outline',
      color: 'neutral',
      class:
        'border-neutral [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-neutral',
    },
    // soft (7) — subtle tint + colored text + low-opacity border. Arrow fill = tint; stroke = /30 border.
    {
      variant: 'soft',
      color: 'primary',
      class:
        'bg-primary-subtle text-primary border-primary/30 [&_[data-arrow-fill]]:fill-primary-subtle [&_[data-arrow-stroke]]:stroke-primary/30',
    },
    {
      variant: 'soft',
      color: 'secondary',
      class:
        'bg-secondary-subtle text-secondary border-secondary/30 [&_[data-arrow-fill]]:fill-secondary-subtle [&_[data-arrow-stroke]]:stroke-secondary/30',
    },
    {
      variant: 'soft',
      color: 'success',
      class:
        'bg-success-subtle text-success border-success/30 [&_[data-arrow-fill]]:fill-success-subtle [&_[data-arrow-stroke]]:stroke-success/30',
    },
    {
      variant: 'soft',
      color: 'warning',
      class:
        'bg-warning-subtle text-warning border-warning/30 [&_[data-arrow-fill]]:fill-warning-subtle [&_[data-arrow-stroke]]:stroke-warning/30',
    },
    {
      variant: 'soft',
      color: 'danger',
      class:
        'bg-danger-subtle text-danger border-danger/30 [&_[data-arrow-fill]]:fill-danger-subtle [&_[data-arrow-stroke]]:stroke-danger/30',
    },
    {
      variant: 'soft',
      color: 'info',
      class:
        'bg-info-subtle text-info border-info/30 [&_[data-arrow-fill]]:fill-info-subtle [&_[data-arrow-stroke]]:stroke-info/30',
    },
    {
      variant: 'soft',
      color: 'neutral',
      class:
        'bg-neutral-subtle text-neutral border-neutral/30 [&_[data-arrow-fill]]:fill-neutral-subtle [&_[data-arrow-stroke]]:stroke-neutral/30',
    },
  ],
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    color: 'neutral',
  },
});

/** Sizes the SVG arrow; fill / stroke colors come from the parent surface via group selectors. */
export const hoverCardArrowRecipe = cv({
  base: 'pointer-events-none absolute',
  variants: {
    size: {
      sm: 'h-1.5 w-3',
      md: 'h-2 w-4',
      lg: 'h-2.5 w-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});