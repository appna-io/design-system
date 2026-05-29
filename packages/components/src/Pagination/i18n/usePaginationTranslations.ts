'use client';

import { useI18n } from '@apx-ui/engine';
import { useMemo } from 'react';

import type { PaginationTranslations } from '../Pagination.types';
import { enPaginationTranslations } from './en';

/**
 * Resolve the effective translations for a Pagination instance using the
 * three-layer precedence rule (highest → lowest):
 *
 *  1. Inline `translations={…}` prop (partial — every key falls through)
 *  2. `<I18nProvider messages={{ Pagination: {…} }}>` context — OR the
 *     DataGrid namespace, since the two key sets overlap and DataGrid is a
 *     superset. Pagination-specific keys (`paginationLabel`,
 *     `paginationPage`, `paginationPageCurrent`, `paginationEllipsis`) only
 *     appear in the Pagination bundle.
 *  3. Built-in English defaults
 *
 * The provider can supply either a `Pagination`-shaped bundle or a
 * `DataGrid`-shaped bundle — we read both namespaces in that order and
 * shallow-merge the union into the defaults. This is the load-bearing
 * second-consumer of `<I18nProvider>` (after DataGrid) that the Phase 31 plan
 * called for to "graduate the primitive from DataGrid-only to general."
 */
export function usePaginationTranslations(
  propsLayer?: Partial<PaginationTranslations>,
): PaginationTranslations {
  const i18n = useI18n();
  const paginationLayer = i18n?.get<Partial<PaginationTranslations>>('Pagination');
  const dataGridLayer = i18n?.get<Partial<PaginationTranslations>>('DataGrid');

  return useMemo(
    () =>
      mergePaginationTranslations(
        enPaginationTranslations,
        dataGridLayer,
        paginationLayer,
        propsLayer,
      ),
    [paginationLayer, dataGridLayer, propsLayer],
  );
}

/**
 * Pure merger — exposed for the headless `usePagination()` hook so the merge
 * can happen during the main render without a separate hook subscription.
 *
 * Order matches the precedence rule above: later sources override earlier
 * ones. `undefined` keys never override (the `??` per-key would be cleaner
 * but spread is fine because the source objects are partial — every
 * undefined slot stays undefined and the spread skips it).
 */
export function mergePaginationTranslations(
  defaults: PaginationTranslations,
  fromDataGrid: Partial<PaginationTranslations> | undefined,
  fromProvider: Partial<PaginationTranslations> | undefined,
  fromProps: Partial<PaginationTranslations> | undefined,
): PaginationTranslations {
  return {
    ...defaults,
    ...(fromDataGrid ?? {}),
    ...(fromProvider ?? {}),
    ...(fromProps ?? {}),
  };
}
