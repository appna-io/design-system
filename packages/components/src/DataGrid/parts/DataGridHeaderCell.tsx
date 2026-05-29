'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import {
  useCallback,
  useMemo,
  type CSSProperties,
  type ForwardedRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type ThHTMLAttributes,
} from 'react';

import {
  dataGridSortButtonRecipe,
  dataGridThRecipe,
} from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import { useCellRef, useDataGridFocus } from '../DataGridFocus';
import { computePinningOffsets } from '../headless/pinningOffsets';
import type { ColumnDef, SortDescriptor } from '../DataGrid.types';

import { DataGridActionsHeaderCell } from './DataGridActionsCell';
import { DataGridColumnMenu } from './DataGridColumnMenu';
import { DataGridExpandHeaderCell } from './DataGridExpandCell';
import { DataGridFilterButton } from './DataGridFilterButton';
import { DataGridResizeHandle } from './DataGridResizeHandle';
import { DataGridSelectHeaderCell } from './DataGridSelectCell';

export interface DataGridHeaderCellProps<T = unknown>
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align' | 'scope'> {
  column: ColumnDef<T>;
  /** Zero-based index of this column among the visible columns. */
  colIndex: number;
  sx?: Sx;
}

/**
 * Returns the next sort stack after a header click.
 *
 * Single-click cycles the column through: none → asc → desc → none. Shift-click
 * appends a new column to the existing sort (or cycles its direction if it's already
 * in the stack). The cycle ends at "removed" so a user can always reach the no-sort
 * state without hunting for a "clear" button.
 */
function nextSortStack(
  current: readonly SortDescriptor[],
  columnId: string,
  multi: boolean,
): SortDescriptor[] {
  const existing = current.find((s) => s.id === columnId);
  if (multi) {
    if (!existing) {
      return [...current, { id: columnId, direction: 'asc' }];
    }
    if (existing.direction === 'asc') {
      return current.map((s) => (s.id === columnId ? { ...s, direction: 'desc' as const } : s));
    }
    return current.filter((s) => s.id !== columnId);
  }
  // Single-column mode — discard the rest of the stack.
  if (!existing) return [{ id: columnId, direction: 'asc' }];
  if (existing.direction === 'asc') return [{ id: columnId, direction: 'desc' }];
  return [];
}

/**
 * `<DataGrid.HeaderCell>` — single `<th>` with click-to-sort and the sort indicator.
 *
 * The cell is the keyboard tabstop for the header row (`row = -1`). It participates in
 * the roving-focus controller via `useCellRef`, so arrow-down from any header cell
 * lands on the body cell directly below.
 *
 * Structural columns (`rowSelect`, `actions`, `expand`) are routed to their dedicated
 * header parts; the standard data-column rendering lives in `DataHeaderCellImpl` so
 * that hooks always run unconditionally inside a single component.
 */
function DataGridHeaderCellImpl<T>(
  props: DataGridHeaderCellProps<T>,
  ref: ForwardedRef<HTMLTableCellElement>,
): ReactElement {
  const { column, colIndex, className, sx, style, ...rest } = props;

  // Dispatch structural columns to their dedicated header parts. The dispatcher itself
  // contains no hooks beyond `useDataGridContext` (called inside each branch), so
  // returning early here never breaks the rules-of-hooks contract.
  if (column.type === 'rowSelect') {
    return (
      <DataGridSelectHeaderCell
        column={column}
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
      <DataGridActionsHeaderCell
        column={column}
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
      <DataGridExpandHeaderCell
        column={column}
        colIndex={colIndex}
        {...(className !== undefined ? { className } : {})}
        {...(sx !== undefined ? { sx } : {})}
        {...(style !== undefined ? { style } : {})}
        {...rest}
      />
    );
  }

  return (
    <DataHeaderCellImpl
      column={column}
      colIndex={colIndex}
      forwardedRef={ref}
      {...(className !== undefined ? { className } : {})}
      {...(sx !== undefined ? { sx } : {})}
      {...(style !== undefined ? { style } : {})}
      {...rest}
    />
  );
}

interface DataHeaderCellImplProps<T> extends Omit<DataGridHeaderCellProps<T>, never> {
  forwardedRef: ForwardedRef<HTMLTableCellElement>;
}

