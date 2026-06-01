'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

import { dataGridTbodyRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';

import { DataGridExpansionRow } from './DataGridExpansionRow';
import { DataGridRow } from './DataGridRow';

export interface DataGridVirtualBodyProps
  extends Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> {
  /**
   * Estimated height (px) of a single row. Used by `@tanstack/react-virtual` to size
   * the spacer rows on first paint; the virtualizer measures real rows after mount
   * and corrects the estimate. Defaults to 40px for the standard density, which
   * matches the chrome's typical cell + line-height + border budget.
   */
  estimateRowHeight?: number;
  /**
   * Number of rows to render outside the viewport on each edge — buys smoothness on
   * fast scrolls at the cost of slightly more work per frame. The default (10) keeps
   * the windowed slice <= ~40 rows for a 30-row viewport, which is the sweet spot
   * across the Tanstack benchmarks.
   */
  overscan?: number;
  sx?: Sx;
}

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_OVERSCAN = 10;

/**
 * `<DataGrid.VirtualBody>` — replaces `<DataGrid.Body>` when virtualization is on.
 *
 * Strategy: render a single semantic `<tbody>` with a top spacer `<tr>` and a bottom
 * spacer `<tr>`, sandwiching only the rows in the current scroll window. Spacer
 * heights are computed by `@tanstack/react-virtual`'s `useVirtualizer` so the
 * scrollbar reflects the *full* row count and the visible window slides naturally
 * with the user's scroll. Keeping `<table>` markup intact (instead of swapping to
 * `display: grid`) preserves a11y, SSR, and column-width sync with the header — at
 * the cost of slightly looser per-row positioning (~1px), which is invisible in
 * practice and survives the existing visual snapshot suite.
 *
 * Pagination is meaningless under virtualization (the whole filtered set is windowed
 * directly), so the high-level `<DataGrid />` hides the pagination subpart when this
 * body mounts.
 *
 * Selection / expansion / sort / filter / column-pinning all continue to work — the
 * windowed rows still go through `<DataGrid.Row>` / `<DataGrid.Cell>`, which read the
 * same headless state. Expanded rows render their detail block immediately after the
 * parent (just like the regular body); their height contributes to the virtualizer's
 * dynamic measurement so the scroller stays correct after an expand.
 */
function DataGridVirtualBodyImpl(
  props: DataGridVirtualBodyProps,
  ref: ForwardedRef<HTMLTableSectionElement>,
): ReactElement {
  const {
    estimateRowHeight = DEFAULT_ROW_HEIGHT,
    overscan = DEFAULT_OVERSCAN,
    className,
    sx,
    style,
    ...rest
  } = props;

  const ctx = useDataGridContext();
  const { grid, variant, renderExpandedRow, scrollerRef } = ctx;
  const rows = grid.sortedRows;
  const colSpan = grid.visibleColumns.length;
  const hasExpansion = renderExpandedRow !== undefined;

  const { className: tbodyClass, style: tbodyStyle } = useThemedClasses({
    recipe: dataGridTbodyRecipe,
    componentName: 'DataGrid',
    slot: 'tbody',
    props: { variant, className, sx, style },
  });

  const estimateSize = useCallback(() => estimateRowHeight, [estimateRowHeight]);
  const getScrollElement = useCallback(
    () => scrollerRef?.current ?? null,
    [scrollerRef],
  );

  // Stable row keys keep virtualization aligned with React's reconciliation — without
  // a row id the virtualizer would reuse the wrong DOM node when a row sorts past a
  // window boundary.
  const getItemKey = useCallback((index: number) => String(rows[index]?.id ?? index), [rows]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement,
    estimateSize,
    overscan,
    getItemKey,
  });

  // If the consumer toggles expansion while virtualization is on, the parent row's
  // measured height changes; nudge the virtualizer to re-measure. The dep on
  // `grid.state.expanded` is intentional — a Set reference change is the signal.
  useEffect(() => {
    virtualizer.measure();
  }, [virtualizer, grid.state.expanded]);

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // Spacer heights flank the rendered window so the table's intrinsic height equals
  // `totalSize` and the scroll thumb tracks the full dataset.
  const { paddingTop, paddingBottom } = useMemo(() => {
    if (virtualItems.length === 0) {
      return { paddingTop: 0, paddingBottom: totalSize };
    }
    const first = virtualItems[0]!;
    const last = virtualItems[virtualItems.length - 1]!;
    return {
      paddingTop: first.start,
      paddingBottom: Math.max(0, totalSize - last.end),
    };
  }, [virtualItems, totalSize]);

  return (
    <tbody
      ref={ref}
      className={tbodyClass}
      style={tbodyStyle ?? undefined}
      data-datagrid-tbody=""
      data-virtualized=""
      {...rest}
    >
      {paddingTop > 0 ? (
        <tr aria-hidden="true" data-datagrid-virtual-spacer="start">
          <td colSpan={colSpan} style={{ height: `${paddingTop}px`, padding: 0, border: 0 }} />
        </tr>
      ) : null}
      {virtualItems.map((virtualRow) => {
        const row = rows[virtualRow.index];
        if (!row) return null;
        const isExpanded = hasExpansion && grid.state.expanded.has(row.id);
        return (
          <Fragment key={virtualRow.key}>
            <DataGridRow
              row={row}
              rowIndex={virtualRow.index}
              data-index={virtualRow.index}
              // Tanstack's measureElement reads `data-index` from the node to map the
              // measurement back to the virtual row — a stable ref function so the
              // memoed `<DataGridRow>` doesn't re-mount on every scroll tick.
              ref={virtualizer.measureElement}
            />
            {isExpanded ? (
              <DataGridExpansionRow row={row} colSpan={colSpan} />
            ) : null}
          </Fragment>
        );
      })}
      {paddingBottom > 0 ? (
        <tr aria-hidden="true" data-datagrid-virtual-spacer="end">
          <td colSpan={colSpan} style={{ height: `${paddingBottom}px`, padding: 0, border: 0 }} />
        </tr>
      ) : null}
    </tbody>
  );
}

export const DataGridVirtualBody = forwardRef(
  DataGridVirtualBodyImpl,
  'DataGrid.VirtualBody',
) as (
  props: DataGridVirtualBodyProps & { ref?: Ref<HTMLTableSectionElement> },
) => ReactElement;