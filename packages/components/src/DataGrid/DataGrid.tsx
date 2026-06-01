'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import {
  isValidElement,
  useMemo,
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { useDataGrid } from './headless/useDataGrid';
import { useResponsiveColumns } from './headless/useResponsiveColumns';
import { DataGridActionsBodyCell, DataGridActionsHeaderCell } from './parts/DataGridActionsCell';
import { DataGridBody } from './parts/DataGridBody';
import { DataGridCell } from './parts/DataGridCell';
import { DataGridCellEditor } from './parts/DataGridCellEditor';
import { DataGridColumnMenu } from './parts/DataGridColumnMenu';
import { DataGridColumnVisibility } from './parts/DataGridColumnVisibility';
import { DataGridDensitySelect } from './parts/DataGridDensitySelect';
import { DataGridEmpty } from './parts/DataGridEmpty';
import { DataGridError } from './parts/DataGridError';
import { DataGridExpandBodyCell, DataGridExpandHeaderCell } from './parts/DataGridExpandCell';
import { DataGridExpansionRow } from './parts/DataGridExpansionRow';
import { DataGridExport } from './parts/DataGridExport';
import { DataGridFilterButton } from './parts/DataGridFilterButton';
import { DataGridFilterPanel } from './parts/DataGridFilterPanel';
import { DataGridFooter } from './parts/DataGridFooter';
import { DataGridGlobalSearch } from './parts/DataGridGlobalSearch';
import { DataGridHeader } from './parts/DataGridHeader';
import { DataGridHeaderCell } from './parts/DataGridHeaderCell';
import { DataGridLoading } from './parts/DataGridLoading';
import { DataGridPagination } from './parts/DataGridPagination';
import { DataGridResizeHandle } from './parts/DataGridResizeHandle';
import { DataGridRoot } from './parts/DataGridRoot';
import { DataGridRow } from './parts/DataGridRow';
import { DataGridSelectBodyCell, DataGridSelectHeaderCell } from './parts/DataGridSelectCell';
import { DataGridSelectionBar } from './parts/DataGridSelectionBar';
import { DataGridTable } from './parts/DataGridTable';
import { DataGridToolbar } from './parts/DataGridToolbar';
import { DataGridVirtualBody } from './parts/DataGridVirtualBody';
import type {
  ColumnDef,
  DataGridColor,
  DataGridDensity,
  DataGridElevation,
  DataGridProps,
  DataGridRoundedCorners,
  DataGridVariant,
  Row,
} from './DataGrid.types';

const ROW_SELECT_COLUMN_ID = '__row_select__';
const ACTIONS_COLUMN_ID = '__actions__';
const EXPAND_COLUMN_ID = '__expand__';

/**
 * Inject the leading rowSelect column (when selection is enabled), the leading expand
 * column (when expansion is enabled), and the trailing actions column (when `rowActions`
 * is supplied). Each is skipped if the consumer already declared a column of the same
 * type — that lets them position the controls themselves.
 *
 * Column order: `[ expand, rowSelect, ...declared, actions ]`. Expand sits leftmost so
 * the chevron column lines up under itself across nested groups; rowSelect comes next
 * so the checkbox stays in its conventional second-column slot.
 */
function injectStructuralColumns<T>(
  declared: ColumnDef<T>[],
  options: { selectionEnabled: boolean; actionsEnabled: boolean; expandEnabled: boolean },
): ColumnDef<T>[] {
  const hasRowSelect = declared.some((c) => c.type === 'rowSelect');
  const hasActions = declared.some((c) => c.type === 'actions');
  const hasExpand = declared.some((c) => c.type === 'expand');
  const out: ColumnDef<T>[] = [...declared];
  if (options.selectionEnabled && !hasRowSelect) {
    out.unshift({
      id: ROW_SELECT_COLUMN_ID,
      header: '',
      type: 'rowSelect',
      sortable: false,
      filterable: false,
      hideable: false,
      resizable: false,
    } as ColumnDef<T>);
  }
  if (options.expandEnabled && !hasExpand) {
    out.unshift({
      id: EXPAND_COLUMN_ID,
      header: '',
      type: 'expand',
      sortable: false,
      filterable: false,
      hideable: false,
      resizable: false,
    } as ColumnDef<T>);
  }
  if (options.actionsEnabled && !hasActions) {
    out.push({
      id: ACTIONS_COLUMN_ID,
      header: '',
      type: 'actions',
      sortable: false,
      filterable: false,
      hideable: false,
      resizable: false,
    } as ColumnDef<T>);
  }
  return out;
}

