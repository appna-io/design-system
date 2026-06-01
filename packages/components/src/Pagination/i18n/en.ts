import type { PaginationTranslations } from '../Pagination.types';

/**
 * English (default) Pagination translations. Every visible string flows through
 * this bag so consumers can swap to Hebrew / Arabic / their own bundle via the
 * `translations` prop, the `<I18nProvider messages={{ Pagination: {…} }}>`
 * context, or by passing a `DataGridTranslations`-shaped object (every
 * pagination key in DataGrid's namespace overlaps with this one — DataGrid
 * stays the superset, Pagination the subset).
 *
 * Plural-sensitive helpers (`paginationOfTotal`, `paginationPageOfPages`,
 * `paginationPage`, `paginationPageCurrent`) accept numeric inputs so
 * translators can switch syntax per locale (e.g. Hebrew's plural-of-two forms,
 * Arabic's six categories).
 */
export const enPaginationTranslations: PaginationTranslations = {
  paginationLabel: 'Pagination',
  paginationPage: (n) => `Page ${n}`,
  paginationPageCurrent: (n) => `Page ${n}, current page`,
  paginationEllipsis: 'More pages',
  paginationRowsPerPage: 'Rows per page',
  paginationOfTotal: (s, e, t) => `${s}–${e} of ${t}`,
  paginationFirstPage: 'First page',
  paginationPreviousPage: 'Previous page',
  paginationNextPage: 'Next page',
  paginationLastPage: 'Last page',
  paginationPageOfPages: (c, t) => `Page ${c} of ${t}`,
};

/**
 * Re-exported under the plan-mandated public name so the package's public
 * surface matches the documentation (`paginationDefaultTranslations`).
 */
export const paginationDefaultTranslations = enPaginationTranslations;