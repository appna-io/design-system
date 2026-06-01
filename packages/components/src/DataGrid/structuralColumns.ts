import type { ColumnDef, ColumnType } from './DataGrid.types';

/**
 * "Structural" columns carry no data accessor — they host a UI control instead.
 * `rowSelect` holds the row checkbox/radio, `actions` the per-row Menu trigger,
 * `expand` the disclosure toggle (PR 5).
 *
 * These columns are skipped by the filter / sort / global-search pipelines (they
 * have nothing to compare) and the CSV / JSON exporters (PR 2 already handles this).
 * PR 4 introduces the React-side dispatch: header and body cells branch on the
 * type and render the matching control instead of `column.accessor(row)`.
 */
const STRUCTURAL_TYPES: ReadonlySet<ColumnType> = new Set([
  'rowSelect',
  'actions',
  'expand',
]);

export function isStructuralColumn<T>(column: ColumnDef<T>): boolean {
  return STRUCTURAL_TYPES.has(column.type as ColumnType);
}

export function isStructuralType(type: ColumnType | undefined): boolean {
  return type !== undefined && STRUCTURAL_TYPES.has(type);
}