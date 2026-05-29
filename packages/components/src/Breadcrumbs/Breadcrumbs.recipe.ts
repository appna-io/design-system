import { cv } from '@apx-ui/engine';

/**
 * Four-slot recipe for `<Breadcrumbs />`. Sizes live on the root (typography + spacing for the
 * whole strip); variants × colors live on the item; separator is paint-only; the overflow
 * trigger is its own tiny slot so theme overrides can target the ellipsis button independently.
 */
export const breadcrumbsRecipes = {
  root: cv({
    base: 'flex items-center flex-wrap',
    variants: {
      size: {
        sm: 'gap-1 text-xs',
        md: 'gap-1.5 text-sm',
        lg: 'gap-2 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  }),
  list: cv({
    base: 'flex items-center flex-wrap gap-[inherit] list-none m-0 p-0 min-w-0',
    variants: {
      size: {
        sm: 'gap-1',
        md: 'gap-1.5',
        lg: 'gap-2',
      },
    },
    defaultVariants: { size: 'md' },
  }),
  item: cv({
    base: [
      'inline-flex items-center gap-1 rounded-sm shrink-0',
      'transition-colors duration-fast ease-standard',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
      'motion-reduce:transition-none',
    ].join(' '),
    variants: {
      variant: {
        ghost: '',
        soft: '',
        underline: '',
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
      state: {
        // `link` items are interactive (anchor or asChild Link) — paint the hover affordance.
        link: 'cursor-pointer',
        // `current` items are the page indicator — non-interactive, slightly weighted.
        current: 'cursor-default font-medium text-fg-default',
      },
    },
    compoundVariants: [
      // ── ghost link colors (idle = muted; hover = role color + underline) ──────────────────
      {
        variant: 'ghost',
        state: 'link',
        color: 'primary',
        class: 'text-fg-muted hover:text-primary hover:underline focus-visible:ring-primary',
      },
      {
        variant: 'ghost',
        state: 'link',
        color: 'secondary',
        class: 'text-fg-muted hover:text-secondary hover:underline focus-visible:ring-secondary',
      },
      {
        variant: 'ghost',
        state: 'link',
        color: 'success',
        class: 'text-fg-muted hover:text-success hover:underline focus-visible:ring-success',
      },
      {
        variant: 'ghost',
        state: 'link',
        color: 'warning',
        class: 'text-fg-muted hover:text-warning hover:underline focus-visible:ring-warning',
      },
      {
        variant: 'ghost',
        state: 'link',
        color: 'danger',
        class: 'text-fg-muted hover:text-danger hover:underline focus-visible:ring-danger',
      },
      {
        variant: 'ghost',
        state: 'link',
        color: 'info',
        class: 'text-fg-muted hover:text-info hover:underline focus-visible:ring-info',
      },
      {
        variant: 'ghost',
        state: 'link',
        color: 'neutral',
        class: 'text-fg-muted hover:text-fg-default hover:underline focus-visible:ring-neutral',
      },
      // ── soft link colors (idle = tinted role color; hover = solid role color) ─────────────
      {
        variant: 'soft',
        state: 'link',
        color: 'primary',
        class: 'text-primary/70 hover:text-primary focus-visible:ring-primary',
      },
      {
        variant: 'soft',
        state: 'link',
        color: 'secondary',
        class: 'text-secondary/70 hover:text-secondary focus-visible:ring-secondary',
      },
      {
        variant: 'soft',
        state: 'link',
        color: 'success',
        class: 'text-success/70 hover:text-success focus-visible:ring-success',
      },
      {
        variant: 'soft',
        state: 'link',
        color: 'warning',
        class: 'text-warning/70 hover:text-warning focus-visible:ring-warning',
      },
      {
        variant: 'soft',
        state: 'link',
        color: 'danger',
        class: 'text-danger/70 hover:text-danger focus-visible:ring-danger',
      },
      {
        variant: 'soft',
        state: 'link',
        color: 'info',
        class: 'text-info/70 hover:text-info focus-visible:ring-info',
      },
      {
        variant: 'soft',
        state: 'link',
        color: 'neutral',
        class: 'text-fg-muted hover:text-fg-default focus-visible:ring-neutral',
      },
      // ── underline link colors (idle = role color underlined; hover = brighten) ────────────
      {
        variant: 'underline',
        state: 'link',
        color: 'primary',
        class:
          'text-primary underline decoration-2 underline-offset-2 hover:opacity-80 focus-visible:ring-primary',
      },
      {
        variant: 'underline',
        state: 'link',
        color: 'secondary',
        class:
          'text-secondary underline decoration-2 underline-offset-2 hover:opacity-80 focus-visible:ring-secondary',
      },
      {
        variant: 'underline',
        state: 'link',
        color: 'success',
        class:
          'text-success underline decoration-2 underline-offset-2 hover:opacity-80 focus-visible:ring-success',
      },
      {
        variant: 'underline',
        state: 'link',
        color: 'warning',
        class:
          'text-warning underline decoration-2 underline-offset-2 hover:opacity-80 focus-visible:ring-warning',
      },
      {
        variant: 'underline',
        state: 'link',
        color: 'danger',
        class:
          'text-danger underline decoration-2 underline-offset-2 hover:opacity-80 focus-visible:ring-danger',
      },
      {
        variant: 'underline',
        state: 'link',
        color: 'info',
        class:
          'text-info underline decoration-2 underline-offset-2 hover:opacity-80 focus-visible:ring-info',
      },
      {
        variant: 'underline',
        state: 'link',
        color: 'neutral',
        class:
          'text-fg-default underline decoration-2 underline-offset-2 hover:opacity-80 focus-visible:ring-neutral',
      },
    ],
    defaultVariants: { variant: 'ghost', color: 'neutral', state: 'link' },
  }),
  separator: cv({
    base: 'inline-flex items-center select-none shrink-0',
    variants: {
      color: {
        muted: 'text-fg-muted',
        subtle: 'text-fg-subtle',
        inherit: 'text-inherit',
      },
    },
    defaultVariants: { color: 'muted' },
  }),
  overflowTrigger: cv({
    base: [
      'inline-flex items-center justify-center rounded-sm px-1.5 py-0.5 shrink-0',
      'text-fg-muted hover:text-fg-default hover:bg-bg-subtle',
      'transition-colors duration-fast ease-standard',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:ring-neutral',
      'cursor-pointer',
    ].join(' '),
    variants: {
      size: {
        sm: 'text-xs [&_svg]:size-3',
        md: 'text-sm [&_svg]:size-3.5',
        lg: 'text-base [&_svg]:size-4',
      },
    },
    defaultVariants: { size: 'md' },
  }),
};
