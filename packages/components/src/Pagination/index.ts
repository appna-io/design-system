/* Phase 31 — `<Pagination />`.
 *
 *   - PR 1 shipped the headless layer (`usePagination`) + the pure window
 *     helper (`computePageWindow`) + types.
 *   - PR 2 ships the full DOM component (`<Pagination />`), the four
 *     layouts, the variant × color × size × shape matrix (252 cells), the
 *     en / he / ar translation bundles, and the three-layer translation
 *     resolver that piggy-backs on `<I18nProvider>`.
 *   - PR 3 refactors `<DataGrid.Pagination />` to delegate to this
 *     component — the second-consumer rule for `<I18nProvider>`. */

export { Pagination } from './Pagination';
export { meta as paginationMeta } from './meta';
export {
  paginationButtonRecipe,
  paginationEllipsisRecipe,
  paginationListRecipe,
  paginationRangeLabelRecipe,
  paginationRootRecipe,
  paginationSizePickerRecipe,
} from './Pagination.recipe';
export { computePageWindow } from './computePageWindow';
export { usePagination } from './usePagination';

export {
  enPaginationTranslations,
  paginationDefaultTranslations,
} from './i18n/en';
export { hePaginationTranslations } from './i18n/he';
export { arPaginationTranslations } from './i18n/ar';
export {
  mergePaginationTranslations,
  usePaginationTranslations,
} from './i18n/usePaginationTranslations';

export type {
  ComputePageWindowOptions,
  PageItem,
  PaginationChange,
  PaginationColor,
  PaginationLayout,
  PaginationMode,
  PaginationProps,
  PaginationShape,
  PaginationSize,
  PaginationTranslations,
  PaginationVariant,
  UsePaginationOptions,
  UsePaginationReturn,
} from './Pagination.types';