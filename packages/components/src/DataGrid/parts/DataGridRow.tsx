'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  memo,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

import { dataGridTrRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import type { Row } from '../DataGrid.types';

import { DataGridCell } from './DataGridCell';

export interface DataGridRowProps<T = unknown>
  extends Omit<HTMLAttributes<HTMLTableRowElement>, 'children'> {
  row: Row<T>;
  /** Zero-based row index within the currently rendered (paginated) body. */
  rowIndex: number;
  sx?: Sx;
}

/**
 * `<DataGrid.Row>` — single `<tr role="row">`.
 *
 * Maps the visible columns to `<DataGrid.Cell>`s and applies the row-level state +
 * accent tint from the recipe. Wrapped in `React.memo` so re-renders fire only when
 * the row's identity, the selected state, or the visible-columns array changes — the
 * cell content under `cell={…}` is the consumer's responsibility to keep stable.
 */
function DataGridRowImpl<T>(
  props: DataGridRowProps<T>,
  ref: ForwardedRef<HTMLTableRowElement>,
): ReactElement {
  const { row, rowIndex, className, sx, style, onClick, ...rest } = props;
  const ctx = useDataGridContext<T>();
  const { grid, columns, color } = ctx;
  const interactive = Boolean(onClick);

  const rowAriaProps = grid.getRowProps(row.id);
  const dataState = rowAriaProps['data-state'] === 'selected' ? 'selected' : 'default';

  const { className: trClass, style: trStyle } = useThemedClasses({
    recipe: dataGridTrRecipe,
    componentName: 'DataGrid',
    slot: 'tr',
    props: { interactive, state: dataState, color, className, sx, style },
  });

  return (
    <tr
      ref={ref}
      className={trClass}
      style={trStyle ?? undefined}
      data-datagrid-row=""
      data-row-id={String(row.id)}
      onClick={onClick}
      {...rowAriaProps}
      {...rest}
    >
      {columns.map((column, colIndex) => (
        <DataGridCell
          key={column.id}
          column={column}
          row={row}
          rowIndex={rowIndex}
          colIndex={colIndex}
        />
      ))}
    </tr>
  );
}

const DataGridRowForwarded = forwardRef(
  DataGridRowImpl as (
    props: DataGridRowProps<unknown>,
    ref: ForwardedRef<HTMLTableRowElement>,
  ) => ReactElement,
  'DataGrid.Row',
);

const DataGridRowMemoed = memo(DataGridRowForwarded) as typeof DataGridRowForwarded;

export const DataGridRow = DataGridRowMemoed as <T = unknown>(
  props: DataGridRowProps<T> & { ref?: Ref<HTMLTableRowElement> },
) => ReactElement;