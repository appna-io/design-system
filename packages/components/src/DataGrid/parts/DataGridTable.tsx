'use client';

import { forwardRef, mergeRefs, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  useRef,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { dataGridTableRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import { DataGridFocusProvider } from '../DataGridFocus';

export interface DataGridTableProps
  extends Omit<HTMLAttributes<HTMLTableElement>, 'children'> {
  children: ReactNode;
  sx?: Sx;
}

/**
 * `<DataGrid.Table>` — the semantic `<table role="grid">`.
 *
 * Mounts the roving-focus controller (any descendant cell registers itself via the
 * focus context and the table-level keydown listener dispatches navigation). The
 * `aria-rowcount` / `aria-colcount` / `aria-multiselectable` attributes come from the
 * hook's `tableProps` so the static ARIA surface stays in lock-step with the headless
 * source of truth.
 */
function DataGridTableImpl(
  props: DataGridTableProps,
  ref: ForwardedRef<HTMLTableElement>,
): ReactElement {
  const { className, sx, style, children, ...rest } = props;
  const ctx = useDataGridContext();
  const { grid, density } = ctx;

  const tableRef = useRef<HTMLTableElement | null>(null);

  const { className: tableClass, style: tableStyle } = useThemedClasses({
    recipe: dataGridTableRecipe,
    componentName: 'DataGrid',
    slot: 'table',
    props: { density, className, sx, style },
  });

  const rowCount = grid.paginationInfo.rows.length;
  const columnCount = ctx.columns.length;
  const pageSize = grid.paginationInfo.pageSize || 10;

  return (
    <DataGridFocusProvider
      rowCount={rowCount}
      columnCount={columnCount}
      pageSize={pageSize}
      tableRef={tableRef}
    >
      <table
        ref={mergeRefs(ref, tableRef)}
        className={tableClass}
        style={tableStyle ?? undefined}
        data-datagrid-table=""
        {...grid.tableProps}
        {...rest}
      >
        {children}
      </table>
    </DataGridFocusProvider>
  );
}

export const DataGridTable = forwardRef(DataGridTableImpl, 'DataGrid.Table') as (
  props: DataGridTableProps & { ref?: Ref<HTMLTableElement> },
) => ReactElement;