function shouldRenderToolbar(props: {
  globalSearch?: boolean;
  columnVisibilityToggle?: boolean;
  densityToggle?: boolean;
  exportable?: boolean | { csv?: boolean; json?: boolean };
}): boolean {
  return (
    props.globalSearch !== false ||
    props.columnVisibilityToggle !== false ||
    props.densityToggle !== false ||
    props.exportable !== false
  );
}

/**
 * Returns `true` when at least one column declares an aggregation — used to decide
 * whether to mount `<DataGrid.Footer />` by default.
 */
function hasAnyAggregation<T>(columns: ColumnDef<T>[]): boolean {
  return columns.some((c) => Array.isArray(c.aggregations) && c.aggregations.length > 0);
}

/**
 * `<DataGrid />` — high-level entry point.
 *
 * Mounts the headless `useDataGrid()` state machine and renders the default subpart
 * tree: `Root → Toolbar → Table (Header + Body [+ Footer]) → Pagination + SelectionBar`.
 *
 * Auto-injects three structural columns when the consumer opts in:
 *
 *   - `selectionMode !== 'none'` prepends a `type: 'rowSelect'` column.
 *   - `expandable` prepends a `type: 'expand'` column hosting the chevron toggle.
 *   - `rowActions` appends a `type: 'actions'` column hosting the kebab Menu.
 *
 * Loading / empty / error states swap the body in place via the `<DataGrid.Loading>`,
 * `<DataGrid.Empty>`, `<DataGrid.Error>` parts. Pass `loading={true}` to show the
 * overlay; pass `emptyState` to override the default empty message (or omit it to use
 * the i18n default); pass `errorState` to switch to error mode.
 *
 * Aggregations: any column that declares `aggregations: [...]` auto-mounts
 * `<DataGrid.Footer />`. Consumers can also force it on/off by passing
 * `aggregations={true | false}`.
 */
