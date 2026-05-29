'use client';

import { useI18n } from '@apx-ui/engine';
import { useMemo } from 'react';

import type { DataGridTranslations } from '../DataGrid.types';
import { enDataGridTranslations } from './locales/en';

/**
 * Resolve the effective translations for a DataGrid instance, applying the three-layer
 * precedence rule (highest → lowest):
 *
 *  1. Inline `translations={…}` prop (partial — every key falls through to lower layers)
 *  2. `<I18nProvider messages={{ DataGrid: {…} }}>` context
 *  3. Built-in English defaults
 *
 * The `operators` nested namespace is deep-merged so a consumer can override `equals`
 * without re-supplying the whole catalogue; everything else is a top-level scalar and
 * shallow-merged.
 *
 * The hook deliberately avoids subscribing to the props' identity — only `propsLayer`
 * (a stable reference passed by the caller) influences the memo. The provider message
 * object is treated identically.
 */
export function useDataGridTranslations(
  propsLayer?: Partial<DataGridTranslations>,
): DataGridTranslations {
  const i18n = useI18n();
  const providerLayer = i18n?.get<Partial<DataGridTranslations>>('DataGrid');

  return useMemo(
    () => mergeTranslations(enDataGridTranslations, providerLayer, propsLayer),
    [providerLayer, propsLayer],
  );
}

/**
 * Pure merger — exposed for the headless `useDataGrid` hook so the merge happens in a
 * single pass during the main render rather than via a separate hook. Consumers that
 * use the `<DataGrid />` component never call this directly.
 */
export function mergeTranslations(
  defaults: DataGridTranslations,
  fromProvider: Partial<DataGridTranslations> | undefined,
  fromProps: Partial<DataGridTranslations> | undefined,
): DataGridTranslations {
  const provider = fromProvider ?? {};
  const props = fromProps ?? {};
  return {
    ...defaults,
    ...provider,
    ...props,
    operators: {
      ...defaults.operators,
      ...(provider.operators ?? {}),
      ...(props.operators ?? {}),
    },
  };
}
