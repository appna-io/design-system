import { cv } from '@apx-ui/engine';

/**
 * Multi-slot recipe family for `<EmptyState />`.
 *
 * Six slots map 1:1 to the six exported components: `root`, `icon`, `illustration`, `title`,
 * `description`, `actions`. Each slot is themable independently via
 * `theme.components.EmptyState.styleOverrides.<slot>`.
 *
 * **Color tokens** use the shipped Tailwind preset utilities (`text-fg-muted`,
 * `bg-bg-subtle`, `bg-danger-subtle`, `text-danger`, …) — these resolve to `--sds-palette-*` CSS
 * variables, so the empty surface re-tints automatically when the active theme (Katana / Tetsu /
 * Origami / custom) flips. The plan's `text-(--sds-color-text-muted)` syntax pre-dates the
 * shipped preset; the utility classes below produce the same end CSS variables.
 */

const emptyStateRoot = cv({
  base: 'flex w-full flex-col',
  variants: {
    align: {
      center: 'items-center text-center',
      start: 'items-start text-start',
    },
    size: {
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
    },
    padded: {
      true: '',
      false: '',
    },
    bordered: {
      true: 'rounded-lg border-2 border-dashed border-border-subtle',
      false: '',
    },
    variant: {
      default: '',
      error: '',
      loading: '',
      success: '',
    },
  },
  compoundVariants: [
    // ── padded × size — padding cadence ──────────────────────────────────────────────────────────
    { padded: true, size: 'sm', class: 'py-6 px-4' },
    { padded: true, size: 'md', class: 'py-10 px-6' },
    { padded: true, size: 'lg', class: 'py-16 px-8' },
    // When `padded={false}` the consumer's wrapper owns the spacing — keep the root tight.
    { padded: false, size: 'sm', class: 'p-0' },
    { padded: false, size: 'md', class: 'p-0' },
    { padded: false, size: 'lg', class: 'p-0' },
  ],
  defaultVariants: {
    align: 'center',
    size: 'md',
    padded: true,
    bordered: false,
    variant: 'default',
  },
});

const emptyStateIcon = cv({
  base: 'inline-flex items-center justify-center rounded-full shrink-0',
  variants: {
    size: {
      sm: 'h-10 w-10 [&>svg]:h-5 [&>svg]:w-5',
      md: 'h-14 w-14 [&>svg]:h-7 [&>svg]:w-7',
      lg: 'h-20 w-20 [&>svg]:h-10 [&>svg]:w-10',
    },
    variant: {
      default: 'bg-bg-subtle text-fg-muted',
      error: 'bg-danger-subtle text-danger',
      loading: 'bg-bg-subtle text-fg-muted',
      success: 'bg-success-subtle text-success',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

const emptyStateIllustration = cv({
  base: 'inline-flex items-center justify-center shrink-0',
  variants: {
    size: {
      sm: 'max-w-[120px]',
      md: 'max-w-[200px]',
      lg: 'max-w-[320px]',
    },
  },
  defaultVariants: { size: 'md' },
});

const emptyStateTitle = cv({
  base: 'font-semibold leading-snug text-fg-default m-0',
  variants: {
    size: {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
    },
  },
  defaultVariants: { size: 'md' },
});

const emptyStateDescription = cv({
  base: 'text-fg-muted max-w-md leading-relaxed m-0',
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: { size: 'md' },
});

const emptyStateActions = cv({
  base: 'inline-flex flex-wrap gap-2 mt-2',
  variants: {
    align: {
      center: 'justify-center',
      start: 'justify-start',
    },
  },
  defaultVariants: { align: 'center' },
});

export const emptyStateRecipes = {
  root: emptyStateRoot,
  icon: emptyStateIcon,
  illustration: emptyStateIllustration,
  title: emptyStateTitle,
  description: emptyStateDescription,
  actions: emptyStateActions,
};
