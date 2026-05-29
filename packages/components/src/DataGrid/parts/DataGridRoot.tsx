'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  useId,
  useMemo,
  useRef,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { dataGridRootRecipe, dataGridScrollerRecipe } from '../DataGrid.recipe';
import {
  DataGridContext,
  type DataGridContextValue,
} from '../DataGridContext';
import type {
  DataGridColor,
  DataGridDensity,
  DataGridElevation,
  DataGridRoundedCorners,
  DataGridRowAction,
  DataGridVariant,
  Row,
  UseDataGridReturn,
} from '../DataGrid.types';

export interface DataGridRootProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The `useDataGrid()` return value. Required — `<DataGrid.Root>` is the headless escape hatch. */
  grid: UseDataGridReturn<T>;
  variant?: DataGridVariant | undefined;
  density?: DataGridDensity | undefined;
  color?: DataGridColor | undefined;
  bordered?: boolean | undefined;
  stickyHeader?: boolean | undefined;
  roundedCorners?: DataGridRoundedCorners | undefined;
  elevation?: DataGridElevation | undefined;
  /** Forwarded to the underlying scroller `<div>` for fixed-height grids. */
  scrollerStyle?: CSSProperties | undefined;
  /**
   * Per-row actions factory — surfaced on the DataGridContext so
   * `<DataGrid.ActionsCell>` can render the row's `<Menu>` items without re-threading
   * the prop through every subpart.
   */
  rowActions?: ((row: T) => DataGridRowAction[]) | undefined;
  /**
   * Detail renderer for expanded rows — surfaced on the context so
   * `<DataGridExpansionRow>` and the body's expand dispatch can read it without prop
   * drilling.
   */
  renderExpandedRow?: ((row: Row<T>) => ReactNode) | undefined;
  /** Predicate gating the per-row expand toggle. Defaults to "all rows expandable". */
  isRowExpandable?: ((row: T) => boolean) | undefined;
  /**
   * Optional ref to a consumer-owned scroll container. When omitted (the common case)
   * the root creates its own internal scroller `<div>` and exposes it on the context
   * for `<DataGrid.VirtualBody>`. Provide your own when you embed the grid inside a
   * pre-existing scroll surface (e.g. a dashboard panel with its own overflow).
   */
  scrollerRef?: MutableRefObject<HTMLDivElement | null> | undefined;
  sx?: Sx | undefined;
  children: ReactNode;
}

/**
 * `<DataGrid.Root>` — the outer wrapper.
 *
 * Owns the `DataGridContext` provider, the root recipe, the optional scroll container,
 * and the (PR 5+) screen-reader live region. Headless consumers compose it directly to
 * reorder or omit toolbar / pagination subparts; the high-level `<DataGrid>` mounts it
 * implicitly.
 *
 * The wrapper deliberately does **not** render the toolbar or pagination — the headless
 * API expects callers to compose those subparts themselves. The high-level entry
 * component (PR 3) renders them in the default order.
 */
function DataGridRootImpl<T>(
  props: DataGridRootProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    grid,
    variant = 'solid',
    density,
    color = 'primary',
    bordered = true,
    stickyHeader = true,
    roundedCorners = 'md',
    elevation = 'none',
    className,
    sx,
    style,
    scrollerStyle,
    rowActions,
    renderExpandedRow,
    isRowExpandable,
    scrollerRef: scrollerRefProp,
    children,
    ...rest
  } = props;
  // Mirror runtime density from state if the consumer didn't pin it via the prop —
  // the toolbar's density toggle drives state.density and we want the recipe to track.
  const effectiveDensity = density ?? grid.state.density;
  const instanceId = useId();

  // Either reuse the consumer's ref (when they own the scroll surface) or own our own.
  // The ref is exposed on the context so `<DataGrid.VirtualBody>` can pass it straight
  // to `useVirtualizer` without prop-drilling through every level of compound surface.
  const internalScrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = scrollerRefProp ?? internalScrollerRef;

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: dataGridRootRecipe,
    componentName: 'DataGrid',
    slot: 'root',
    props: { variant, bordered, roundedCorners, elevation, className, sx, style },
  });

  const { className: scrollerClass } = useThemedClasses({
    recipe: dataGridScrollerRecipe,
    componentName: 'DataGrid',
    slot: 'scroller',
    props: {},
  });

  const contextValue = useMemo<DataGridContextValue<T>>(
    () => ({
      grid,
      columns: grid.visibleColumns,
      variant,
      density: effectiveDensity,
      color,
      bordered,
      stickyHeader,
      roundedCorners,
      elevation,
      instanceId,
      getRowDomId: (rowId) => `${instanceId}-row-${rowId}`,
      getCellDomId: (rowId, columnId) => `${instanceId}-cell-${rowId}-${columnId}`,
      rowActions,
      renderExpandedRow,
      isRowExpandable,
      scrollerRef,
    }),
    [
      grid,
      variant,
      effectiveDensity,
      color,
      bordered,
      stickyHeader,
      roundedCorners,
      elevation,
      instanceId,
      rowActions,
      renderExpandedRow,
      isRowExpandable,
      scrollerRef,
    ],
  );

  return (
    <DataGridContext.Provider value={contextValue as DataGridContextValue<unknown>}>
      <div
        ref={ref}
        className={rootClass}
        style={rootStyle ?? undefined}
        data-datagrid=""
        data-variant={variant}
        data-density={effectiveDensity}
        data-color={color}
        {...grid.rootProps}
        {...rest}
      >
        <div
          ref={scrollerRef}
          className={scrollerClass}
          data-datagrid-scroller=""
          style={scrollerStyle}
        >
          {children}
        </div>
      </div>
    </DataGridContext.Provider>
  );
}

export const DataGridRoot = forwardRef(DataGridRootImpl, 'DataGrid.Root') as <T>(
  props: DataGridRootProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;