function DataGridImpl<T>(
  props: DataGridProps<T> & { children?: ReactNode },
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    children,
    columns: rawColumns,
    variant,
    size,
    color,
    bordered,
    stickyHeader,
    roundedCorners,
    elevation,
    className,
    sx,
    style,
    /* PR 5 — surfaced */
    loading,
    emptyState,
    errorState,
    /* PR 6 — virtualization */
    virtualization,
    estimateRowHeight,
    scrollerStyle,
    aggregations,
    onRowClick: _onRowClick,
    onRowDoubleClick: _onRowDoubleClick,
    expandable,
    isRowExpandable,
    renderExpandedRow,
    expandedIds,
    onExpandedChange,
    /* PR 4 — toolbar toggles + selection + actions */
    globalSearch,
    columnVisibilityToggle,
    densityToggle,
    exportable,
    rowActions,
    selectionMode,
    selectedRowIds,
    onSelectionChange,
    ...hookOptions
  } = props;

  const selectionEnabled = selectionMode !== undefined && selectionMode !== 'none';
  const actionsEnabled = typeof rowActions === 'function';
  const expandEnabled = expandable === true || renderExpandedRow !== undefined;
  // Normalise `virtualization` to a single boolean for the body branch. The plan
  // reserves the `{ rows, columns }` object shape for column-virtualization (V2);
  // we only honour `.rows` here.
  const virtualizationEnabled =
    virtualization === 'rows' ||
    (typeof virtualization === 'object' && virtualization !== null && virtualization.rows === true);

  const columns = useMemo(
    () =>
      injectStructuralColumns(rawColumns, {
        selectionEnabled,
        actionsEnabled,
        expandEnabled,
      }),
    [rawColumns, selectionEnabled, actionsEnabled, expandEnabled],
  );

  // Bridge the consumer's `(row: T) => ReactNode` into the context's
  // `(row: Row<T>) => ReactNode` by unwrapping. Headless consumers wire the context
  // directly via `<DataGrid.Root>`; the entry handles the convenience signature.
  const wrappedRenderExpandedRow = useMemo<((row: Row<T>) => ReactNode) | undefined>(
    () => (renderExpandedRow ? (row) => renderExpandedRow(row.original) : undefined),
    [renderExpandedRow],
  );

  const grid = useDataGrid<T>({
    ...hookOptions,
    columns,
    ...(selectionMode !== undefined ? { defaultSelectionMode: selectionMode } : {}),
    ...(selectedRowIds !== undefined ? { defaultSelectedRowIds: selectedRowIds } : {}),
    ...(expandedIds !== undefined ? { defaultExpandedIds: expandedIds } : {}),
    state: {
      ...hookOptions.state,
      ...(selectedRowIds !== undefined
        ? {
            selection: {
              mode: selectionMode ?? 'none',
              ids: selectedRowIds ?? null,
              anchorId: null,
            },
          }
        : {}),
      ...(expandedIds !== undefined ? { expanded: new Set(expandedIds) } : {}),
    },
    onStateChange: (next) => {
      hookOptions.onStateChange?.(next);
      if (onSelectionChange) onSelectionChange(next.selection.ids);
      if (onExpandedChange) onExpandedChange(Array.from(next.expanded));
    },
  });

  // Bridge `column.responsive.hideBelow` → media-query → `setColumnVisibility`.
  // The hook bails out when no column declares a `responsive` block, so the
  // listener cost is zero in the common case.
  useResponsiveColumns({
    columns,
    visibility: grid.state.columnVisibility,
    setColumnVisibility: grid.setColumnVisibility,
  });

  const resolvedVariant: DataGridVariant | undefined =
    typeof variant === 'object' ? undefined : variant;
  const resolvedDensity: DataGridDensity | undefined =
    typeof size === 'object' ? undefined : size;
  const resolvedColor: DataGridColor | undefined =
    typeof color === 'object' ? undefined : color;

  const renderToolbar = shouldRenderToolbar({
    ...(globalSearch !== undefined ? { globalSearch } : {}),
    ...(columnVisibilityToggle !== undefined ? { columnVisibilityToggle } : {}),
    ...(densityToggle !== undefined ? { densityToggle } : {}),
    ...(exportable !== undefined ? { exportable } : {}),
  });

  const exportEnabled = exportable !== false;

  // Decide whether to mount the footer: explicit `aggregations` prop wins; otherwise
  // auto-mount when any visible column declares `aggregations`.
  const renderFooter =
    aggregations === true ||
    (aggregations !== false && hasAnyAggregation(grid.visibleColumns as ColumnDef<T>[]));

  // Body-state derivations. We auto-show the empty placeholder when the filtered set
  // is genuinely empty (zero rows visible); the consumer's `emptyState` overrides the
  // default copy. `errorState` always wins — render the error in place of any data.
  const hasError = errorState !== undefined && errorState !== false && errorState !== null;
  const isEmpty =
    !hasError && !loading && grid.paginationInfo.rows.length === 0;

  // If the consumer passed a custom `emptyState` / `errorState` React element, render
  // it verbatim. If they passed a plain string / number / boolean / unknown ReactNode,
  // funnel it through the default `<DataGrid.Empty>` / `<DataGrid.Error>` shells so
  // they still get the canonical layout for free.
  const renderEmpty = (): ReactElement => {
    if (emptyState !== undefined && isValidElement(emptyState)) return emptyState;
    const description =
      emptyState !== undefined && emptyState !== true ? (emptyState as ReactNode) : undefined;
    return (
      <DataGridEmpty
        {...(description !== undefined ? { description } : {})}
      />
    );
  };
  const renderError = (): ReactElement => {
    if (isValidElement(errorState)) return errorState;
    const description =
      errorState !== undefined && errorState !== true ? (errorState as ReactNode) : undefined;
    return (
      <DataGridError
        {...(description !== undefined ? { description } : {})}
      />
    );
  };

  return (
    <DataGridRoot
      ref={ref}
      grid={grid}
      {...(resolvedVariant !== undefined ? { variant: resolvedVariant } : {})}
      {...(resolvedDensity !== undefined ? { density: resolvedDensity } : {})}
      {...(resolvedColor !== undefined ? { color: resolvedColor } : {})}
      {...(bordered !== undefined ? { bordered } : {})}
      {...(stickyHeader !== undefined ? { stickyHeader } : {})}
      {...(roundedCorners !== undefined ? { roundedCorners } : {})}
      {...(elevation !== undefined ? { elevation } : {})}
      {...(rowActions !== undefined ? { rowActions } : {})}
      {...(wrappedRenderExpandedRow !== undefined
        ? { renderExpandedRow: wrappedRenderExpandedRow }
        : {})}
      {...(isRowExpandable !== undefined ? { isRowExpandable } : {})}
      {...(scrollerStyle !== undefined ? { scrollerStyle } : {})}
      {...(className !== undefined ? { className } : {})}
      {...(sx !== undefined ? { sx } : {})}
      {...(style !== undefined ? { style } : {})}
    >
      {renderToolbar ? (
        <DataGridToolbar>
          {globalSearch !== false ? <DataGridGlobalSearch /> : null}
          <div className="ms-auto flex items-center gap-2">
            {columnVisibilityToggle !== false ? <DataGridColumnVisibility /> : null}
            {densityToggle !== false ? <DataGridDensitySelect /> : null}
            {exportEnabled ? <DataGridExport /> : null}
          </div>
        </DataGridToolbar>
      ) : null}
      <DataGridTable>
        <DataGridHeader />
        {hasError ? (
          // Single full-width row hosting the error UI; tbody still mounts so SR users
          // can navigate to the alert region from the header.
          <tbody data-datagrid-tbody="">
            <tr role="row">
              <td colSpan={grid.visibleColumns.length} className="p-0">
                {renderError()}
              </td>
            </tr>
          </tbody>
        ) : isEmpty ? (
          <tbody data-datagrid-tbody="">
            <tr role="row">
              <td colSpan={grid.visibleColumns.length} className="p-0">
                {renderEmpty()}
              </td>
            </tr>
          </tbody>
        ) : virtualizationEnabled ? (
          <DataGridVirtualBody
            {...(estimateRowHeight !== undefined ? { estimateRowHeight } : {})}
          />
        ) : (
          <DataGridBody />
        )}
        {renderFooter ? <DataGridFooter /> : null}
      </DataGridTable>
      {loading ? <DataGridLoading /> : null}
      {/* Pagination is mutually exclusive with virtualization — the whole filtered set
          is windowed directly when virtualization is on, so the page controls would
          just be a no-op. */}
      {!hasError && !isEmpty && !virtualizationEnabled ? <DataGridPagination /> : null}
      {selectionEnabled ? <DataGridSelectionBar>{children}</DataGridSelectionBar> : null}
    </DataGridRoot>
  );
}

