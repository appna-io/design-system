import type { ColumnDef, Row } from '../DataGrid.types';
import { getCellValue } from './getCellValue';

export interface ExportJsonOptions<T> {
  rows: ReadonlyArray<Row<T>>;
  columns: ColumnDef<T>[];
  /** Pretty-print indentation (passed to `JSON.stringify`). Default `2`. */
  indent?: number;
}

/**
 * Convert rows + columns to a JSON string.
 *
 * Each object is keyed by `column.id`, which keeps the output stable even when consumers
 * use derived accessors / computed values that don't have an obvious row-property name.
 * Structural columns are skipped, same as CSV. `Date` values are serialized as ISO 8601.
 */
export function exportJson<T>(options: ExportJsonOptions<T>): string {
  const { rows, columns, indent = 2 } = options;
  const exportable = columns.filter((c) => !isStructuralColumn(c));
  const serialised = rows.map((row) => {
    const obj: Record<string, unknown> = {};
    for (const column of exportable) {
      obj[column.id] = serialiseValue(getCellValue(row.original, column));
    }
    return obj;
  });
  return JSON.stringify(serialised, null, indent);
}

function serialiseValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  return value;
}

function isStructuralColumn<T>(column: ColumnDef<T>): boolean {
  return (
    column.type === 'actions' || column.type === 'expand' || column.type === 'rowSelect'
  );
}
