import type { PaginationTranslations } from '../Pagination.types';

/**
 * Arabic (ar) Pagination translations — second of the two canonical RTL
 * bundles. Pair with `<DirectionProvider dir="rtl">` so chevrons + page list
 * flow to the right edge.
 *
 * Numerals stay in Western-Arabic form (`123…`) per modern Arabic UI
 * conventions (Monday.com / Wix / Cairo localization style guides). Consumers
 * wanting Eastern-Arabic numerals (`٠١٢…`) can override the function-shaped
 * keys via the `translations` prop.
 */
export const arPaginationTranslations: PaginationTranslations = {
  paginationLabel: 'ترقيم الصفحات',
  paginationPage: (n) => `الصفحة ${n}`,
  paginationPageCurrent: (n) => `الصفحة ${n}، الصفحة الحالية`,
  paginationEllipsis: 'صفحات إضافية',
  paginationRowsPerPage: 'صفوف لكل صفحة',
  paginationOfTotal: (s, e, t) => `${s}–${e} من ${t}`,
  paginationFirstPage: 'الصفحة الأولى',
  paginationPreviousPage: 'الصفحة السابقة',
  paginationNextPage: 'الصفحة التالية',
  paginationLastPage: 'الصفحة الأخيرة',
  paginationPageOfPages: (c, t) => `صفحة ${c} من ${t}`,
};