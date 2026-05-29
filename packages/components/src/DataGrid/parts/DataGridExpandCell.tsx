'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  useCallback,
  type ForwardedRef,
  type ReactElement,
  type Ref,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';

import { Button } from '../../Button/Button';
import { dataGridSelectCellRecipe, dataGridThRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import { useCellRef, useDataGridFocus } from '../DataGridFocus';
import type { ColumnDef, Row } from '../DataGrid.types';

/* -------------------------------------------------------------------------- */
/*  Header — placeholder cell (no select-all-style global action)             */
/* -------------------------------------------------------------------------- */

export interface DataGridExpandHeaderCellProps<T = unknown>
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align' | 'scope'> {
  column: ColumnDef<T>;
  colIndex: number;
  sx?: Sx;
}

function DataGridExpandHeaderCellImpl<T>(
  props: DataGridExpandHeaderCellProps<T>,
  ref: ForwardedRef<HTMLTableCellElement>,
): ReactElement {
  const { column, colIndex, className, sx, style, ...rest } = props;
  const ctx = useDataGridContext<T>();
  const { grid, density, bordered } = ctx;
  const cellRef = useCellRef(-1, colIndex);
  const focus = useDataGridFocus();
  const isFocused = focus.isFocused(-1, colIndex);

  const { className: thClass, style: thStyle } = useThemedClasses({
    recipe: dataGridThRecipe,
    componentName: 'DataGrid',
    slot: 'th',
    props: {
      density,
      align: 'center',
      sortable: false,
      sortActive: false,
      bordered,
      className,
      sx,
      style,
    },
  });

  const { className: selectClass } = useThemedClasses({
    recipe: dataGridSelectCellRecipe,
    componentName: 'DataGrid',
    slot: 'selectCell',
    props: {},
  });

  return (
    <th
      ref={(el) => {
        cellRef(el);
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      scope="col"
      className={`${thClass} ${selectClass}`}
      style={thStyle ?? undefined}
      role="columnheader"
      aria-colindex={colIndex + 1}
      data-datagrid-header-cell=""
      data-datagrid-expand-cell=""
      data-column-id={column.id}
      tabIndex={isFocused ? 0 : -1}
      onFocus={() => {
        if (!isFocused) focus.setFocused({ row: -1, col: colIndex });
      }}
      {...rest}
    >
      <span className="sr-only">{grid.t.expandRow}</span>
    </th>
  );
}

export const DataGridExpandHeaderCell = forwardRef(
  DataGridExpandHeaderCellImpl as (
    props: DataGridExpandHeaderCellProps<unknown>,
    ref: ForwardedRef<HTMLTableCellElement>,
  ) => ReactElement,
  'DataGrid.ExpandHeaderCell',
) as <T = unknown>(
  props: DataGridExpandHeaderCellProps<T> & { ref?: Ref<HTMLTableCellElement> },
) => ReactElement;

/* -------------------------------------------------------------------------- */
/*  Body — per-row chevron Button toggling `state.expanded`                    */
/* -------------------------------------------------------------------------- */

export interface DataGridExpandBodyCellProps<T = unknown>
  extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  column: ColumnDef<T>;
  row: Row<T>;
  rowIndex: number;
  colIndex: number;
  sx?: Sx;
}

function DataGridExpandBodyCellImpl<T>(
  props: DataGridExpandBodyCellProps<T>,
  ref: ForwardedRef<HTMLTableCellElement>,
): ReactElement {
  const { column, row, rowIndex, colIndex, className, sx, style, ...rest } = props;
  const ctx = useDataGridContext<T>();
  const { grid, isRowExpandable } = ctx;
  const cellRef = useCellRef(rowIndex, colIndex);
  const focus = useDataGridFocus();
  const isFocused = focus.isFocused(rowIndex, colIndex);

  const { className: selectClass } = useThemedClasses({
    recipe: dataGridSelectCellRecipe,
    componentName: 'DataGrid',
    slot: 'selectCell',
    props: {},
  });
  // `sx`, `className` already plumb through `useThemedClasses` on the parent dispatch;
  // we keep them out of the inner trigger so the cell shell owns the visual chrome.
  void sx;
  void className;

  const expandable = isRowExpandable ? isRowExpandable(row.original) : true;
  const expanded = grid.state.expanded.has(row.id);

  const handleClick = useCallback(() => {
    if (!expandable) return;
    grid.toggleRowExpanded(row.id);
  }, [expandable, grid, row.id]);

  const label = expanded ? grid.t.collapseRow : grid.t.expandRow;
  const ariaProps = grid.getCellProps(row.id, column.id);

  return (
    <td
      ref={(el) => {
        cellRef(el);
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={selectClass}
      style={style}
      data-datagrid-cell=""
      data-datagrid-expand-cell=""
      data-column-id={column.id}
      data-expanded={expanded || undefined}
      tabIndex={isFocused ? 0 : -1}
      onFocus={() => {
        if (!isFocused) focus.setFocused({ row: rowIndex, col: colIndex });
      }}
      {...ariaProps}
      {...rest}
    >
      {expandable ? (
        <Button
          variant="ghost"
          size="sm"
          aria-label={label}
          aria-expanded={expanded}
          aria-controls={`datagrid-expansion-${String(row.id)}`}
          data-datagrid-expand-trigger=""
          onClick={handleClick}
        >
          {expanded ? (
            <ChevronDown aria-hidden="true" className="size-4" />
          ) : (
            <ChevronRight aria-hidden="true" className="size-4" />
          )}
        </Button>
      ) : null}
    </td>
  );
}

export const DataGridExpandBodyCell = forwardRef(
  DataGridExpandBodyCellImpl as (
    props: DataGridExpandBodyCellProps<unknown>,
    ref: ForwardedRef<HTMLTableCellElement>,
  ) => ReactElement,
  'DataGrid.ExpandBodyCell',
) as <T = unknown>(
  props: DataGridExpandBodyCellProps<T> & { ref?: Ref<HTMLTableCellElement> },
) => ReactElement;
