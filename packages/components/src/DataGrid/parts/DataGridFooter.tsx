'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  useMemo,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import {
  dataGridTfootCellRecipe,
  dataGridTfootRecipe,
} from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import {
  formatAggregatedValue,
  runColumnAggregations,
} from '../headless/aggregators';
import { isStructuralColumn } from '../structuralColumns';
import type { ColumnDef, Row } from '../DataGrid.types';

export interface DataGridFooterProps
  extends Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> {
  /**
   * Optional override for the aggregations operating set. Defaults to
   * `grid.filteredRows` (the spec's "currently visible data" definition). Consumers
   * can pass `grid.paginationInfo.rows` to get a per-page total instead.
   */
  rowsOverride?: 'filtered' | 'page';
  sx?: Sx;
}

/**
 * `<DataGrid.Footer />` — `<tfoot>` row showing per-column aggregations.
 *
 * Each visible column may declare `aggregations: ['sum', 'avg']` (or a custom
 * `{ id, label, fn }`). The footer renders one cell per visible column; cells with no
 * aggregations are blank placeholders (preserving alignment with header / body).
 *
 * Aggregations run on filtered (not paginated) rows by default — so flipping pages
 * doesn't shift the totals. Pass `rowsOverride="page"` to get spreadsheet-style
 * per-page totals.
 */
function DataGridFooterImpl(
  props: DataGridFooterProps,
  ref: ForwardedRef<HTMLTableSectionElement>,
): ReactElement {
  const { rowsOverride = 'filtered', className, sx, style, ...rest } = props;
  const ctx = useDataGridContext();
  const { grid, density, stickyHeader, bordered } = ctx;

  const { className: tfootClass } = useThemedClasses({
    recipe: dataGridTfootRecipe,
    componentName: 'DataGrid',
    slot: 'tfoot',
    props: { sticky: stickyHeader, bordered, className, sx, style },
  });

  const sourceRows = rowsOverride === 'page' ? grid.paginationInfo.rows : grid.filteredRows;

  return (
    <tfoot
      ref={ref}
      className={tfootClass}
      data-datagrid-tfoot=""
      {...rest}
    >
      <tr role="row" data-datagrid-footer-row="">
        {grid.visibleColumns.map((column, colIndex) => (
          <DataGridFooterCell
            key={column.id}
            column={column}
            colIndex={colIndex}
            rows={sourceRows}
            density={density}
          />
        ))}
      </tr>
    </tfoot>
  );
}

interface DataGridFooterCellProps<T> {
  column: ColumnDef<T>;
  colIndex: number;
  rows: ReadonlyArray<Row<T>>;
  density: 'compact' | 'standard' | 'comfortable';
}

function DataGridFooterCell<T>(
  props: DataGridFooterCellProps<T>,
): ReactElement {
  const { column, colIndex, rows, density } = props;
  const align = column.align ?? 'start';

  const { className: tdClass } = useThemedClasses({
    recipe: dataGridTfootCellRecipe,
    componentName: 'DataGrid',
    slot: 'tfootCell',
    props: { density, align },
  });

  // Structural columns never aggregate (no accessor); render a blank slot so layout
  // matches the body row exactly.
  const skip = isStructuralColumn(column) || !column.aggregations || column.aggregations.length === 0;

  const results = useMemo(
    () => (skip ? [] : runColumnAggregations(column, rows)),
    [skip, column, rows],
  );

  const content: ReactNode = skip ? null : (
    <div className="flex flex-col items-stretch leading-tight">
      {results.map((r) => (
        <div key={r.id} className="flex items-baseline justify-between gap-2">
          <span className="text-fg-muted text-[10px] uppercase tracking-wide">
            {r.label}
          </span>
          <span className="text-fg-default font-semibold">
            {formatAggregatedValue(r.value, column)}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <td
      className={tdClass}
      aria-colindex={colIndex + 1}
      data-datagrid-footer-cell=""
      data-column-id={column.id}
      data-align={align}
    >
      {content}
    </td>
  );
}

export const DataGridFooter = forwardRef(DataGridFooterImpl, 'DataGrid.Footer') as (
  props: DataGridFooterProps & { ref?: Ref<HTMLTableSectionElement> },
) => ReactElement;