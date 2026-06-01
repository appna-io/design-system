import { cv } from '@apx-ui/engine';

/* -------------------------------------------------------------------------- */
/*  Root wrapper                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Outer container — the `<div>` that holds the toolbar, scroller, table, pagination, and
 * the screen-reader live region. Borders + rounded corners + elevation are configured
 * here so the chrome can wrap virtualized + non-virtualized tables identically.
 *
 * `isolate` creates a new stacking context so sticky header / sticky pinned columns
 * don't bleed their z-index into the surrounding page (a known pain point for tables
 * inside complex layouts).
 */
export const dataGridRootRecipe = cv({
  base: 'isolate relative flex w-full flex-col text-fg-default',
  variants: {
    variant: {
      solid: 'bg-bg-paper',
      outline: 'bg-bg-paper',
      striped: 'bg-bg-paper',
      minimal: 'bg-transparent',
    },
    bordered: {
      true: 'border border-border',
      false: '',
    },
    roundedCorners: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
    },
    elevation: {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    },
  },
  compoundVariants: [
    // The minimal variant doesn't get an outer border by default — strip it even if
    // `bordered=true` was inherited from the theme defaultProps.
    { variant: 'minimal', bordered: true, class: 'border-0' },
  ],
  defaultVariants: {
    variant: 'solid',
    bordered: true,
    roundedCorners: 'md',
    elevation: 'none',
  },
});

/* -------------------------------------------------------------------------- */
/*  Scroller — holds the table; owns horizontal/vertical overflow              */
/* -------------------------------------------------------------------------- */

/**
 * Wraps the `<table>` so the consumer can fix its height (with `style={{ maxHeight }}`)
 * and get a vertical scrollbar while the sticky header continues to work. Pure
 * passthrough today; theme overrides can target the `scroller` slot.
 */
export const dataGridScrollerRecipe = cv({
  base: 'relative w-full overflow-auto',
});

/* -------------------------------------------------------------------------- */
/*  <table>                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The `<table>` itself. `border-separate border-spacing-0` keeps sticky positioning
 * (header + pinned columns, PR 5) glitch-free; `border-collapse` famously breaks both.
 * `table-fixed` is *not* used here — column widths are driven by per-column inline
 * styles (`column.width`), with auto-sizing for the rest.
 */
export const dataGridTableRecipe = cv({
  base: 'w-full border-separate border-spacing-0 text-start text-sm',
  variants: {
    density: {
      compact: 'text-xs',
      standard: 'text-sm',
      comfortable: 'text-base',
    },
  },
  defaultVariants: { density: 'standard' },
});

/* -------------------------------------------------------------------------- */
/*  <thead>                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Header section. `sticky top-0` keeps it visible while the body scrolls; the inline
 * background is critical so cells underneath don't bleed through (a known sticky
 * `<thead>` quirk).
 */
export const dataGridTheadRecipe = cv({
  base: '',
  variants: {
    stickyHeader: {
      true: 'sticky top-0 z-[2]',
      false: '',
    },
    variant: {
      solid: 'bg-bg-subtle',
      outline: 'bg-bg-paper',
      striped: 'bg-bg-subtle',
      minimal: 'bg-transparent',
    },
  },
  defaultVariants: { stickyHeader: true, variant: 'solid' },
});

/* -------------------------------------------------------------------------- */
/*  <th>                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Header cell. Density rows mirror the body cell ladder + 4px (headers tend to read
 * better at slightly more breathing room). `sortable` flips the cursor and adds a
 * subtle hover lift; `sortActive` darkens the label so the active column is obvious
 * in a wide table.
 */
export const dataGridThRecipe = cv({
  base: 'relative select-none whitespace-nowrap text-start align-middle font-semibold text-fg-default',
  variants: {
    density: {
      compact: 'h-9 px-3 text-xs',
      standard: 'h-11 px-3 text-sm',
      comfortable: 'h-13 px-4 text-base',
    },
    align: {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
    },
    sortable: {
      true: 'cursor-pointer hover:bg-bg-emphasis/40',
      false: '',
    },
    sortActive: {
      true: 'text-fg-default',
      false: 'text-fg-muted',
    },
    bordered: {
      true: 'border-b border-border',
      false: '',
    },
  },
  defaultVariants: {
    density: 'standard',
    align: 'start',
    sortable: false,
    sortActive: false,
    bordered: true,
  },
});

