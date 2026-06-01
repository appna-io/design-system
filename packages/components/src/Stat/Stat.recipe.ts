import { cv } from '@apx-ui/engine';

/**
 * Root tile chrome. Three variants: a transparent default (use inside a card or page),
 * `elevated` (self-contained surface with border + shadow), `minimal` (tight, no chrome).
 * `align` is logical (`text-start` / `text-end`) so RTL flips for free.
 */
export const statRecipe = cv({
  base: 'flex min-w-0 flex-col',
  variants: {
    variant: {
      default: '',
      elevated:
        'rounded-md border border-border-subtle bg-bg-paper p-4 shadow-sm',
      minimal: 'gap-0.5',
    },
    size: {
      sm: 'gap-0.5',
      md: 'gap-1',
      lg: 'gap-1.5',
    },
    align: {
      start: 'items-start text-start',
      center: 'items-center text-center',
      end: 'items-end text-end',
    },
  },
  defaultVariants: { variant: 'default', size: 'md', align: 'start' },
});

/** Header row: optional icon + label, side by side. */
export const statHeaderRecipe = cv({
  base: 'inline-flex items-center gap-1.5 text-fg-muted',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm',
    },
  },
  defaultVariants: { size: 'md' },
});

export const statIconRecipe = cv({
  base: 'inline-flex shrink-0 items-center justify-center text-fg-muted',
  variants: {
    size: {
      sm: '[&_svg]:size-3.5',
      md: '[&_svg]:size-4',
      lg: '[&_svg]:size-5',
    },
  },
  defaultVariants: { size: 'md' },
});

export const statLabelRecipe = cv({
  base: 'truncate font-medium text-fg-muted',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm',
    },
  },
  defaultVariants: { size: 'md' },
});

/**
 * Value text. `tabular-nums` ensures digit widths don't wobble between renders — critical
 * for live-updating dashboards. `leading-tight` keeps stacked value+caption rhythm clean.
 */
export const statValueRecipe = cv({
  base: 'block font-semibold leading-tight tracking-tight text-fg-default tabular-nums',
  variants: {
    size: {
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-4xl',
    },
    tone: {
      neutral: '',
      positive: 'text-success',
      negative: 'text-danger',
    },
  },
  defaultVariants: { size: 'md', tone: 'neutral' },
});

/** Chip row showing arrow + formatted delta. Color comes from tone token. */
export const statDeltaRecipe = cv({
  base: 'inline-flex items-center gap-1 font-medium tabular-nums',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm',
    },
    tone: {
      positive: 'text-success',
      negative: 'text-danger',
      neutral: 'text-fg-muted',
    },
  },
  defaultVariants: { size: 'md', tone: 'neutral' },
});

export const statCaptionRecipe = cv({
  base: 'text-fg-muted',
  variants: {
    size: {
      sm: 'text-[11px]',
      md: 'text-xs',
      lg: 'text-sm',
    },
  },
  defaultVariants: { size: 'md' },
});

/** Wrapper for slotted extras (e.g. sparklines) — adds vertical breathing room. */
export const statExtraRecipe = cv({
  base: 'mt-2 w-full',
});

/** Error message styling — uses danger token, smaller font than value. */
export const statErrorRecipe = cv({
  base: 'text-sm text-danger',
});

/** StatGroup wrapper — controls flex axis, gap, alignment, and justification. */
export const statGroupRecipe = cv({
  base: 'flex min-w-0',
  variants: {
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
  },
  defaultVariants: { align: 'stretch', justify: 'start' },
});