function DataHeaderCellImpl<T>(props: DataHeaderCellImplProps<T>): ReactElement {
  const { column, colIndex, className, sx, style, forwardedRef: ref, ...rest } = props;
  const ctx = useDataGridContext<T>();
  const { grid, density, bordered } = ctx;

  const cellRef = useCellRef(-1, colIndex);
  const focus = useDataGridFocus();
  const isFocused = focus.isFocused(-1, colIndex);

  const sortEntry = useMemo(
    () => grid.state.sort.find((s) => s.id === column.id),
    [grid.state.sort, column.id],
  );
  const sortIndex = useMemo(
    () => grid.state.sort.findIndex((s) => s.id === column.id),
    [grid.state.sort, column.id],
  );

  const sortable = column.sortable ?? false;
  const sortActive = sortEntry !== undefined;
  const align = column.align ?? 'start';

  const { className: thClass, style: thStyle } = useThemedClasses({
    recipe: dataGridThRecipe,
    componentName: 'DataGrid',
    slot: 'th',
    props: { density, align, sortable, sortActive, bordered, className, sx, style },
  });

  const { className: btnClass } = useThemedClasses({
    recipe: dataGridSortButtonRecipe,
    componentName: 'DataGrid',
    slot: 'sortButton',
    props: { align },
  });

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (!sortable) return;
      const next = nextSortStack(grid.state.sort, column.id, event.shiftKey);
      grid.setSort(next);
    },
    [sortable, grid, column.id],
  );

  const ariaProps = grid.getHeaderProps(column.id);

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
    const merged: CSSProperties = thStyle ? { ...thStyle } : {};
    // Resize override > column.width default.
    const sizeOverride = grid.state.columnSizes[column.id];
    const resolvedWidth = sizeOverride ?? column.width;
    if (resolvedWidth !== undefined) merged.width = resolvedWidth;
    if (column.minWidth !== undefined) merged.minWidth = column.minWidth;
    if (column.maxWidth !== undefined) merged.maxWidth = column.maxWidth;
    if (pinSide === 'start') {
      merged.position = 'sticky';
      merged.insetInlineStart = `${pinningOffsets.start[column.id] ?? 0}px`;
      // Pinned `<th>`s ride above unpinned ones (z-1) and the sticky body cells (z-1).
      merged.zIndex = 3;
      merged.background = 'var(--colors-bg-paper)';
    } else if (pinSide === 'end') {
      merged.position = 'sticky';
      merged.insetInlineEnd = `${pinningOffsets.end[column.id] ?? 0}px`;
      merged.zIndex = 3;
      merged.background = 'var(--colors-bg-paper)';
    }
    return Object.keys(merged).length ? merged : undefined;
  }, [
    thStyle,
    column.width,
    column.minWidth,
    column.maxWidth,
    column.id,
    grid.state.columnSizes,
    pinSide,
    pinningOffsets,
  ]);

  const headerNode: ReactNode =
    typeof column.header === 'function'
      ? column.header({ column })
      : (column.header ?? column.id);

  return (
    <th
      ref={(el) => {
        cellRef(el);
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      scope="col"
      className={thClass}
      style={inlineStyle}
      data-datagrid-header-cell=""
      data-column-id={column.id}
      data-align={align}
      {...(pinSide ? { 'data-pinned': pinSide } : {})}
      tabIndex={isFocused ? 0 : -1}
      onFocus={() => {
        if (!isFocused) focus.setFocused({ row: -1, col: colIndex });
      }}
      {...ariaProps}
      {...rest}
    >
      <div className="relative flex w-full items-center gap-1">
        {sortable ? (
          <button
            type="button"
            className={btnClass}
            data-datagrid-sort-button=""
            onClick={handleClick}
            tabIndex={-1}
          >
            <span>{headerNode}</span>
            <SortIndicator
              direction={sortEntry?.direction}
              stackIndex={grid.state.sort.length > 1 ? sortIndex : -1}
            />
          </button>
        ) : (
          <span className="min-w-0 flex-1 truncate">{headerNode}</span>
        )}
        {column.filterable ? (
          <DataGridFilterButton column={column} className="ms-auto" />
        ) : null}
        <DataGridColumnMenu column={column} />
        {column.resizable ? <DataGridResizeHandle column={column} /> : null}
      </div>
    </th>
  );
}

function SortIndicator({
  direction,
  stackIndex,
}: {
  direction: 'asc' | 'desc' | undefined;
  /** -1 hides the index pill; ≥ 0 shows the 1-based sort position. */
  stackIndex: number;
}): ReactElement {
  const icon =
    direction === 'asc' ? (
      <ArrowUp aria-hidden="true" className="size-3.5 shrink-0" data-datagrid-sort-icon="asc" />
    ) : direction === 'desc' ? (
      <ArrowDown
        aria-hidden="true"
        className="size-3.5 shrink-0"
        data-datagrid-sort-icon="desc"
      />
    ) : (
      <ArrowUpDown
        aria-hidden="true"
        className="size-3.5 shrink-0 opacity-50"
        data-datagrid-sort-icon="none"
      />
    );
  return (
    <span className="inline-flex items-center gap-0.5">
      {icon}
      {stackIndex >= 0 ? (
        <span
          aria-hidden="true"
          className="bg-bg-emphasis text-fg-default inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold"
          data-datagrid-sort-index=""
        >
          {stackIndex + 1}
        </span>
      ) : null}
    </span>
  );
}

export const DataGridHeaderCell = forwardRef(
  DataGridHeaderCellImpl as (
    props: DataGridHeaderCellProps<unknown>,
    ref: ForwardedRef<HTMLTableCellElement>,
  ) => ReactElement,
  'DataGrid.HeaderCell',
) as <T = unknown>(
  props: DataGridHeaderCellProps<T> & { ref?: Ref<HTMLTableCellElement> },
) => ReactElement;
