'use client';

import { createContext, useContext } from 'react';

import type { MutableRefObject, ReactNode } from 'react';

import type {
  ColumnDef,
  DataGridDensity,
  DataGridRowAction,
  DataGridVariant,
  Row,
  UseDataGridReturn,
} from './DataGrid.types';

/**
 * The single fan-out for every compound subpart (`<DataGrid.Header>`, `<DataGrid.Row>`, …).
 *
 * Carries everything a part needs to render itself:
 *  - `grid`     — the full `useDataGrid()` return (state + actions + prop-getters + i18n),
 *  - `columns`  — the *visible* columns in their final display order (pinning groups flattened),
 *  - `variant`  — chrome variant, lifted from props so recipe slots can read it without
 *                 plumbing it through every part,
 *  - `density`  — runtime density. Mirrors `grid.state.density`, exposed here so the recipe
 *                 hook can take it as a stable prop on every part instead of re-deriving.
 *  - `color`    — accent color (drives compound variants).
 *  - `bordered` / `stickyHeader` / `roundedCorners` / `elevation` — chrome toggles.
 *  - `getRowDomId(rowId)` / `getCellDomId(rowId, columnId)` — stable DOM ids the keyboard
 *    controller (PR 3) + future filter Popover anchors (PR 4) reference via `aria-controls`.
 *
 * The context value is intentionally a *single object* (not split per concern) — every render
 * already produces one stable `grid` reference from `useDataGrid`, and bundling the chrome
 * props alongside avoids forcing parts to read two contexts.
 */
export interface DataGridContextValue<T = unknown> {
  grid: UseDataGridReturn<T>;
  /** Visible columns in display order (already filtered by visibility + reordered by pinning). */
  columns: ReadonlyArray<ColumnDef<T>>;
  variant: DataGridVariant;
  density: DataGridDensity;
  color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral';
  bordered: boolean;
  stickyHeader: boolean;
  roundedCorners: 'none' | 'sm' | 'md' | 'lg';
  elevation: 'none' | 'sm' | 'md' | 'lg';
  /** Auto-generated id used for ARIA relationships (`aria-controls`, `aria-labelledby`). */
  instanceId: string;
  /** Stable DOM id for a body row. */
  getRowDomId: (rowId: string | number) => string;
  /** Stable DOM id for a body cell. */
  getCellDomId: (rowId: string | number, columnId: string) => string;
  /**
   * Optional consumer-supplied row-actions factory — set by the high-level `<DataGrid />`
   * entry when the consumer passes the `rowActions` prop. Read by `<DataGridActionsCell>`
   * when it sees a `type: 'actions'` column. Composed (headless) consumers don't need
   * this — they can compose their own actions column directly.
   */
  rowActions?: ((row: T) => DataGridRowAction[]) | undefined;
  /**
   * Consumer-supplied detail renderer for expanded rows. Set by `<DataGrid />` when the
   * `renderExpandedRow` prop is passed. `<DataGridExpansionRow>` looks here for the
   * detail JSX so headless consumers don't have to thread the renderer through manually.
   */
  renderExpandedRow?: ((row: Row<T>) => ReactNode) | undefined;
  /**
   * Predicate gating the expand toggle. When provided, rows that return `false` render
   * a placeholder cell (no chevron) instead of the toggle. Defaults to "every row is
   * expandable" when omitted.
   */
  isRowExpandable?: ((row: T) => boolean) | undefined;
  /**
   * PR 6 — ref to the root's scroll container. Populated by `<DataGrid.Root>` so
   * `<DataGrid.VirtualBody>` can hand it to `useVirtualizer` without prop drilling.
   * Headless consumers that build a custom scroller can override the ref via the
   * `scrollerRef` prop on `<DataGrid.Root>`.
   */
  scrollerRef?: MutableRefObject<HTMLDivElement | null> | undefined;
}

export const DataGridContext = createContext<DataGridContextValue<unknown> | null>(null);
DataGridContext.displayName = 'DataGridContext';

/**
 * Read the nearest `<DataGrid.Root>` context. Throws when used outside one — parts are not
 * meant to render in isolation; mis-use is a programming error, not a runtime fallback.
 *
 * The generic parameter is purely a cast convenience: at the React layer everything is
 * `unknown` because the surrounding `<DataGrid<User>>` type-parameter doesn't survive into
 * the context. Subparts that need typed rows accept their own `<T>` generic and re-assert.
 */
export function useDataGridContext<T = unknown>(): DataGridContextValue<T> {
  const ctx = useContext(DataGridContext);
  if (!ctx) {
    throw new Error(
      '[apx-ds] `useDataGridContext` must be used inside `<DataGrid.Root>` or `<DataGrid>`.',
    );
  }
  return ctx as DataGridContextValue<T>;
}