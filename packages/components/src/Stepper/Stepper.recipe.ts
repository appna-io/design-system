import { cv } from '@apx-ui/engine';

/**
 * Six-slot recipe for `<Stepper />`:
 *   - `root` — the `<ol>` container; switches axis between horizontal / vertical.
 *   - `item` — the per-step `<li>`; lays out indicator + label + (optional) content.
 *   - `interactive` — the optional `<button>` wrapping the indicator + label when steps are clickable.
 *   - `indicator` — the round circle / dot / progress chunk that carries the step glyph.
 *   - `label` — the typography slot above (or beside) the indicator.
 *   - `description` — the secondary line under the label.
 *   - `connector` — the line between two indicators.
 *
 * Recipe convention matches the rest of the DS (Tabs / Breadcrumbs / Menu): each slot is its
 * own `cv()` so `theme.components.Stepper.styleOverrides.{ root, indicator, … }` can target each
 * node independently. Variant × status combinations are written out flat — Tailwind's content
 * scanner only finds literal tokens, no interpolated `bg-${status}` strings.
 *
 * Status paint convention:
 *   - `pending`  → muted surface, muted text (the user hasn't reached this step yet).
 *   - `active`   → primary surface + accent ring (where attention should be).
 *   - `complete` → success surface, white glyph (the user finished this step).
 *   - `error`    → danger surface, white glyph (something broke; the user must fix).
 *   - `loading`  → same paint as `pending` so the Spinner reads as the focal element.
 */
export const stepperRecipes = {
  root: cv({
    base: 'flex list-none m-0 p-0',
    variants: {
      orientation: {
        horizontal: 'flex-row items-start w-full',
        vertical: 'flex-col items-stretch',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    defaultVariants: { orientation: 'horizontal', size: 'md' },
  }),
  item: cv({
    base: 'flex shrink-0 items-start',
    variants: {
      orientation: {
        horizontal: 'flex-col flex-1 min-w-0',
        vertical: 'flex-row gap-3',
      },
      align: {
        start: 'items-start text-start',
        center: 'items-center text-center',
        end: 'items-end text-end',
      },
    },
    compoundVariants: [
      // Horizontal mode keeps the indicator above its label; the `align` axis controls how the
      // label block aligns inside the column. Vertical mode keeps the indicator beside its label
      // regardless of align (the connector axis decides layout, not text alignment).
      { orientation: 'vertical', align: 'center', class: 'items-start text-start' },
      { orientation: 'vertical', align: 'end', class: 'items-start text-start' },
    ],
    defaultVariants: { orientation: 'horizontal', align: 'start' },
  }),
  interactive: cv({
    base: [
      'inline-flex items-center gap-2 rounded-md',
      'transition-colors duration-fast ease-standard',
      'cursor-pointer select-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:ring-primary',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
      'motion-reduce:transition-none',
    ].join(' '),
    variants: {
      orientation: {
        horizontal: 'flex-col',
        vertical: 'flex-row',
      },
    },
    defaultVariants: { orientation: 'horizontal' },
  }),
  indicator: cv({
    base: [
      'inline-flex items-center justify-center font-medium shrink-0',
      'transition-colors duration-fast ease-standard',
      'motion-reduce:transition-none',
    ].join(' '),
    variants: {
      variant: {
        numbered: 'rounded-full border',
        dots: 'rounded-full',
        progress: 'rounded-full',
      },
      size: {
        sm: 'h-6 w-6 text-xs',
        md: 'h-8 w-8 text-sm',
        lg: 'h-10 w-10 text-base',
      },
      status: {
        pending: 'bg-bg-subtle text-fg-muted border-border',
        active: 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/30',
        complete: 'bg-success text-success-foreground border-success',
        error: 'bg-danger text-danger-foreground border-danger',
        loading: 'bg-bg-subtle text-fg-muted border-border',
      },
    },
    compoundVariants: [
      // Dots variant ignores the numeric label and renders smaller for compact rails.
      { variant: 'dots', size: 'sm', class: 'h-2 w-2 text-[0px]' },
      { variant: 'dots', size: 'md', class: 'h-3 w-3 text-[0px]' },
      { variant: 'dots', size: 'lg', class: 'h-4 w-4 text-[0px]' },
      // Dots variant doesn't need the active ring — the dot itself reads as the active marker.
      { variant: 'dots', status: 'active', class: 'ring-0 scale-125' },
      // Progress variant doesn't paint the numeric label either; the rail conveys position.
      { variant: 'progress', size: 'sm', class: 'h-3 w-3 text-[0px]' },
      { variant: 'progress', size: 'md', class: 'h-4 w-4 text-[0px]' },
      { variant: 'progress', size: 'lg', class: 'h-5 w-5 text-[0px]' },
    ],
    defaultVariants: { variant: 'numbered', size: 'md', status: 'pending' },
  }),
  label: cv({
    base: 'font-medium leading-tight transition-colors duration-fast ease-standard motion-reduce:transition-none',
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      status: {
        pending: 'text-fg-muted',
        active: 'text-fg-default',
        complete: 'text-fg-default',
        error: 'text-danger',
        loading: 'text-fg-default',
      },
      orientation: {
        horizontal: 'mt-2',
        vertical: 'mt-0',
      },
    },
    defaultVariants: { size: 'md', status: 'pending', orientation: 'horizontal' },
  }),
  description: cv({
    base: 'leading-snug text-fg-muted mt-0.5',
    variants: {
      size: {
        sm: 'text-[11px]',
        md: 'text-xs',
        lg: 'text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  }),
  connector: cv({
    base: 'transition-colors duration-fast ease-standard motion-reduce:transition-none shrink-0',
    variants: {
      orientation: {
        // Horizontal connectors hug the indicator row baseline; we offset by half the indicator
        // height so the rule lines up with the indicator's vertical center across all sizes.
        horizontal: 'flex-1 self-start border-t-2 mx-1',
        vertical: 'self-stretch border-s-2 ms-4 my-1 min-h-[16px]',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      status: {
        pending: 'border-border',
        active: 'border-primary',
        complete: 'border-success',
        error: 'border-danger',
      },
    },
    compoundVariants: [
      // Center the horizontal connector on each indicator size so it reads as one continuous
      // line through the row of circles.
      { orientation: 'horizontal', size: 'sm', class: 'mt-[11px]' },
      { orientation: 'horizontal', size: 'md', class: 'mt-[15px]' },
      { orientation: 'horizontal', size: 'lg', class: 'mt-[19px]' },
    ],
    defaultVariants: { orientation: 'horizontal', size: 'md', status: 'pending' },
  }),
  content: cv({
    base: 'mt-2 ms-11 text-sm text-fg-default',
    variants: {
      size: {
        sm: 'ms-9 text-xs',
        md: 'ms-11 text-sm',
        lg: 'ms-13 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  }),
};