interface DataGridComponent {
  <T>(props: DataGridProps<T> & { ref?: Ref<HTMLDivElement> }): ReactElement;
  displayName?: string;
  Root: typeof DataGridRoot;
  Table: typeof DataGridTable;
  Header: typeof DataGridHeader;
  HeaderCell: typeof DataGridHeaderCell;
  Body: typeof DataGridBody;
  Row: typeof DataGridRow;
  Cell: typeof DataGridCell;
  Toolbar: typeof DataGridToolbar;
  GlobalSearch: typeof DataGridGlobalSearch;
  ColumnVisibility: typeof DataGridColumnVisibility;
  ColumnMenu: typeof DataGridColumnMenu;
  DensitySelect: typeof DataGridDensitySelect;
  Export: typeof DataGridExport;
  FilterButton: typeof DataGridFilterButton;
  FilterPanel: typeof DataGridFilterPanel;
  Pagination: typeof DataGridPagination;
  SelectionBar: typeof DataGridSelectionBar;
  SelectHeaderCell: typeof DataGridSelectHeaderCell;
  SelectCell: typeof DataGridSelectBodyCell;
  ActionsHeaderCell: typeof DataGridActionsHeaderCell;
  ActionsCell: typeof DataGridActionsBodyCell;
  ExpandHeaderCell: typeof DataGridExpandHeaderCell;
  ExpandCell: typeof DataGridExpandBodyCell;
  ExpansionRow: typeof DataGridExpansionRow;
  ResizeHandle: typeof DataGridResizeHandle;
  CellEditor: typeof DataGridCellEditor;
  Footer: typeof DataGridFooter;
  Loading: typeof DataGridLoading;
  Empty: typeof DataGridEmpty;
  Error: typeof DataGridError;
  VirtualBody: typeof DataGridVirtualBody;
}

const DataGridBase = forwardRef(
  DataGridImpl as never,
  'DataGrid',
) as unknown as DataGridComponent;

export const DataGrid: DataGridComponent = Object.assign(DataGridBase, {
  Root: DataGridRoot,
  Table: DataGridTable,
  Header: DataGridHeader,
  HeaderCell: DataGridHeaderCell,
  Body: DataGridBody,
  Row: DataGridRow,
  Cell: DataGridCell,
  Toolbar: DataGridToolbar,
  GlobalSearch: DataGridGlobalSearch,
  ColumnVisibility: DataGridColumnVisibility,
  ColumnMenu: DataGridColumnMenu,
  DensitySelect: DataGridDensitySelect,
  Export: DataGridExport,
  FilterButton: DataGridFilterButton,
  FilterPanel: DataGridFilterPanel,
  Pagination: DataGridPagination,
  SelectionBar: DataGridSelectionBar,
  SelectHeaderCell: DataGridSelectHeaderCell,
  SelectCell: DataGridSelectBodyCell,
  ActionsHeaderCell: DataGridActionsHeaderCell,
  ActionsCell: DataGridActionsBodyCell,
  ExpandHeaderCell: DataGridExpandHeaderCell,
  ExpandCell: DataGridExpandBodyCell,
  ExpansionRow: DataGridExpansionRow,
  ResizeHandle: DataGridResizeHandle,
  CellEditor: DataGridCellEditor,
  Footer: DataGridFooter,
  Loading: DataGridLoading,
  Empty: DataGridEmpty,
  Error: DataGridError,
  VirtualBody: DataGridVirtualBody,
});

export type {
  DataGridColor,
  DataGridDensity,
  DataGridElevation,
  DataGridRoundedCorners,
  DataGridVariant,
  CSSProperties,
  ReactNode,
  Sx,
};