'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  useCallback,
  useMemo,
  useRef,
  type ForwardedRef,
  type ReactElement,
  type Ref,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';

import { Checkbox } from '../../Checkbox/Checkbox';
import { dataGridSelectCellRecipe, dataGridThRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import { useCellRef, useDataGridFocus } from '../DataGridFocus';
import type { ColumnDef, Row, RowId } from '../DataGrid.types';

/* -------------------------------------------------------------------------- */
/*  Header — tri-state "select all on this page" checkbox                      */
/* -------------------------------------------------------------------------- */

export interface DataGridSelectHeaderCellProps<T = unknown>
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align' | 'scope'> {
  column: ColumnDef<T>;
  colIndex: number;
  sx?: Sx;
}

function DataGridSelectHeaderCellImpl<T>(
  props: DataGridSelectHeaderCellProps<T>,
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

  // Visible body rows on the current page — the header checkbox controls only this
  // slice, so "select all" never silently selects rows the user can't see.
  const visibleIds = grid.paginationInfo.rows.map((r) => r.id);
  const selectedIds = grid.state.selection.ids;
  const selectedSet = useMemo<Set<RowId>>(() => {
    if (selectedIds instanceof Set) return selectedIds;
    if (selectedIds === null || selectedIds === undefined) return new Set();
    return new Set([selectedIds]);
  }, [selectedIds]);

  const selectedCount = visibleIds.filter((id) => selectedSet.has(id)).length;
  const allSelected = visibleIds.length > 0 && selectedCount === visibleIds.length;
  const someSelected = selectedCount > 0 && !allSelected;
  const isMultiple = grid.state.selection.mode === 'multiple';

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
      data-datagrid-select-cell=""
      data-column-id={column.id}
      tabIndex={isFocused ? 0 : -1}
      onFocus={() => {
        if (!isFocused) focus.setFocused({ row: -1, col: colIndex });
      }}
      {...rest}
    >
      {isMultiple ? (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onCheckedChange={() => grid.toggleAllSelection()}
          aria-label={grid.t.selectAllRows}
        />
      ) : (
        <span className="sr-only">{grid.t.selectAllRows}</span>
      )}
    </th>
  );
}

export const DataGridSelectHeaderCell = forwardRef(
  DataGridSelectHeaderCellImpl as (
    props: DataGridSelectHeaderCellProps<unknown>,
    ref: ForwardedRef<HTMLTableCellElement>,
  ) => ReactElement,
  'DataGrid.SelectHeaderCell',
) as <T = unknown>(
  props: DataGridSelectHeaderCellProps<T> & { ref?: Ref<HTMLTableCellElement> },
) => ReactElement;

/* -------------------------------------------------------------------------- */
/*  Body — per-row Checkbox / Radio with shift-click range + cmd-click toggle  */
/* -------------------------------------------------------------------------- */

export interface DataGridSelectBodyCellProps<T = unknown>
  extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  column: ColumnDef<T>;
  row: Row<T>;
  rowIndex: number;
  colIndex: number;
  sx?: Sx;
}

function DataGridSelectBodyCellImpl<T>(
  props: DataGridSelectBodyCellProps<T>,
  ref: ForwardedRef<HTMLTableCellElement>,
): ReactElement {
  const { column, row, rowIndex, colIndex, className: _className, sx: _sx, style, ...rest } = props;
  void _className;
  void _sx;
  const ctx = useDataGridContext<T>();
  const { grid } = ctx;
  const cellRef = useCellRef(rowIndex, colIndex);
  const focus = useDataGridFocus();
  const isFocused = focus.isFocused(rowIndex, colIndex);

  // We render the styling via the shared td recipe + the slim select recipe; the cell
  // doesn't carry a custom data-state itself (the row tint handles that).
  const { className: selectClass } = useThemedClasses({
    recipe: dataGridSelectCellRecipe,
    componentName: 'DataGrid',
    slot: 'selectCell',
    props: {},
  });

  const selectedIds = grid.state.selection.ids;
  const selectedSet = useMemo<Set<RowId>>(() => {
    if (selectedIds instanceof Set) return selectedIds;
    if (selectedIds === null || selectedIds === undefined) return new Set();
    return new Set([selectedIds]);
  }, [selectedIds]);
  const selected = selectedSet.has(row.id);

  // Track the last raw click to detect shift / cmd modifiers. `onCheckedChange` from
  // Checkbox is the event boundary; we stash the modifiers in a ref a microtask before
  // it fires from inside the row click handler.
  const modifiersRef = useRef<{ shift: boolean; meta: boolean }>({ shift: false, meta: false });

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLTableCellElement>) => {
    modifiersRef.current = { shift: e.shiftKey, meta: e.metaKey || e.ctrlKey };
  }, []);

  const handleCheckedChange = useCallback(() => {
    const { shift } = modifiersRef.current;
    grid.toggleRowSelection(row.id, { range: shift, toggle: true });
    modifiersRef.current = { shift: false, meta: false };
  }, [grid, row.id]);

  const ariaProps = grid.getCellProps(row.id, column.id);
  const isSingle = grid.state.selection.mode === 'single';

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
      data-datagrid-select-cell=""
      data-column-id={column.id}
      tabIndex={isFocused ? 0 : -1}
      onFocus={() => {
        if (!isFocused) focus.setFocused({ row: rowIndex, col: colIndex });
      }}
      onPointerDown={handlePointerDown}
      {...ariaProps}
      {...rest}
    >
      {isSingle ? (
        <input
          type="radio"
          name={`${ctx.instanceId}-selection`}
          checked={selected}
          onChange={handleCheckedChange}
          aria-label={grid.t.selectRow}
        />
      ) : (
        <Checkbox
          checked={selected}
          onCheckedChange={handleCheckedChange}
          aria-label={grid.t.selectRow}
        />
      )}
    </td>
  );
}

export const DataGridSelectBodyCell = forwardRef(
  DataGridSelectBodyCellImpl as (
    props: DataGridSelectBodyCellProps<unknown>,
    ref: ForwardedRef<HTMLTableCellElement>,
  ) => ReactElement,
  'DataGrid.SelectBodyCell',
) as <T = unknown>(
  props: DataGridSelectBodyCellProps<T> & { ref?: Ref<HTMLTableCellElement> },
) => ReactElement;