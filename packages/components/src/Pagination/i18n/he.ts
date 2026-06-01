import type { PaginationTranslations } from '../Pagination.types';

/**
 * Hebrew (he) Pagination translations — ships alongside `en` + `ar` as the
 * canonical RTL stress-test bundle. Pair with `<DirectionProvider dir="rtl">`
 * (or `<html dir="rtl">`) so the chevrons + page-number flow logically
 * reverse with the surrounding layout.
 *
 * Strings mirror the keys in `heDataGridTranslations` 1:1 so the two bundles
 * can be installed together without divergence — `<DataGrid.Pagination />`
 * uses the DataGrid bundle today and the standalone `<Pagination />`
 * delegates to this one; both render identically.
 */
export const hePaginationTranslations: PaginationTranslations = {
  paginationLabel: 'דפדוף',
  paginationPage: (n) => `עמוד ${n}`,
  paginationPageCurrent: (n) => `עמוד ${n}, העמוד הנוכחי`,
  paginationEllipsis: 'עמודים נוספים',
  paginationRowsPerPage: 'שורות בעמוד',
  paginationOfTotal: (s, e, t) => `${s}–${e} מתוך ${t}`,
  paginationFirstPage: 'עמוד ראשון',
  paginationPreviousPage: 'עמוד קודם',
  paginationNextPage: 'עמוד הבא',
  paginationLastPage: 'עמוד אחרון',
  paginationPageOfPages: (c, t) => `עמוד ${c} מתוך ${t}`,
};