/* High-level component + compound parts. PR 2 shipped the headless layer; PR 3 adds the DOM
 * scaffolding (table / header / body / cells), the ARIA Grid keyboard module, and the entry
 * `<DataGrid />` component. Toolbar, pagination, selection bar, column pinning, resize, cell
 * editing, expansion, and virtualization land in PRs 4-6. */

export { DataGrid } from './DataGrid';
export { useDataGrid } from './headless/useDataGrid';

/* Compound parts — re-exported individually for consumers who want to type or extend them. */
export { DataGridBody, type DataGridBodyProps } from './parts/DataGridBody';
export { DataGridCell, type DataGridCellProps } from './parts/DataGridCell';
export { DataGridHeader, type DataGridHeaderProps } from './parts/DataGridHeader';
export {
  DataGridHeaderCell,
  type DataGridHeaderCellProps,
} from './parts/DataGridHeaderCell';
export { DataGridRoot, type DataGridRootProps } from './parts/DataGridRoot';
export { DataGridRow, type DataGridRowProps } from './parts/DataGridRow';
export { DataGridTable, type DataGridTableProps } from './parts/DataGridTable';

/* PR 4 — toolbar / pagination / selection bar / filter / structural cells */
export {
  DataGridToolbar,
  type DataGridToolbarProps,
} from './parts/DataGridToolbar';
export {
  DataGridGlobalSearch,
  type DataGridGlobalSearchProps,
} from './parts/DataGridGlobalSearch';
export {
  DataGridColumnVisibility,
  type DataGridColumnVisibilityProps,
} from './parts/DataGridColumnVisibility';
export {
  DataGridDensitySelect,
  type DataGridDensitySelectProps,
} from './parts/DataGridDensitySelect';
export {
  DataGridExport,
  type DataGridExportProps,
} from './parts/DataGridExport';
export {
  DataGridFilterButton,
  type DataGridFilterButtonProps,
} from './parts/DataGridFilterButton';
export {
  DataGridFilterPanel,
  type DataGridFilterPanelProps,
} from './parts/DataGridFilterPanel';
export {
  DataGridPagination,
  type DataGridPaginationProps,
} from './parts/DataGridPagination';
export {
  DataGridSelectionBar,
  type DataGridSelectionBarProps,
} from './parts/DataGridSelectionBar';
export {
  DataGridSelectHeaderCell,
  DataGridSelectBodyCell,
  type DataGridSelectHeaderCellProps,
  type DataGridSelectBodyCellProps,
} from './parts/DataGridSelectCell';
export {
  DataGridActionsHeaderCell,
  DataGridActionsBodyCell,
  type DataGridActionsHeaderCellProps,
  type DataGridActionsBodyCellProps,
} from './parts/DataGridActionsCell';

/* PR 5 — advanced: pinning + resize + expansion + editing + aggregations + states. */
export {
  DataGridResizeHandle,
  type DataGridResizeHandleProps,
} from './parts/DataGridResizeHandle';
export {
  DataGridColumnMenu,
  type DataGridColumnMenuProps,
} from './parts/DataGridColumnMenu';
export {
  DataGridCellEditor,
  type DataGridCellEditorProps,
} from './parts/DataGridCellEditor';
export {
  DataGridExpansionRow,
  type DataGridExpansionRowProps,
} from './parts/DataGridExpansionRow';
export {
  DataGridExpandHeaderCell,
  DataGridExpandBodyCell,
  type DataGridExpandHeaderCellProps,
  type DataGridExpandBodyCellProps,
} from './parts/DataGridExpandCell';
export {
  DataGridFooter,
  type DataGridFooterProps,
} from './parts/DataGridFooter';
export {
  DataGridLoading,
  type DataGridLoadingProps,
} from './parts/DataGridLoading';
export {
  DataGridEmpty,
  type DataGridEmptyProps,
} from './parts/DataGridEmpty';
export {
  DataGridError,
  type DataGridErrorProps,
} from './parts/DataGridError';

/* PR 6 — virtualized body (opt-in; requires `@tanstack/react-virtual` peer dep). */
export {
  DataGridVirtualBody,
  type DataGridVirtualBodyProps,
} from './parts/DataGridVirtualBody';

export { isStructuralColumn, isStructuralType } from './structuralColumns';

/* PR 5 — pure aggregation + pinning helpers (consumed by Footer + HeaderCell, exposed
 * for headless consumers building bespoke layouts). */
export {
  AGGREGATION_LABELS,
  BUILT_IN_AGGREGATORS,
  avg,
  count,
  countDistinct,
  formatAggregatedValue,
  isCustomAggregation,
  max,
  median,
  min,
  runAggregation,
  runColumnAggregations,
  sum,
} from './headless/aggregators';
export { computePinningOffsets } from './headless/pinningOffsets';

