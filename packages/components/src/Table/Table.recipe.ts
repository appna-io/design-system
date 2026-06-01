import { cv } from '@apx-ui/engine';

/**
 * Root `<table>` chrome. We use `border-separate border-spacing-0` (rather than
 * `border-collapse`) so per-cell borders, sticky headers, and zebra backgrounds all compose
 * cleanly without the well-known `border-collapse` glitches around `position: sticky` and
 * background-color bleed-through.
 *
 * Visual axes are deliberately split: `variant` owns chrome (card border, rounded corners),
 * `bordered` / `striped` / `hoverable` are independent boolean toggles. That lets a consumer
 * mix and match — bordered+striped, card+hoverable, minimal+nothing — without exploding the
 * recipe surface.
 */
export const tableRootRecipe = cv({
  base: 'w-full table-auto border-separate border-spacing-0 text-fg-default text-sm',
  variants: {
    variant: {
      default: '',
      card: 'overflow-hidden rounded-md border border-border-subtle',
      minimal: '',
    },
  },
  defaultVariants: { variant: 'default' },
});

/**
 * Wrapper `<div>` for sticky-header layouts. Pure passthrough today — consumers who want a
 * fixed-height scrolling table wrap the `<Table>` themselves. The recipe exists so theme
 * overrides can target a single "viewport" slot.
 */
export const tableScrollerRecipe = cv({
  base: 'relative w-full overflow-auto',
});

/**
 * Body cell. `align` is logical; `truncate` collapses overflowing text with an ellipsis. The
 * density variants control vertical padding and font size in one move so the rhythm stays
 * consistent across the header / body / footer rows.
 */
export const tableCellRecipe = cv({
  base: 'align-middle',
  variants: {
    density: {
      sm: 'px-2 py-1.5 text-xs',
      md: 'px-3 py-2.5 text-sm',
      lg: 'px-4 py-3.5 text-base',
    },
    align: {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
    },
    truncate: {
      true: 'max-w-0 truncate',
      false: '',
    },
    bordered: {
      true: 'border-b border-border-subtle',
      false: '',
    },
  },
  defaultVariants: {
    density: 'md',
    align: 'start',
    truncate: false,
    bordered: true,
  },
});

/**
 * Header cell. Pulls from the same density ladder as body cells but with a slightly lighter
 * vertical padding (headers tend to look better at a tighter rhythm). `sortable` adds the
 * cursor + hover state; `sortActive` tints the active column with the accent color so it
 * reads even on a busy table.
 */
export const tableHeaderCellRecipe = cv({
  base: 'bg-bg-subtle font-medium text-fg-muted',
  variants: {
    density: {
      sm: 'px-2 py-1.5 text-xs',
      md: 'px-3 py-2 text-xs',
      lg: 'px-4 py-2.5 text-sm',
    },
    align: {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
    },
    sortable: {
      true: 'cursor-pointer select-none hover:text-fg-default',
      false: '',
    },
    sortActive: {
      true: 'text-fg-default',
      false: '',
    },
    sticky: {
      true: 'sticky top-0 z-10',
      false: '',
    },
    bordered: {
      true: 'border-b border-border-subtle',
      false: '',
    },
  },
  defaultVariants: {
    density: 'md',
    align: 'start',
    sortable: false,
    sortActive: false,
    sticky: false,
    bordered: true,
  },
});

/**
 * Header sort button — used inside the `<th>` to wrap the label + sort indicator so the
 * clickable target is an actual `<button>` (not the cell itself). Inherits color from the
 * parent cell; the focus ring is the only chrome we add.
 */
export const tableSortButtonRecipe = cv({
  base: 'inline-flex w-full items-center gap-1.5 rounded-sm bg-transparent text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1',
  variants: {
    align: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
    },
  },
  defaultVariants: { align: 'start' },
});

/**
 * Row chrome. We keep tones (selected / hoverable / striped) as data-attribute-driven CSS
 * rather than recipe compound variants — that lets a single `<tr>` carry independent
 * selected + hover + stripe states without the recipe exploding.
 */
export const tableRowRecipe = cv({
  base: 'group transition-colors data-[disabled=true]:opacity-50 data-[selected=true]:bg-primary-subtle/40',
  variants: {
    hoverable: {
      true: 'hover:bg-bg-subtle/60 data-[disabled=true]:hover:bg-transparent',
      false: '',
    },
    striped: {
      true: 'odd:bg-bg-subtle/30',
      false: '',
    },
    interactive: {
      true: 'cursor-pointer',
      false: '',
    },
  },
  defaultVariants: { hoverable: true, striped: false, interactive: false },
});

/** Caption slot — `<caption>` rendered above the table for accessible naming. */
export const tableCaptionRecipe = cv({
  base: 'text-fg-muted caption-top py-2 text-start text-sm',
  variants: {
    visuallyHidden: {
      true: 'sr-only',
      false: '',
    },
  },
  defaultVariants: { visuallyHidden: false },
});

/**
 * Sticky-position helper for the leading selection column and the trailing actions column.
 * The trailing column gets `inset-inline-end-0`; the leading column would get
 * `inset-inline-start-0` (added at the call site since the recipe is shared).
 */
export const tableStickyColRecipe = cv({
  base: 'sticky bg-bg-default',
  variants: {
    side: {
      start: 'left-0 z-[1]',
      end: 'right-0 z-[1]',
    },
  },
  defaultVariants: { side: 'end' },
});

/** Empty / loading wrapper rendered inside a full-width `<td colSpan>` cell. */
export const tableEmptyRecipe = cv({
  base: 'py-6 text-center text-fg-muted',
});