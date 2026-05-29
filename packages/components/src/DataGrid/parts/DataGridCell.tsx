'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  useCallback,
  useMemo,
  type CSSProperties,
  type ForwardedRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type TdHTMLAttributes,
} from 'react';

import { dataGridTdRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import { useCellRef, useDataGridFocus } from '../DataGridFocus';
import { getCellValue } from '../headless/getCellValue';
import { computePinningOffsets } from '../headless/pinningOffsets';
import type { ColumnDef, Row } from '../DataGrid.types';

import { DataGridActionsBodyCell } from './DataGridActionsCell';
import { DataGridCellEditor } from './DataGridCellEditor';
import { DataGridExpandBodyCell } from './DataGridExpandCell';
import { DataGridSelectBodyCell } from './DataGridSelectCell';

export interface DataGridCellProps<T = unknown>
  extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  column: ColumnDef<T>;
  row: Row<T>;
  /** Zero-based row index within the currently rendered (paginated) body. */
  rowIndex: number;
  /** Zero-based column index within the visible columns. */
  colIndex: number;
  sx?: Sx;
}

/**
 * `<DataGrid.Cell>` — single `<td role="gridcell">`.
 *
 * Resolves the cell value via `column.accessor` and renders it through `column.cell`
 * when present (consumer-provided custom renderer); otherwise stringifies the value.
 * Registers itself with the roving-focus controller via `useCellRef` and reads its
 * tabstop state from the focus context.
 *
 * PR 5 additions:
 * - Dispatches `type: 'expand'` structural columns.
 * - When the cell is the active editing target (`state.editingCell.{rowId, columnId}`),
 *   swaps the rendered value for the consumer's `column.editor` inside
 *   `<DataGridCellEditor>`.
 * - Double-click / F2 / Enter on an editable cell calls `grid.startEditing`.
 * - Honours `column.pinned` via sticky CSS (offset computed once per render) and
 *   reads `state.columnSizes[id]` for live resize.
 */
function DataGridCellImpl<T>(
  props: DataGridCellProps<T>,
  ref: ForwardedRef<HTMLTableCellElement>,
): ReactElement {
  const { column, row, rowIndex, colIndex, className, sx, style, ...rest } = props;

  // Structural columns delegate to their own cell implementations. The dispatcher
  // itself never calls a state hook, so an early return here cannot violate the
  // rules-of-hooks contract for the data-cell path that follows.
  if (column.type === 'rowSelect') {
    return (
      <DataGridSelectBodyCell
        column={column}
        row={row}
        rowIndex={rowIndex}
        colIndex={colIndex}
        {...(className !== undefined ? { className } : {})}
        {...(sx !== undefined ? { sx } : {})}
        {...(style !== undefined ? { style } : {})}
        {...rest}
      />
    );
  }
  if (column.type === 'actions') {
    return (
      <DataGridActionsBodyCell
        column={column}
        row={row}
        rowIndex={rowIndex}
        colIndex={colIndex}
        {...(className !== undefined ? { className } : {})}
        {...(sx !== undefined ? { sx } : {})}
        {...(style !== undefined ? { style } : {})}
        {...rest}
      />
    );
  }
  if (column.type === 'expand') {
    return (
      <DataGridExpandBodyCell
        column={column}
        row={row}
        rowIndex={rowIndex}
        colIndex={colIndex}
        {...(className !== undefined ? { className } : {})}
        {...(sx !== undefined ? { sx } : {})}
        {...(style !== undefined ? { style } : {})}
        {...rest}
      />
    );
  }

  return (
    <DataCellImpl
      column={column}
      row={row}
      rowIndex={rowIndex}
      colIndex={colIndex}
      forwardedRef={ref}
      {...(className !== undefined ? { className } : {})}
      {...(sx !== undefined ? { sx } : {})}
      {...(style !== undefined ? { style } : {})}
      {...rest}
    />
  );
}

interface DataCellImplProps<T> extends DataGridCellProps<T> {
  forwardedRef: ForwardedRef<HTMLTableCellElement>;
}


