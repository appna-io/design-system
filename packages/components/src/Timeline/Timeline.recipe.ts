import { cv } from '@apx-ui/engine';

/**
 * Root `<ol>` chrome. The `list-none m-0 p-0` triplet zeros the browser-default list styling so
 * our visual indicators (dots + connector) own the rhythm rather than fighting browser bullets.
 * `responsive` is a separate boolean knob layered with `orientation` so a horizontal+responsive
 * timeline collapses to vertical at `< md`. We emit literal Tailwind utilities only — no
 * `[direction]` arbitrary values, no string interpolation, JIT-safe.
 */
export const timelineRecipe = cv({
  base: 'relative m-0 list-none p-0',
  variants: {
    orientation: {
      vertical: 'flex flex-col',
      horizontal: 'flex flex-row gap-6 overflow-x-auto pb-2',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
    responsive: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      responsive: true,
      class: 'max-md:flex-col max-md:gap-0 max-md:overflow-x-visible',
    },
  ],
  defaultVariants: { orientation: 'vertical', size: 'md', responsive: false },
});

/**
 * Per-item wrapper (`<li>`). A 2-column CSS grid puts the indicator column on the logical-start
 * side and the content column on the rest of the row for vertical orientation; horizontal puts
 * the indicator on top via 2-row grid. `alternating` flips the column order on even items so the
 * content reads left/right/left/right down the rail. The `min-h-*` floor prevents two items
 * stacking into a single visual cell when their content is empty.
 */
export const timelineItemRecipe = cv({
  base: 'relative grid min-w-0 gap-x-3 gap-y-1',
  variants: {
    orientation: {
      vertical:
        'grid-cols-[auto_minmax(0,1fr)] [grid-template-areas:"indicator_content"_"connector_content"]',
      horizontal:
        'min-w-[200px] grid-rows-[auto_auto_1fr] [grid-template-areas:"indicator"_"connector"_"content"]',
    },
    layout: {
      single: '',
      alternating: '',
    },
    size: {
      sm: 'pb-3',
      md: 'pb-4',
      lg: 'pb-6',
    },
  },
  compoundVariants: [
    // Drop the trailing padding from the last visual cell — there's no next item to space against.
    {
      orientation: 'horizontal',
      size: 'sm',
      class: 'pb-0',
    },
    {
      orientation: 'horizontal',
      size: 'md',
      class: 'pb-0',
    },
    {
      orientation: 'horizontal',
      size: 'lg',
      class: 'pb-0',
    },
    // Alternating layout (vertical only) flips even items' column order via direct overrides.
    // We use real grid columns rather than `[direction:rtl]` so the flip is fully logical-aware
    // and screen-reader order stays in document order.
    {
      orientation: 'vertical',
      layout: 'alternating',
      class:
        'md:[&:nth-child(even)]:grid-cols-[minmax(0,1fr)_auto] md:[&:nth-child(even)]:[grid-template-areas:"content_indicator"_"content_connector"] md:[&:nth-child(even)>[data-timeline-content]]:text-end',
    },
  ],
  defaultVariants: { orientation: 'vertical', layout: 'single', size: 'md' },
});

/**
 * Indicator dot. Five tones × 2 active states. Each tone leans on the palette role pair —
 * subtle background + role-colored border + role-colored icon — so it stays legible in both
 * light and dark themes without per-mode overrides. `neutral` falls back to the bg/border
 * tokens since there's no "neutral" role pair (it's a special case).
 */
export const timelineDotRecipe = cv({
  base: 'relative inline-flex shrink-0 items-center justify-center rounded-full border-2',
  variants: {
    size: {
      sm: 'size-5 [&_svg]:size-2.5',
      md: 'size-6 [&_svg]:size-3.5',
      lg: 'size-8 [&_svg]:size-4',
    },
    tone: {
      info: 'border-info bg-info-subtle text-info',
      success: 'border-success bg-success-subtle text-success',
      warning: 'border-warning bg-warning-subtle text-warning',
      danger: 'border-danger bg-danger-subtle text-danger',
      neutral: 'border-border bg-bg-subtle text-fg-muted',
    },
    active: {
      true: 'ring-4 ring-current/20 motion-safe:animate-pulse',
      false: '',
    },
  },
  defaultVariants: { size: 'md', tone: 'neutral', active: false },
});

/**
 * Connector line. Renders as a real `<span aria-hidden>` rather than a pseudo-element so the
 * Tailwind JIT scanner picks up every utility. Vertical orientation paints a 1px wide rail
 * between the dot bottom and the next item's dot top; horizontal paints a 1px tall rail.
 * The last item hides its connector via `[&:last-child_[data-timeline-connector]]:hidden` on
 * the parent's recipe pass.
 */
export const timelineConnectorRecipe = cv({
  base: 'block bg-border-subtle',
  variants: {
    orientation: {
      vertical: 'mx-auto w-px flex-1 [grid-area:connector]',
      horizontal: 'my-auto h-px flex-1 [grid-area:connector]',
    },
  },
  defaultVariants: { orientation: 'vertical' },
});

/** Indicator column wrapper — owns the dot + connector and pins them in the grid template. */
export const timelineIndicatorRecipe = cv({
  base: 'flex shrink-0 [grid-area:indicator]',
  variants: {
    orientation: {
      vertical: 'flex-col items-center',
      horizontal: 'flex-row items-center',
    },
  },
  defaultVariants: { orientation: 'vertical' },
});

/** Content panel — wraps title / description / media / timestamp. */
export const timelineContentRecipe = cv({
  base: 'min-w-0 [grid-area:content]',
  variants: {
    size: {
      sm: 'space-y-0.5',
      md: 'space-y-1',
      lg: 'space-y-1.5',
    },
  },
  defaultVariants: { size: 'md' },
});

export const timelineTitleRecipe = cv({
  base: 'font-medium text-fg-default',
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    },
    interactive: {
      true: 'inline-flex cursor-pointer items-center gap-1 rounded-sm text-start hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1',
      false: '',
    },
  },
  defaultVariants: { size: 'md', interactive: false },
});

export const timelineDescriptionRecipe = cv({
  base: 'text-fg-muted',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm',
    },
  },
  defaultVariants: { size: 'md' },
});

export const timelineTimestampRecipe = cv({
  base: 'block text-fg-subtle tabular-nums',
  variants: {
    size: {
      sm: 'text-[11px]',
      md: 'text-xs',
      lg: 'text-xs',
    },
  },
  defaultVariants: { size: 'md' },
});

export const timelineMediaRecipe = cv({
  base: 'mt-2 overflow-hidden rounded-md',
});
