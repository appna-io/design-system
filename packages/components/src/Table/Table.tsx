'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import {
  Children,
  createElement,
  isValidElement,
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { Checkbox } from '../Checkbox/Checkbox';
import { Skeleton } from '../Skeleton/Skeleton';
import { TableContext, useTableContext } from './Table.context';
import { cycleSort, sortRows } from './sortRows';
import {
  tableCaptionRecipe,
  tableCellRecipe,
  tableEmptyRecipe,
  tableHeaderCellRecipe,
  tableRootRecipe,
  tableRowRecipe,
  tableSortButtonRecipe,
} from './Table.recipe';
import type {
  TableCaptionProps,
  TableCellAlign,
  TableCellProps,
  TableColumn,
  TableContextValue,
  TableHeaderCellProps,
  TableProps,
  TableRowProps,
  TableSelectionMode,
  TableSortDirection,
  TableSortState,
  TableSubcomponentProps,
} from './Table.types';

/* -------------------------------------------------------------------------- */
/*  Section subcomponents — thin wrappers over <thead> / <tbody> / <tfoot>     */
/* -------------------------------------------------------------------------- */

const TableHead = forwardRef<HTMLTableSectionElement, TableSubcomponentProps>(
  function TableHead({ children, className, ...rest }, ref) {
    return (
      <thead ref={ref} className={className} data-table-head="" {...rest}>
        {children}
      </thead>
    );
  },
  'Table.Head',
);

const TableBody = forwardRef<HTMLTableSectionElement, TableSubcomponentProps>(
  function TableBody({ children, className, ...rest }, ref) {
    return (
      <tbody ref={ref} className={className} data-table-body="" {...rest}>
        {children}
      </tbody>
    );
  },
  'Table.Body',
);

const TableFoot = forwardRef<HTMLTableSectionElement, TableSubcomponentProps>(
  function TableFoot({ children, className, ...rest }, ref) {
    return (
      <tfoot ref={ref} className={className} data-table-foot="" {...rest}>
        {children}
      </tfoot>
    );
  },
  'Table.Foot',
);

/* -------------------------------------------------------------------------- */
/*  Row                                                                       */
/* -------------------------------------------------------------------------- */

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, selected, disabled, current, children, sx, style, ...rest },
  ref,
) {
  const { hoverable, striped } = useTableContext();
  const interactive = Boolean(rest.onClick);
  const { className: rowClass, style: rowStyle } = useThemedClasses({
    recipe: tableRowRecipe,
    componentName: 'Table',
    slot: 'row',
    props: { hoverable, striped, interactive, className, sx, style },
  });

  const trProps: Record<string, unknown> = {
    ...rest,
    ref,
    className: rowClass,
    'data-table-row': '',
  };
  if (rowStyle) trProps.style = rowStyle;
  if (selected) {
    trProps['data-selected'] = 'true';
    trProps['aria-selected'] = true;
  } else if (selected === false) {
    trProps['aria-selected'] = false;
  }
  if (disabled) trProps['data-disabled'] = 'true';
  if (current) trProps['aria-current'] = 'row';

  return createElement('tr', trProps, children);
}, 'Table.Row');

/* -------------------------------------------------------------------------- */
/*  Body cell                                                                 */
/* -------------------------------------------------------------------------- */

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, align = 'start', truncate = false, children, sx, style, ...rest },
  ref,
) {
  const { density, bordered } = useTableContext();
  const { className: cellClass, style: cellStyle } = useThemedClasses({
    recipe: tableCellRecipe,
    componentName: 'Table',
    slot: 'cell',
    props: { density, align, truncate, bordered, className, sx, style },
  });
  return (
    <td
      ref={ref}
      className={cellClass}
      style={cellStyle ?? undefined}
      data-table-cell=""
      data-align={align}
      {...rest}
    >
      {children}
    </td>
  );
}, 'Table.Cell');

/* -------------------------------------------------------------------------- */
/*  Header cell                                                               */
/* -------------------------------------------------------------------------- */