export {
  DataGridContext,
  useDataGridContext,
  type DataGridContextValue,
} from './DataGridContext';

export {
  DataGridFocusProvider,
  useCellRef,
  useDataGridFocus,
} from './DataGridFocus';

export {
  clampCoord,
  coordEquals,
  nextFocusCoord,
  type CellCoord,
  type KeyboardNavOptions,
} from './DataGrid.keyboard';

export { dataGridMotion, dataGridTransition } from './DataGrid.motion';

export {
  dataGridActionsCellRecipe,
  dataGridCellEditorRecipe,
  dataGridEmptyRowRecipe,
  dataGridErrorRowRecipe,
  dataGridExpansionCellRecipe,
  dataGridExpansionRowRecipe,
  dataGridFilterButtonRecipe,
  dataGridFilterPanelRecipe,
  dataGridLoadingOverlayRecipe,
  dataGridPaginationRecipe,
  dataGridResizeHandleRecipe,
  dataGridRootRecipe,
  dataGridScrollerRecipe,
  dataGridSelectCellRecipe,
  dataGridSelectionBarRecipe,
  dataGridSortButtonRecipe,
  dataGridTableRecipe,
  dataGridTbodyRecipe,
  dataGridTdRecipe,
  dataGridTfootCellRecipe,
  dataGridTfootRecipe,
  dataGridTheadRecipe,
  dataGridThRecipe,
  dataGridToolbarRecipe,
  dataGridTrRecipe,
} from './DataGrid.recipe';


export {
  DEFAULT_DATAGRID_TRANSLATIONS,
  FILTER_OPERATORS,
  VALUELESS_OPERATORS,
} from './DataGrid.types';

/* PR 4 — i18n module. Canonical name is `enDataGridTranslations`; the legacy
 * `DEFAULT_DATAGRID_TRANSLATIONS` is kept as an alias for back-compat. */
export { enDataGridTranslations } from './i18n/locales/en';
/* PR 7 — RTL stress-test bundles. Use with `<DirectionProvider dir="rtl">` (or
 * `<html dir="rtl">`) so column pinning, sticky shadows, sort indicators, and
 * pagination arrows flip to the logical edges. */
export { heDataGridTranslations } from './i18n/locales/he';
export { arDataGridTranslations } from './i18n/locales/ar';
export {
  useDataGridTranslations,
  mergeTranslations,
} from './i18n/useDataGridTranslations';

/* PR 7 — `column.responsive.hideBelow` → media-query bridge. Auto-injected by
 * the entry component; exposed here for headless consumers building bespoke
 * layouts that still want responsive column hiding. */
export {
  useResponsiveColumns,
  RESPONSIVE_BREAKPOINT_PX,
} from './headless/useResponsiveColumns';

/* Pure helpers — exposed so consumers can roll bespoke UIs without re-implementing them. */
export { exportCsv } from './headless/exportCsv';
export { exportJson } from './headless/exportJson';
export { compareValues } from './headless/compareValues';
export { applyOperator } from './headless/filterEngine';
export { getCellValue } from './headless/getCellValue';

/* Derivations — re-exported for consumers building bespoke pipelines. */
export { deriveFilteredRows } from './headless/derivations/deriveFilteredRows';
export { deriveSortedRows } from './headless/derivations/deriveSortedRows';
export { derivePaginatedRows } from './headless/derivations/derivePaginatedRows';
export { deriveColumnOrder } from './headless/derivations/deriveColumnOrder';
export { deriveVisibleColumns } from './headless/derivations/deriveVisibleColumns';
export { derivePinnedColumns } from './headless/derivations/derivePinnedColumns';

export type {
  AggregationId,
  CellContext,
  CellEditorContext,
  ColumnAggregation,
  ColumnDef,
  ColumnFilter,
  ColumnFiltersState,
  ColumnId,
  ColumnPinningState,
  ColumnType,
  CursorPagination,
  CustomAggregation,
  DataGridColor,
  DataGridDensity,
  DataGridElevation,
  DataGridOperatorTranslations,
  DataGridProps,
  DataGridRoundedCorners,
  DataGridRowAction,
  DataGridState,
  DataGridTranslations,
  DataGridVariant,
  FilterContext,
  FilterOperator,
  FilterValue,
  HeaderContext,
  OffsetPagination,
  PaginationState,
  PersistedDataGridState,
  ResponsiveBreakpointKey,
  Row,
  RowId,
  SelectionIds,
  SelectionMode,
  SelectionState,
  SortDescriptor,
  SortDirection,
  StorageAdapter,
  StorageKind,
  UseDataGridOptions,
  UseDataGridReturn,
} from './DataGrid.types';