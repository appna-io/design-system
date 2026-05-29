import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/* -------------------------------------------------------------------------- */
/*  Visual axes                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Stylistic family. `ghost` is the default — sits transparently inside any chrome.
 * `outline` / `soft` / `solid` add progressively more weight.
 */
export type PaginationVariant = 'ghost' | 'outline' | 'soft' | 'solid';

/** Visual height + horizontal padding of the page buttons. */
export type PaginationSize = 'sm' | 'md' | 'lg';

/** The DS-wide accent palette. Identical contract as `<Button color>`. */
export type PaginationColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Corner radius of the page buttons (independent of `variant` — pill pagination
 * is common regardless of the fill style).
 */
export type PaginationShape = 'square' | 'rounded' | 'pill';

/* -------------------------------------------------------------------------- */
/*  Layout + mode                                                              */
/* -------------------------------------------------------------------------- */

/**
 * `page` — total count is known; renders the page-number list with truncation.
 * `cursor` — server-driven; only prev / next + supplied flags determine state.
 */
export type PaginationMode = 'page' | 'cursor';

/**
 * Which slots the component renders. See the per-layout breakdown in
 * `README.mdx`.
 */
export type PaginationLayout = 'full' | 'compact' | 'pages-only' | 'simple';

/* -------------------------------------------------------------------------- */
/*  Window items                                                               */
/* -------------------------------------------------------------------------- */

/**
 * One item in the rendered page-number list. Numeric items are 1-based (the
 * page label the user sees); ellipsis sentinels mark a gap. We split into
 * `ellipsis-start` / `ellipsis-end` so click-to-jump (a future enhancement)
 * can tell "click left ellipsis → jump back" from "click right ellipsis →
 * jump forward".
 */
export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

export interface ComputePageWindowOptions {
  /** 0-based current page. */
  pageIndex: number;
  /** Total number of pages. Must be ≥ 0. */
  pageCount: number;
  /**
   * How many siblings on each side of the current page to render before
   * collapsing into an ellipsis. @default 1
   */
  siblingCount?: number | undefined;
  /**
   * How many page buttons at each boundary (first / last) to always render.
   * @default 1
   */
  boundaryCount?: number | undefined;
}

/* -------------------------------------------------------------------------- */
/*  Translations                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The slice of translations Pagination consumes. A consumer can ship this
 * subset on its own (`paginationDefaultTranslations`) or rely on the DataGrid
 * bundle (`DataGridTranslations`), which is a superset.
 */
export interface PaginationTranslations {
  /** Group label on the root `<nav>`. @default 'Pagination' */
  paginationLabel: string;
  /** Page-button label, e.g. `Page 5`. @default `(n) => 'Page ' + n` */
  paginationPage: (n: number) => string;
  /** Label for "current page". @default `(n) => 'Page ' + n + ', current'` */
  paginationPageCurrent: (n: number) => string;
  /** Decorative label for ellipsis spans (mostly unused — `aria-hidden`). @default 'More pages' */
  paginationEllipsis: string;
  /** Rows-per-page picker label. @default 'Rows per page' */
  paginationRowsPerPage: string;
  /** Range label, e.g. `1–25 of 120`. @default `(s, e, t) => s + '–' + e + ' of ' + t` */
  paginationOfTotal: (start: number, end: number, total: number) => string;
  /** First-page button label. */
  paginationFirstPage: string;
  /** Previous-page button label. */
  paginationPreviousPage: string;
  /** Next-page button label. */
  paginationNextPage: string;
  /** Last-page button label. */
  paginationLastPage: string;
  /** Compact-layout label, e.g. `Page 3 of 12`. */
  paginationPageOfPages: (current: number, total: number) => string;
}

/* -------------------------------------------------------------------------- */
/*  Headless hook                                                              */
/* -------------------------------------------------------------------------- */

export interface PaginationChange {
  pageIndex: number;
  pageSize: number;
}

export interface UsePaginationOptions {
  /** @default 'page' */
  mode?: PaginationMode | undefined;

  /* page-mode */
  /** Total row count. Required in `page` mode; ignored in `cursor` mode. */
  totalCount?: number | undefined;
  /** Controlled 0-based page index. */
  pageIndex?: number | undefined;
  /** Uncontrolled initial page index. @default 0 */
  defaultPageIndex?: number | undefined;
  /** Controlled page size. */
  pageSize?: number | undefined;
  /** Uncontrolled initial page size. @default 25 */
  defaultPageSize?: number | undefined;
  /** Fires whenever pageIndex or pageSize changes (both modes). */
  onChange?: ((change: PaginationChange) => void) | undefined;

