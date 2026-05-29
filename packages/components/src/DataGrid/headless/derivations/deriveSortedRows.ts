import type { ColumnDef, Row, SortDescriptor } from '../../DataGrid.types';
import { compareValues } from '../compareValues';
import { getCellValue } from '../getCellValue';

export interface DeriveSortedRowsOptions<T> {
  rows: ReadonlyArray<Row<T>>;
  columns: ColumnDef<T>[];
  sort: SortDescriptor[];
  collator: Intl.Collator;
}

/**
 * Multi-column stable sort.
 *
 * Stability matters when sort columns produce ties: we want the prior pass's order
 * preserved. `Array.prototype.sort` is stable in V8 / JSC / SpiderMonkey since 2019, so
 * a single pass with a composite comparator suffices. Each `SortDescriptor` in the
 * stack is applied in order; the first non-zero comparison wins.
 *
 * Returns a fresh array — never mutates `rows`.
 */
export function deriveSortedRows<T>(options: DeriveSortedRowsOptions<T>): Row<T>[] {
  const { rows, columns, sort, collator } = options;
  if (sort.length === 0) return [...rows];

  const columnsById = new Map(columns.map((c) => [c.id, c]));
  const orderedSort = sort
    .map((descriptor) => {
      const column = columnsById.get(descriptor.id);
      return column ? { descriptor, column } : null;
    })
    .filter((entry): entry is { descriptor: SortDescriptor; column: ColumnDef<T> } => entry !== null);

  if (orderedSort.length === 0) return [...rows];

  const copy = [...rows];
  copy.sort((a, b) => {
    for (const { descriptor, column } of orderedSort) {
      const av = getCellValue(a.original, column);
      const bv = getCellValue(b.original, column);
      const cmp = compareValues(av, bv, collator);
      if (cmp !== 0) return descriptor.direction === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
  return copy;
}
