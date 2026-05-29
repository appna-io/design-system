import type { ColumnDef, Row } from '../DataGrid.types';
import { getCellValue } from './getCellValue';

export interface ExportCsvOptions<T> {
  rows: ReadonlyArray<Row<T>>;
  columns: ColumnDef<T>[];
  /** Cell delimiter — default `,`. Use `'\t'` for TSV. */
  delimiter?: string;
  /** Line separator — default `'\r\n'` (RFC 4180). */
  newline?: string;
  /** When `false`, omit the header row. Default `true`. */
  includeHeader?: boolean;
}

/**
 * Convert rows + columns to a CSV string.
 *
 * Skips structural columns (`type: 'actions' | 'expand' | 'select'`) because they hold
 * no data. The header label comes from the column's `header` if it's a string; falls
 * back to `column.id` otherwise (function/JSX headers would need consumer-supplied label).
 *
 * Quotes any field that contains the delimiter, a double-quote, or a newline. Quotes
 * inside fields are doubled per RFC 4180. The output is **always** UTF-8 safe and
 * Excel-importable.
 */
export function exportCsv<T>(options: ExportCsvOptions<T>): string {
  const {
    rows,
    columns,
    delimiter = ',',
    newline = '\r\n',
    includeHeader = true,
  } = options;
  const exportable = columns.filter((c) => !isStructuralColumn(c));

  const out: string[] = [];
  if (includeHeader) {
    out.push(exportable.map((c) => escape(headerLabel(c), delimiter)).join(delimiter));
  }
  for (const row of rows) {
    const line = exportable
      .map((c) => escape(stringifyForCsv(getCellValue(row.original, c)), delimiter))
      .join(delimiter);
    out.push(line);
  }
  return out.join(newline);
}

function escape(value: string, delimiter: string): string {
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function stringifyForCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
}

function headerLabel<T>(column: ColumnDef<T>): string {
  if (typeof column.header === 'string') return column.header;
  if (typeof column.header === 'number') return String(column.header);
  return column.id;
}

function isStructuralColumn<T>(column: ColumnDef<T>): boolean {
  return (
    column.type === 'actions' || column.type === 'expand' || column.type === 'rowSelect'
  );
}