  /* cursor-mode */
  /** Whether the server reports a previous page. */
  hasPreviousPage?: boolean | undefined;
  /** Whether the server reports a next page. */
  hasNextPage?: boolean | undefined;
  /** Fires when the user clicks prev in cursor mode. */
  onPrevious?: (() => void) | undefined;
  /** Fires when the user clicks next in cursor mode. */
  onNext?: (() => void) | undefined;

  /* window */
  /** @default 1 */
  siblingCount?: number | undefined;
  /** @default 1 */
  boundaryCount?: number | undefined;
}

export interface UsePaginationReturn {
  mode: PaginationMode;
  /** Effective 0-based page index (clamped into `[0, pageCount)`). */
  pageIndex: number;
  /** Effective page size. */
  pageSize: number;
  /** Total pages in `page` mode; `Infinity` in `cursor` mode (unknown total). */
  pageCount: number;
  /** Total rows in `page` mode; `null` in `cursor` mode. */
  totalCount: number | null;
  /** First (1-based) row index in the current page (0 when total is 0). */
  fromRow: number;
  /** Last (1-based) row index in the current page (0 when total is 0). */
  toRow: number;
  /** True when there is no previous page (or `hasPreviousPage === false`). */
  atFirstPage: boolean;
  /** True when there is no next page (or `hasNextPage === false`). */
  atLastPage: boolean;
  /** Page-number items + ellipses for the current window. Empty in `cursor` mode. */
  pageItems: PageItem[];

  /* actions */
  setPageIndex: (next: number) => void;
  setPageSize: (next: number) => void;
  goFirst: () => void;
  goPrevious: () => void;
  goNext: () => void;
  goLast: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Component props                                                            */
/* -------------------------------------------------------------------------- */

export interface PaginationProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'onChange'> {
  /* mode */
  /** @default 'page' */
  mode?: PaginationMode | undefined;

  /* page mode */
  /** Required in `page` mode. */
  totalCount?: number | undefined;
  pageIndex?: number | undefined;
  defaultPageIndex?: number | undefined;
  pageSize?: number | undefined;
  defaultPageSize?: number | undefined;
  onChange?: ((change: PaginationChange) => void) | undefined;

  /* cursor mode */
  hasPreviousPage?: boolean | undefined;
  hasNextPage?: boolean | undefined;
  onPrevious?: (() => void) | undefined;
  onNext?: (() => void) | undefined;

  /* page-size picker */
  /** Choices for the rows-per-page `<Select>`. @default [10, 25, 50, 100] */
  pageSizeOptions?: number[] | undefined;
  /** Hide the page-size picker entirely. @default false */
  hidePageSize?: boolean | undefined;

  /* window */
  /** @default 1 */
  siblingCount?: number | undefined;
  /** @default 1 */
  boundaryCount?: number | undefined;

  /* layout */
  /** @default 'full' */
  layout?: ResponsiveValue<PaginationLayout> | undefined;
  /**
   * Whether the component auto-degrades from `full` to `compact` below the
   * `sm` breakpoint. Set to `false` to lock the layout regardless of viewport.
   * @default true
   */
  responsive?: boolean | undefined;

  /* visual */
  /** @default 'ghost' */
  variant?: ResponsiveValue<PaginationVariant> | undefined;
  /** @default 'md' */
  size?: ResponsiveValue<PaginationSize> | undefined;
  /** @default 'primary' */
  color?: ResponsiveValue<PaginationColor> | undefined;
  /** @default 'square' */
  shape?: ResponsiveValue<PaginationShape> | undefined;

  /* labels */
  /** Whether to render the `1–25 of 120` range label. @default true */
  showRangeLabel?: boolean | undefined;
  /** Whether to render the First / Last buttons. @default true */
  showFirstLast?: boolean | undefined;

  /* i18n */
  /** Partial overrides — merged on top of `paginationDefaultTranslations`. */
  translations?: Partial<PaginationTranslations> | undefined;

  /* misc */
  className?: string | undefined;
  sx?: Sx | undefined;
  style?: CSSProperties | undefined;
  children?: ReactNode | undefined;
}