const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell(
    {
      className,
      align = 'start',
      sortable = false,
      sortDirection,
      onSortClick,
      scope = 'col',
      children,
      sx,
      style,
      ...rest
    },
    ref,
  ) {
    const { density, bordered, stickyHeader } = useTableContext();
    const sortActive = sortDirection !== undefined && sortDirection !== null;
    const { className: thClass, style: thStyle } = useThemedClasses({
      recipe: tableHeaderCellRecipe,
      componentName: 'Table',
      slot: 'headerCell',
      props: {
        density,
        align,
        sortable,
        sortActive,
        sticky: stickyHeader,
        bordered,
        className,
        sx,
        style,
      },
    });
    const { className: btnClass } = useThemedClasses({
      recipe: tableSortButtonRecipe,
      componentName: 'Table',
      slot: 'sortButton',
      props: { align },
    });

    const ariaSort: 'ascending' | 'descending' | 'none' | undefined = sortable
      ? sortDirection === 'asc'
        ? 'ascending'
        : sortDirection === 'desc'
          ? 'descending'
          : 'none'
      : undefined;

    return (
      <th
        ref={ref}
        scope={scope}
        className={thClass}
        style={thStyle ?? undefined}
        data-table-header-cell=""
        data-align={align}
        aria-sort={ariaSort}
        {...rest}
      >
        {sortable ? (
          <button
            type="button"
            className={btnClass}
            data-table-sort-button=""
            onClick={onSortClick}
          >
            <span>{children}</span>
            <SortIndicator direction={sortDirection} />
          </button>
        ) : (
          children
        )}
      </th>
    );
  },
  'Table.HeaderCell',
);

/**
 * Sort indicator icon — three states: ascending arrow, descending arrow, or the neutral
 * up/down chevron pair when the column is sortable but not currently active. Always
 * `aria-hidden` because the screen-reader announcement comes from `aria-sort` on the `<th>`.
 */
