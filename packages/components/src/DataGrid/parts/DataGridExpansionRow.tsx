'use client';

import { useThemedClasses } from '@apx-ui/theme';
import type { ReactElement, ReactNode } from 'react';

import {
  dataGridExpansionCellRecipe,
  dataGridExpansionRowRecipe,
} from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import type { Row } from '../DataGrid.types';

export interface DataGridExpansionRowProps<T = unknown> {
  row: Row<T>;
  /** Total visible columns — drives `colSpan` on the wrapper cell. */
  colSpan: number;
  /**
   * Detail content. If omitted, the component falls back to
   * `context.renderExpandedRow(row)`. When both are missing the row renders an empty
   * placeholder (the row is still present so animation libraries can target it).
   */
  children?: ReactNode;
}

/**
 * Detail `<tr>` rendered immediately below an expanded row.
 *
 * Mounting/unmounting is driven by `<DataGridBody>` — when `state.expanded.has(row.id)`
 * is `true`, the body emits `<DataGridRow>` followed by this component. Composition
 * stays declarative so virtualization (PR 6) can simply yield two rows per expanded
 * item without special-casing.
 *
 * Accessibility: the wrapper `<tr>` carries `role="row"` + a stable `aria-rowindex`
 * derived from the parent row's index + 0.5 (so SR users still hear "row N expanded"
 * before the detail content). The single `<td>` spans every visible column.
 */
export function DataGridExpansionRow<T>(
  props: DataGridExpansionRowProps<T>,
): ReactElement {
  const { row, colSpan, children } = props;
  const ctx = useDataGridContext<T>();
  const { renderExpandedRow } = ctx;

  const { className: rowClass } = useThemedClasses({
    recipe: dataGridExpansionRowRecipe,
    componentName: 'DataGrid',
    slot: 'expansionRow',
    props: {},
  });
  const { className: cellClass } = useThemedClasses({
    recipe: dataGridExpansionCellRecipe,
    componentName: 'DataGrid',
    slot: 'expansionCell',
    props: {},
  });

  const content: ReactNode =
    children ?? (renderExpandedRow ? renderExpandedRow(row) : null);

  return (
    <tr
      className={rowClass}
      role="row"
      data-datagrid-expansion-row=""
      data-row-id={String(row.id)}
    >
      <td
        className={cellClass}
        colSpan={colSpan}
        id={`datagrid-expansion-${String(row.id)}`}
      >
        {content}
      </td>
    </tr>
  );
}