/* -------------------------------------------------------------------------- */
/*  Header sort button — clickable label inside the <th>                       */
/* -------------------------------------------------------------------------- */

/**
 * The `<button>` wrapping the header label when the column is sortable. Inherits color
 * from the parent `<th>` so the only chrome added is the focus ring. `align` mirrors
 * the cell alignment so the label hugs the same edge.
 */
export const dataGridSortButtonRecipe = cv({
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

/* -------------------------------------------------------------------------- */
/*  <tbody>                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Body section. Striped rows live as a `&>tr:nth-child(even)` rule rather than per-row
 * recipe so unrelated row state (selection, hover) doesn't fight the stripe class.
 */
export const dataGridTbodyRecipe = cv({
  base: '',
  variants: {
    variant: {
      solid: '',
      outline: '',
      striped:
        '[&>tr:nth-child(even)>td]:bg-bg-subtle/50 [&>tr:nth-child(even):hover>td]:bg-bg-emphasis/40',
      minimal: '',
    },
  },
  defaultVariants: { variant: 'solid' },
});

/* -------------------------------------------------------------------------- */
/*  <tr>                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Body row. Hover / selected / interactive states drive data-attributes so a single
 * row can carry independent state without compound-variant explosion. The 4 × 7
 * `variant × color` matrix is expressed as compound variants for the selected-row tint
 * + hover lift.
 */
export const dataGridTrRecipe = cv({
  base: 'group transition-colors duration-fast',
  variants: {
    interactive: {
      true: 'cursor-pointer',
      false: '',
    },
    state: {
      default: '',
      selected: '',
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
    /* Hover + selected tints per color. Selected-row also gets a 2px logical-start
     * accent so the active row reads even when colors are off in a print stylesheet. */
    {
      state: 'default',
      color: 'primary',
      class: 'hover:[&>td]:bg-primary-subtle/30',
    },
    {
      state: 'selected',
      color: 'primary',
      class:
        '[&>td]:bg-primary-subtle/60 [&>td:first-child]:shadow-[inset_2px_0_0_0_var(--sds-primary)]',
    },
    {
      state: 'default',
      color: 'secondary',
      class: 'hover:[&>td]:bg-secondary-subtle/30',
    },
    {
      state: 'selected',
      color: 'secondary',
      class:
        '[&>td]:bg-secondary-subtle/60 [&>td:first-child]:shadow-[inset_2px_0_0_0_var(--sds-secondary)]',
    },
    {
      state: 'default',
      color: 'success',
      class: 'hover:[&>td]:bg-success-subtle/30',
    },
    {
      state: 'selected',
      color: 'success',
      class:
        '[&>td]:bg-success-subtle/60 [&>td:first-child]:shadow-[inset_2px_0_0_0_var(--sds-success)]',
    },
    {
      state: 'default',
      color: 'warning',
      class: 'hover:[&>td]:bg-warning-subtle/30',
    },
    {
      state: 'selected',
      color: 'warning',
      class:
        '[&>td]:bg-warning-subtle/60 [&>td:first-child]:shadow-[inset_2px_0_0_0_var(--sds-warning)]',
    },
    {
      state: 'default',
      color: 'danger',
      class: 'hover:[&>td]:bg-danger-subtle/30',
    },
    {
      state: 'selected',
      color: 'danger',
      class:
        '[&>td]:bg-danger-subtle/60 [&>td:first-child]:shadow-[inset_2px_0_0_0_var(--sds-danger)]',
    },
    {
      state: 'default',
      color: 'info',
      class: 'hover:[&>td]:bg-info-subtle/30',
    },
    {
      state: 'selected',
      color: 'info',
      class:
        '[&>td]:bg-info-subtle/60 [&>td:first-child]:shadow-[inset_2px_0_0_0_var(--sds-info)]',
    },
    {
      state: 'default',
      color: 'neutral',
      class: 'hover:[&>td]:bg-bg-emphasis/30',
    },
    {
      state: 'selected',
      color: 'neutral',
      class:
        '[&>td]:bg-bg-emphasis/40 [&>td:first-child]:shadow-[inset_2px_0_0_0_var(--sds-fg-muted)]',
    },
  ],
  defaultVariants: { interactive: false, state: 'default', color: 'primary' },
});

/* -------------------------------------------------------------------------- */
/*  <td>                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Body cell. The roving-focus indicator is the most important chrome here — an inset
 * 2px ring so the focused cell reads even on a dense table. Density rows match the
 * `<th>` ladder.
 */
/* -------------------------------------------------------------------------- */
/*  Toolbar — PR 4                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Top toolbar row holding the global search, column-visibility popover, density
 * select, and export menu. Wraps on narrow viewports so consumers don't need a
 * media query — the responsive overflow Menu lives in PR 7.
 */
export const dataGridToolbarRecipe = cv({
  base: 'flex w-full flex-wrap items-center gap-2 px-3 py-2',
  variants: {
    bordered: {
      true: 'border-b border-border',
      false: '',
    },
    variant: {
      solid: 'bg-bg-subtle/40',
      outline: 'bg-bg-paper',
      striped: 'bg-bg-subtle/40',
      minimal: 'bg-transparent',
    },
  },
  defaultVariants: { bordered: true, variant: 'solid' },
});

/* -------------------------------------------------------------------------- */
/*  Pagination — PR 4                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Bottom-anchored pagination row. Three column groups: page-size select,
 * "X–Y of N" label, navigation buttons. Mirrors the toolbar padding for vertical
 * rhythm.
 */
export const dataGridPaginationRecipe = cv({
  base: 'flex w-full flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm text-fg-muted',
  variants: {
    bordered: {
      true: 'border-t border-border',
      false: '',
    },
    variant: {
      solid: 'bg-bg-subtle/40',
      outline: 'bg-bg-paper',
      striped: 'bg-bg-subtle/40',
      minimal: 'bg-transparent',
    },
  },
  defaultVariants: { bordered: true, variant: 'solid' },
});

/* -------------------------------------------------------------------------- */
/*  Selection bar — PR 4                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Sticky-bottom action bar that slides in when ≥ 1 row is selected. Sits inside
 * the root scroller so it doesn't fight with sticky pagination. The slide-in
 * motion lives in `DataGrid.motion.ts`.
 */
export const dataGridSelectionBarRecipe = cv({
  base: 'sticky bottom-0 z-[3] flex w-full items-center gap-3 border-t border-border bg-bg-paper px-3 py-2 shadow-lg',
});

/* -------------------------------------------------------------------------- */
/*  Per-column filter button + panel — PR 4                                    */
/* -------------------------------------------------------------------------- */

/**
 * Small icon button rendered inside a header cell for filterable columns. Sits at
 * the end of the cell (`ms-auto`) and shows a dot indicator when a filter is active.
 */
export const dataGridFilterButtonRecipe = cv({
  base: 'relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-fg-muted hover:bg-bg-emphasis/40 hover:text-fg-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
  variants: {
    active: {
      true: 'text-primary after:absolute after:right-1 after:top-1 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary',
      false: '',
    },
  },
  defaultVariants: { active: false },
});

/**
 * Filter Popover content. Stacked operator-select + value-input form with a footer
 * row of Apply / Clear buttons.
 */
export const dataGridFilterPanelRecipe = cv({
  base: 'flex w-72 flex-col gap-2 p-1',
});

/* -------------------------------------------------------------------------- */
/*  Row selection + actions cells — PR 4                                       */
/* -------------------------------------------------------------------------- */

/** Slim leading column that hosts the row Checkbox / Radio. */
export const dataGridSelectCellRecipe = cv({
  base: 'w-10 px-2 py-0 align-middle text-center',
});

/** Trailing column with the row-actions Menu trigger. */
export const dataGridActionsCellRecipe = cv({
  base: 'w-12 px-1 py-0 text-end align-middle',
});

/* -------------------------------------------------------------------------- */
/*  Resize handle — PR 5                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Thin draggable bar at the trailing edge of a header `<th>`. Sits absolutely so it
 * doesn't disturb the cell flex/grid layout. The 8px hit zone overlaps adjacent cells
 * slightly — common practice for resize affordances — and is centered on the border.
 *
 * `active` flips on while the user drags so we can hold the highlight even when the
 * pointer leaves the handle bounds (the drag stream is captured globally).
 */
export const dataGridResizeHandleRecipe = cv({
  base: 'absolute end-0 top-0 z-[1] h-full w-1.5 -me-[3px] cursor-col-resize touch-none select-none after:absolute after:inset-y-2 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-border after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100 focus-visible:outline-none',
  variants: {
    active: {
      true: 'after:opacity-100 after:bg-primary after:w-0.5',
      false: '',
    },
  },
  defaultVariants: { active: false },
});

/* -------------------------------------------------------------------------- */
/*  Footer (aggregations) — PR 5                                               */
/* -------------------------------------------------------------------------- */

/** `<tfoot>` element holding the aggregation row. Mirrors header sticky behaviour. */
export const dataGridTfootRecipe = cv({
  base: 'bg-bg-subtle/50',
  variants: {
    sticky: {
      true: 'sticky bottom-0 z-[2]',
      false: '',
    },
    bordered: {
      true: 'border-t border-border',
      false: '',
    },
  },
  defaultVariants: { sticky: true, bordered: true },
});

/** Footer `<td>` — same dimensions as a body cell but holds aggregated values. */
export const dataGridTfootCellRecipe = cv({
  base: 'px-3 align-middle text-fg-muted font-medium',
  variants: {
    density: {
      compact: 'h-8 text-xs',
      standard: 'h-10 text-sm',
      comfortable: 'h-12 text-sm',
    },
    align: {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
    },
  },
  defaultVariants: { density: 'standard', align: 'start' },
});

/* -------------------------------------------------------------------------- */
/*  Expansion row — PR 5                                                       */
/* -------------------------------------------------------------------------- */

/** `<tr>` rendered immediately under an expanded row. Single `<td>` spanning all columns. */
export const dataGridExpansionRowRecipe = cv({
  base: 'bg-bg-subtle/30',
});

/** Inner `<td>` of the expansion row. Houses the consumer-supplied detail content. */
export const dataGridExpansionCellRecipe = cv({
  base: 'p-4 align-top border-b border-border',
});

/* -------------------------------------------------------------------------- */
/*  Cell editor — PR 5                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Wrapper around the consumer-supplied `column.editor` JSX. Removes the cell padding
 * so the editor's input can occupy the full cell rectangle, mirroring spreadsheet
 * conventions.
 */
export const dataGridCellEditorRecipe = cv({
  base: 'flex h-full w-full items-stretch -m-3 p-0 has-[input:focus]:ring-2 has-[input:focus]:ring-focus',
});

/* -------------------------------------------------------------------------- */
/*  Loading / Empty / Error states — PR 5                                      */
/* -------------------------------------------------------------------------- */

/**
 * Loading overlay — a translucent layer sitting above the body that holds a skeleton
 * or spinner. Sits at z-index 3 so it covers the sticky header shadow but not the
 * selection bar (z-3).
 */
export const dataGridLoadingOverlayRecipe = cv({
  base: 'absolute inset-0 z-[3] flex items-center justify-center bg-bg-paper/60 backdrop-blur-[1px]',
});

/**
 * Empty-state full-width container shown when there are zero rows after filtering.
 * Sits inside `<tbody>` as a single `<tr><td colSpan />`.
 */
export const dataGridEmptyRowRecipe = cv({
  base: 'p-8 text-center align-middle text-fg-muted',
});

/** Error-state container — distinguishable from "empty" via icon + accent colour. */
export const dataGridErrorRowRecipe = cv({
  base: 'p-8 text-center align-middle text-danger',
});

export const dataGridTdRecipe = cv({
  base: 'whitespace-nowrap align-middle text-fg-default focus:outline-none focus-visible:relative focus-visible:z-[1] focus-visible:shadow-[inset_0_0_0_2px_var(--sds-focus)]',
  variants: {
    density: {
      compact: 'h-8 px-3 py-1 text-xs',
      standard: 'h-12 px-3 py-2.5 text-sm',
      comfortable: 'h-16 px-4 py-4 text-base',
    },
    align: {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
    },
    bordered: {
      true: 'border-b border-border',
      false: '',
    },
    truncate: {
      true: 'max-w-0 truncate',
      false: '',
    },
  },
  compoundVariants: [
    // Outline variant keeps row dividers but kills cell dividers — kept here so the
    // visual axis is set in one place.
  ],
  defaultVariants: {
    density: 'standard',
    align: 'start',
    bordered: true,
    truncate: false,
  },
});