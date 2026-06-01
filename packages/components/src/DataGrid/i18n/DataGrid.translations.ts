/**
 * DataGrid translation contract.
 *
 * Defines the `DataGridTranslations` interface and re-exports the English defaults
 * + the operator type. PR 7 of the Phase 27 split adds `locales/he.ts` and
 * `locales/ar.ts` alongside `en.ts`; until then English is the only shipped bundle.
 *
 * The runtime types live in `../DataGrid.types` so the headless layer (PR 2) can
 * reference them without pulling in i18n machinery. This file is the *public* entry
 * point for translation consumers and forwards them.
 */
export type {
  DataGridTranslations,
  DataGridOperatorTranslations,
} from '../DataGrid.types';

export { enDataGridTranslations } from './locales/en';