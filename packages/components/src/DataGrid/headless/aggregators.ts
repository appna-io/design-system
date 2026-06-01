import type { ReactNode } from 'react';

import type {
  AggregationId,
  ColumnAggregation,
  ColumnDef,
  CustomAggregation,
  Row,
} from '../DataGrid.types';
import { getCellValue } from './getCellValue';

/**
 * Pure aggregator helpers for `<DataGrid.Footer />`.
 *
 * Each built-in aggregator accepts the list of *filtered* rows (not paginated — the
 * footer reflects "totals on currently visible data" per the spec) plus the column
 * being aggregated, and returns a primitive that the footer formats. Custom
 * aggregations supply their own `fn(rows) => unknown` so consumers can hit business
 * logic without forking the engine.
 *
 * The aggregators never throw on non-numeric values — they coerce via `Number()` and
 * skip `NaN`. That matches the spirit of `<DataGrid>`: render-time errors never crash
 * the table; if the cell is junk, the footer simply omits it from the total.
 */

/** Pull the numeric cell value for `row × column`, skipping non-finite results. */
function numericValues<T>(rows: ReadonlyArray<Row<T>>, column: ColumnDef<T>): number[] {
  const out: number[] = [];
  for (const row of rows) {
    const raw = getCellValue(row.original, column);
    const n = Number(raw);
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

/** Pull every cell value (including non-numeric) for distinct/count operations. */
function allValues<T>(rows: ReadonlyArray<Row<T>>, column: ColumnDef<T>): unknown[] {
  return rows.map((row) => getCellValue(row.original, column));
}

export function sum<T>(rows: ReadonlyArray<Row<T>>, column: ColumnDef<T>): number {
  return numericValues(rows, column).reduce((a, b) => a + b, 0);
}

export function avg<T>(rows: ReadonlyArray<Row<T>>, column: ColumnDef<T>): number {
  const values = numericValues(rows, column);
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function min<T>(rows: ReadonlyArray<Row<T>>, column: ColumnDef<T>): number | null {
  const values = numericValues(rows, column);
  return values.length === 0 ? null : Math.min(...values);
}

export function max<T>(rows: ReadonlyArray<Row<T>>, column: ColumnDef<T>): number | null {
  const values = numericValues(rows, column);
  return values.length === 0 ? null : Math.max(...values);
}

export function count<T>(rows: ReadonlyArray<Row<T>>, _column: ColumnDef<T>): number {
  void _column;
  return rows.length;
}

export function countDistinct<T>(
  rows: ReadonlyArray<Row<T>>,
  column: ColumnDef<T>,
): number {
  const set = new Set<unknown>();
  for (const value of allValues(rows, column)) {
    // null / undefined collapse to a single bucket so we don't double-count "empty".
    set.add(value ?? null);
  }
  return set.size;
}

export function median<T>(
  rows: ReadonlyArray<Row<T>>,
  column: ColumnDef<T>,
): number | null {
  const values = numericValues(rows, column).slice().sort((a, b) => a - b);
  if (values.length === 0) return null;
  const mid = Math.floor(values.length / 2);
  if (values.length % 2 === 0) {
    return ((values[mid - 1] as number) + (values[mid] as number)) / 2;
  }
  return values[mid] as number;
}

/** Map from `AggregationId` → aggregator function. Lookups happen once per render. */
export const BUILT_IN_AGGREGATORS: Record<
  AggregationId,
  <T>(rows: ReadonlyArray<Row<T>>, column: ColumnDef<T>) => unknown
> = {
  sum,
  avg,
  min,
  max,
  count,
  countDistinct,
  median,
};

/** Default short labels rendered inline before the value. PR 7 will i18n these. */
export const AGGREGATION_LABELS: Record<AggregationId, string> = {
  sum: 'Σ',
  avg: 'avg',
  min: 'min',
  max: 'max',
  count: 'count',
  countDistinct: 'distinct',
  median: 'med',
};

/** Discriminator: is this entry a `CustomAggregation` (object with `fn`) or a built-in id? */
export function isCustomAggregation<T>(
  agg: ColumnAggregation<T>,
): agg is CustomAggregation<T> {
  return typeof agg === 'object' && agg !== null && typeof agg.fn === 'function';
}

/**
 * Run a single aggregation against the filtered rows for a column. Returns
 * `{ id, label, value }` so the footer can render in a uniform shape regardless of
 * whether the entry was a built-in id or a custom record.
 */
export function runAggregation<T>(
  agg: ColumnAggregation<T>,
  rows: ReadonlyArray<Row<T>>,
  column: ColumnDef<T>,
): { id: string; label: ReactNode; value: unknown } {
  if (isCustomAggregation(agg)) {
    return {
      id: agg.id,
      label: agg.label ?? agg.id,
      value: agg.fn(rows.map((r) => r.original)),
    };
  }
  return {
    id: agg,
    label: AGGREGATION_LABELS[agg],
    value: BUILT_IN_AGGREGATORS[agg](rows, column),
  };
}

/** Run every aggregation declared on a column. Empty array when none declared. */
export function runColumnAggregations<T>(
  column: ColumnDef<T>,
  rows: ReadonlyArray<Row<T>>,
): ReadonlyArray<{ id: string; label: ReactNode; value: unknown }> {
  if (!column.aggregations || column.aggregations.length === 0) return [];
  return column.aggregations.map((agg) => runAggregation(agg, rows, column));
}

/**
 * Format an aggregated number for display. Mirrors `column.type === 'number'` precision
 * when set; falls back to `Intl.NumberFormat` default. Strings, booleans, dates, and
 * `null` (for empty min/max) round-trip via `String()`.
 */
export function formatAggregatedValue<T>(
  value: unknown,
  column: ColumnDef<T>,
): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    const precision =
      column.type === 'number' && typeof (column as { precision?: number }).precision === 'number'
        ? (column as { precision: number }).precision
        : undefined;
    if (precision !== undefined) return value.toFixed(precision);
    return new Intl.NumberFormat().format(value);
  }
  return String(value);
}