function DataCellImpl<T>(props: DataCellImplProps<T>): ReactElement {
  const { column, row, rowIndex, colIndex, className, sx, style, forwardedRef: ref, ...rest } = props;
  const ctx = useDataGridContext<T>();
  const { grid, density, bordered } = ctx;

  const cellRef = useCellRef(rowIndex, colIndex);
  const focus = useDataGridFocus();
  const isFocused = focus.isFocused(rowIndex, colIndex);

  const align = column.align ?? 'start';
  const value = useMemo(() => getCellValue(row.original, column), [row.original, column]);

  const { className: tdClass, style: tdStyle } = useThemedClasses({
    recipe: dataGridTdRecipe,
    componentName: 'DataGrid',
    slot: 'td',
    props: { density, align, bordered, className, sx, style },
  });

  const pinSide: 'start' | 'end' | null = useMemo(() => {
    if (grid.state.columnPinning.start.includes(column.id)) return 'start';
    if (grid.state.columnPinning.end.includes(column.id)) return 'end';
    return null;
  }, [grid.state.columnPinning, column.id]);

  const pinningOffsets = useMemo(
    () => computePinningOffsets(grid.pinnedGroups, grid.state.columnSizes, 150),
    [grid.pinnedGroups, grid.state.columnSizes],
  );

  const inlineStyle = useMemo<CSSProperties | undefined>(() => {
    const merged: CSSProperties = tdStyle ? { ...tdStyle } : {};
    const sizeOverride = grid.state.columnSizes[column.id];
    const resolvedWidth = sizeOverride ?? column.width;
    if (resolvedWidth !== undefined) merged.width = resolvedWidth;
    if (column.minWidth !== undefined) merged.minWidth = column.minWidth;
    if (column.maxWidth !== undefined) merged.maxWidth = column.maxWidth;
    if (pinSide === 'start') {
      merged.position = 'sticky';
      merged.insetInlineStart = `${pinningOffsets.start[column.id] ?? 0}px`;
      merged.zIndex = 1;
      merged.background = 'var(--colors-bg-paper)';
    } else if (pinSide === 'end') {
      merged.position = 'sticky';
      merged.insetInlineEnd = `${pinningOffsets.end[column.id] ?? 0}px`;
      merged.zIndex = 1;
      merged.background = 'var(--colors-bg-paper)';
    }
    return Object.keys(merged).length ? merged : undefined;
  }, [
    tdStyle,
    column.width,
    column.minWidth,
    column.maxWidth,
    column.id,
    grid.state.columnSizes,
    pinSide,
    pinningOffsets,
  ]);

  const isEditing =
    grid.state.editingCell !== null &&
    grid.state.editingCell.rowId === row.id &&
    grid.state.editingCell.columnId === column.id;

  const startEdit = useCallback(() => {
    if (!column.editable) return;
    grid.startEditing(row.id, column.id);
  }, [column.editable, column.id, grid, row.id]);

  const handleDoubleClick = useCallback(
    (event: ReactMouseEvent<HTMLTableCellElement>) => {
      rest.onDoubleClick?.(event);
      if (event.defaultPrevented) return;
      startEdit();
    },
    [rest, startEdit],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTableCellElement>) => {
      rest.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      // Roving-focus owns arrow keys; we only listen for the edit-entry keys.
      if (!column.editable || isEditing) return;
      if (event.key === 'F2' || event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        startEdit();
      }
    },
    [column.editable, isEditing, rest, startEdit],
  );

  const content: ReactNode = isEditing ? (
    <DataGridCellEditor column={column} row={row} value={value} />
  ) : column.cell ? (
    column.cell({
      value,
      row: row.original,
      rowId: row.id,
      rowIndex: row.index,
      column,
    })
  ) : (
    ((value ?? null) as ReactNode)
  );

  const ariaProps = grid.getCellProps(row.id, column.id);

  // Strip the handlers we've wrapped above so they don't fire twice from `{...rest}`.
  const { onDoubleClick: _omitDouble, onKeyDown: _omitKey, ...restProps } = rest;
  void _omitDouble;
  void _omitKey;

  return (
    <td
      ref={(el) => {
        cellRef(el);
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={tdClass}
      style={inlineStyle}
      data-datagrid-cell=""
      data-column-id={column.id}
      data-align={align}
      data-editing={isEditing || undefined}
      {...(pinSide ? { 'data-pinned': pinSide } : {})}
      tabIndex={isFocused ? 0 : -1}
      onFocus={() => {
        if (!isFocused) focus.setFocused({ row: rowIndex, col: colIndex });
      }}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      {...ariaProps}
      {...restProps}
    >
      {content}
    </td>
  );
}

export const DataGridCell = forwardRef(
  DataGridCellImpl as (
    props: DataGridCellProps<unknown>,
    ref: ForwardedRef<HTMLTableCellElement>,
  ) => ReactElement,
  'DataGrid.Cell',
) as <T = unknown>(
  props: DataGridCellProps<T> & { ref?: Ref<HTMLTableCellElement> },
) => ReactElement;