function SortIndicator({
  direction,
}: {
  direction: TableSortDirection | undefined;
}): ReactElement {
  if (direction === 'asc') {
    return <ArrowUp aria-hidden="true" className="size-3.5 shrink-0" data-table-sort-icon="asc" />;
  }
  if (direction === 'desc') {
    return <ArrowDown aria-hidden="true" className="size-3.5 shrink-0" data-table-sort-icon="desc" />;
  }
  return (
    <ArrowUpDown
      aria-hidden="true"
      className="size-3.5 shrink-0 opacity-50"
      data-table-sort-icon="none"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Caption                                                                   */
/* -------------------------------------------------------------------------- */

const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  function TableCaption({ className, visuallyHidden = false, children, sx, style, ...rest }, ref) {
    const { className: captionClass, style: captionStyle } = useThemedClasses({
      recipe: tableCaptionRecipe,
      componentName: 'Table',
      slot: 'caption',
      props: { visuallyHidden, className, sx, style },
    });
    return (
      <caption
        ref={ref}
        className={captionClass}
        style={captionStyle ?? undefined}
        data-table-caption=""
        {...rest}
      >
        {children}
      </caption>
    );
  },
  'Table.Caption',
);

/* -------------------------------------------------------------------------- */
/*  Helpers — compound detection + selection state                            */
/* -------------------------------------------------------------------------- */

const TABLE_SECTION_TYPES: ReadonlySet<unknown> = new Set([TableHead, TableBody, TableFoot]);

/** True when at least one direct child is a `Table.Head` / `Table.Body` / `Table.Foot`. */
function hasCompoundSection(children: ReactNode): boolean {
  let found = false;
  Children.forEach(children, (child) => {
    if (found) return;
    if (isValidElement(child) && TABLE_SECTION_TYPES.has(child.type as unknown)) found = true;
  });
  return found;
}

/**
 * Normalise the controlled / uncontrolled selection signal into a `Set<string>` (for the
 * `multiple` mode) or a single string (for `single`). Returns `null` when selection is off so
 * callers can quickly skip the checkbox column.
 */
function normalizeSelected(
  mode: TableSelectionMode,
  selected: string | string[] | undefined,
): Set<string> | string | null {
  if (mode === 'none' || selected === undefined) return mode === 'none' ? null : new Set<string>();
  if (mode === 'multiple') {
    return new Set(Array.isArray(selected) ? selected : selected ? [selected] : []);
  }
  return Array.isArray(selected) ? (selected[0] ?? '') : selected;
}

/* -------------------------------------------------------------------------- */
/*  Table root                                                                */
/* -------------------------------------------------------------------------- */

/**
 * `<Table />` — the canonical lightweight semantic table primitive.
 *
 * Two APIs share the same DOM:
 *
 *  - **Compound** (`<Table.Head>` / `<Table.Body>` / `<Table.Row>` / `<Table.Cell>`) is for
 *    "I want full control of the markup."
 *  - **Declarative** (`columns` + `data`) is for "I have an array and just want a nice table."
 *
 * When *any* `<Table.Head>` / `<Table.Body>` / `<Table.Foot>` child is present, Table flips
 * into compound mode and ignores `columns` / `data` / `loading` / `empty` / `sort` /
 * `selectionMode` / `rowActions`. The compound API is the "I'll wire it myself" escape hatch
 * — it doesn't try to be smart.
 *
 * **Out of scope** (these belong to DataGrid Phase 27):
 *  - Multi-column sort
 *  - Column resize / pin / reorder
 *  - Virtualization
 *  - Cell editing
 *  - Row expansion / detail panels
 *
 * Table targets the 80% case at < 4 KB gz; anything richer routes to DataGrid.
 *
 * @example
 *   <Table
 *     ariaLabel="Users"
 *     columns={[
 *       { id: 'name', header: 'Name', accessor: (u) => u.name, sortable: true },
 *       { id: 'email', header: 'Email', accessor: (u) => u.email },
 *     ]}
 *     data={users}
 *     getRowId={(u) => u.id}
 *     selectionMode="multiple"
 *     selected={selected}
 *     onSelectedChange={setSelected}
 *   />
 */
function TableImpl<T>(props: TableProps<T>, ref: React.ForwardedRef<HTMLTableElement>): ReactElement {
  const {
    columns,
    data,
    getRowId,
    sort: sortProp,
    defaultSort,
    onSortChange,
    selectionMode = 'none',
    selected: selectedProp,
    defaultSelected,
    onSelectedChange,
    isRowSelectable,
    rowActions,
    onRowClick,
    loading = false,
    loadingRowCount = 5,
    empty,
    error,
    variant = 'default',
    density = 'md',
    striped = false,
    bordered = true,
    hoverable = true,
    stickyHeader = false,
    ariaLabel,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  // Controlled / uncontrolled sort state. The internal state only fires when `sort` isn't
  // supplied by the consumer; in controlled mode we forward clicks via `onSortChange` and
  // leave the source of truth with them.
  const [internalSort, setInternalSort] = useState<TableSortState | undefined>(defaultSort);
  const sort = sortProp ?? internalSort;
  const updateSort = useCallback(
    (next: TableSortState | undefined) => {
      if (sortProp === undefined) setInternalSort(next);
      if (onSortChange) onSortChange(next);
    },
    [sortProp, onSortChange],
  );

  // Controlled / uncontrolled selection state, same shape rules as sort.
  const [internalSelected, setInternalSelected] = useState<string | string[] | undefined>(
    defaultSelected,
  );
  const selectedValue = selectedProp ?? internalSelected;
  const normalizedSelected = normalizeSelected(selectionMode, selectedValue);
  const updateSelected = useCallback(
    (next: string | string[]) => {
      if (selectedProp === undefined) setInternalSelected(next);
      if (onSelectedChange) onSelectedChange(next);
    },
    [selectedProp, onSelectedChange],
  );

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: tableRootRecipe,
    componentName: 'Table',
    props: { variant, className, sx, style },
  });

  const contextValue: TableContextValue = {
    density,
    bordered,
    striped,
    hoverable,
    stickyHeader,
    variant,
  };

  const isCompound = hasCompoundSection(children);

  return (
    <TableContext.Provider value={contextValue}>
      <table
        ref={ref}
        className={rootClass}
        style={rootStyle ?? undefined}
        data-table=""
        data-variant={variant}
        data-density={density}
        aria-label={ariaLabel}
        {...rest}
      >
        {isCompound ? (
          children
        ) : (
          <DeclarativeBody<T>
            columns={columns ?? []}
            data={data ?? []}
            getRowId={getRowId}
            sort={sort}
            updateSort={updateSort}
            selectionMode={selectionMode}
            normalizedSelected={normalizedSelected}
            updateSelected={updateSelected}
            isRowSelectable={isRowSelectable}
            rowActions={rowActions}
            onRowClick={onRowClick}
            loading={loading}
            loadingRowCount={loadingRowCount}
            empty={empty}
            error={error}
          />
        )}
      </table>
    </TableContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Declarative body — renders <thead> + <tbody> from columns / data           */
/* -------------------------------------------------------------------------- */

interface DeclarativeBodyProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: ((row: T, index: number) => string) | undefined;
  sort: TableSortState | undefined;
  updateSort: (next: TableSortState | undefined) => void;
  selectionMode: TableSelectionMode;
  normalizedSelected: Set<string> | string | null;
  updateSelected: (next: string | string[]) => void;
  isRowSelectable: ((row: T, index: number) => boolean) | undefined;
  rowActions: ((row: T, index: number) => ReactNode) | undefined;
  onRowClick: ((row: T, index: number) => void) | undefined;
  loading: boolean;
  loadingRowCount: number;
  empty: ReactNode;
  error: ReactNode;
}

function DeclarativeBody<T>(props: DeclarativeBodyProps<T>): ReactElement {
  const {
    columns,
    data,
    getRowId,
    sort,
    updateSort,
    selectionMode,
    normalizedSelected,
    updateSelected,
    isRowSelectable,
    rowActions,
    onRowClick,
    loading,
    loadingRowCount,
    empty,
    error,
  } = props;
  const visibleColumns = columns.filter((c) => !c.hidden);
  const sortedColumn = useMemo(
    () => (sort ? visibleColumns.find((c) => c.id === sort.id) : undefined),
    [sort, visibleColumns],
  );
  const sortedRows = useMemo(() => {
    if (!sort || !sortedColumn) return data;
    return sortRows({ rows: data, column: sortedColumn, direction: sort.direction });
  }, [data, sort, sortedColumn]);

  const rowId = useCallback(
    (row: T, index: number): string => getRowId?.(row, index) ?? String(index),
    [getRowId],
  );

  const totalColumns =
    visibleColumns.length + (selectionMode !== 'none' ? 1 : 0) + (rowActions ? 1 : 0);

  // Master-checkbox state for `multiple` selection — three states (none / some / all).
  const selectableIds = useMemo(() => {
    if (selectionMode !== 'multiple') return [] as string[];
    return data
      .map((row, i) => ({ id: rowId(row, i), row, i }))
      .filter((entry) =>
        isRowSelectable ? isRowSelectable(entry.row, entry.i) : true,
      )
      .map((entry) => entry.id);
  }, [data, rowId, selectionMode, isRowSelectable]);

  const selectedSet =
    normalizedSelected instanceof Set ? normalizedSelected : null;
  const selectedCount = selectedSet ? selectableIds.filter((id) => selectedSet.has(id)).length : 0;
  const allSelected = selectableIds.length > 0 && selectedCount === selectableIds.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      updateSelected([]);
    } else {
      updateSelected([...selectableIds]);
    }
  }, [allSelected, selectableIds, updateSelected]);

  const toggleRow = useCallback(
    (id: string) => {
      if (selectionMode === 'single') {
        const currentSingle = typeof normalizedSelected === 'string' ? normalizedSelected : '';
        updateSelected(currentSingle === id ? '' : id);
        return;
      }
      if (selectionMode === 'multiple' && selectedSet) {
        const next = new Set(selectedSet);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        updateSelected([...next]);
      }
    },
    [normalizedSelected, selectedSet, selectionMode, updateSelected],
  );

  const isRowSelected = useCallback(
    (id: string): boolean => {
      if (selectionMode === 'single') {
        return normalizedSelected === id;
      }
      if (selectionMode === 'multiple' && selectedSet) {
        return selectedSet.has(id);
      }
      return false;
    },
    [normalizedSelected, selectedSet, selectionMode],
  );

  const handleHeaderSort = useCallback(
    (column: TableColumn<T>) => {
      if (!column.sortable) return;
      updateSort(cycleSort(sort, column.id));
    },
    [sort, updateSort],
  );

  return (
    <>
      <TableHead>
        <TableRow>
          {selectionMode !== 'none' ? (
            <TableHeaderCell align="center" style={{ width: '2.5rem' }}>
              {selectionMode === 'multiple' ? (
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={toggleAll}
                  aria-label={allSelected ? 'Deselect all rows' : 'Select all rows'}
                />
              ) : (
                <span className="sr-only">Selection</span>
              )}
            </TableHeaderCell>
          ) : null}

          {visibleColumns.map((col) => {
            const direction = sort?.id === col.id ? sort.direction : undefined;
            return (
              <TableHeaderCell
                key={col.id}
                align={col.align ?? 'start'}
                sortable={col.sortable ?? false}
                sortDirection={direction}
                onSortClick={() => handleHeaderSort(col)}
                style={resolveColumnStyle(col)}
                className={col.className}
                data-column-id={col.id}
              >
                {col.header}
              </TableHeaderCell>
            );
          })}

          {rowActions ? (
            <TableHeaderCell
              align="end"
              style={{ width: '3rem' }}
              data-column-id="__actions"
            >
              <span className="sr-only">Actions</span>
            </TableHeaderCell>
          ) : null}
        </TableRow>
      </TableHead>

      <TableBody aria-busy={loading || undefined}>
        {loading ? (
          renderSkeletonRows(loadingRowCount, totalColumns)
        ) : error ? (
          <tr data-table-row="" data-table-state="error">
            <td colSpan={totalColumns} data-table-cell="">
              <div className={emptyClass()} data-table-error="">
                {error}
              </div>
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr data-table-row="" data-table-state="empty">
            <td colSpan={totalColumns} data-table-cell="">
              <div className={emptyClass()} data-table-empty="">
                {empty ?? <span>No data to display</span>}
              </div>
            </td>
          </tr>
        ) : (
          sortedRows.map((row, index) => {
            const id = rowId(row, index);
            const selectable = isRowSelectable ? isRowSelectable(row, index) : true;
            const selected = isRowSelected(id);
            return (
              <TableRow
                key={id}
                selected={selected}
                disabled={!selectable && selectionMode !== 'none'}
                onClick={
                  onRowClick
                    ? (event) => {
                        // Suppress the row click when the actual target is inside the row
                        // actions or selection cell — those own their own click semantics.
                        const target = event.target as HTMLElement | null;
                        if (target?.closest('[data-table-stop-row-click]')) return;
                        onRowClick(row, index);
                      }
                    : undefined
                }
              >
                {selectionMode !== 'none' ? (
                  <TableCell align="center" data-table-stop-row-click="">
                    <Checkbox
                      checked={selected}
                      disabled={!selectable}
                      onCheckedChange={() => toggleRow(id)}
                      aria-label={selected ? 'Deselect row' : 'Select row'}
                    />
                  </TableCell>
                ) : null}

                {visibleColumns.map((col) => {
                  const content = col.cell
                    ? col.cell(row, index)
                    : col.accessor
                      ? (col.accessor(row) as ReactNode)
                      : null;
                  return (
                    <TableCell
                      key={col.id}
                      align={col.align ?? 'start'}
                      truncate={col.truncate ?? false}
                      className={col.className}
                      style={resolveColumnStyle(col)}
                      data-column-id={col.id}
                    >
                      {content}
                    </TableCell>
                  );
                })}

                {rowActions ? (
                  <TableCell align="end" data-table-stop-row-click="">
                    {rowActions(row, index)}
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helpers — column style + skeleton rows                                    */
/* -------------------------------------------------------------------------- */

function resolveColumnStyle<T>(col: TableColumn<T>): CSSProperties {
  const style: CSSProperties = {};
  if (col.width !== undefined) style.width = typeof col.width === 'number' ? `${col.width}px` : col.width;
  if (col.minWidth !== undefined) {
    style.minWidth = typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth;
  }
  return style;
}

function emptyClass(): string {
  // Resolve the recipe class without touching context — the helper is shared between empty,
  // error, and loading-placeholder states, all of which render outside the cell ladder.
  return tableEmptyRecipe({});
}

function renderSkeletonRows(count: number, columnCount: number): ReactElement[] {
  return Array.from({ length: count }, (_, rowIdx) => (
    <tr key={`__skeleton-${rowIdx}`} data-table-row="" data-table-state="loading">
      {Array.from({ length: columnCount }, (_, colIdx) => (
        <td key={colIdx} className="px-3 py-2.5" data-table-cell="">
          <Skeleton height="1rem" width="80%" rounded="sm" />
        </td>
      ))}
    </tr>
  ));
}

/* -------------------------------------------------------------------------- */
/*  Public export — root forwardRef + statics                                 */
/* -------------------------------------------------------------------------- */

// Cast to a generic-friendly forwardRef wrapper so consumers preserve their `<T>` inference.
const TableBase = forwardRef(TableImpl, 'Table') as <T = unknown>(
  props: TableProps<T> & { ref?: React.Ref<HTMLTableElement> },
) => ReactElement;

export const Table = Object.assign(TableBase, {
  Head: TableHead,
  Body: TableBody,
  Foot: TableFoot,
  Row: TableRow,
  Cell: TableCell,
  HeaderCell: TableHeaderCell,
  Caption: TableCaption,
});

// Re-export the alignment type so example files can annotate without reaching into types.
export type { TableCellAlign };
