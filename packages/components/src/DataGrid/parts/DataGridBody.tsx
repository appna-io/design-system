'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

import { Fragment } from 'react';

import { dataGridTbodyRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';

import { DataGridExpansionRow } from './DataGridExpansionRow';
import { DataGridRow } from './DataGridRow';

export interface DataGridBodyProps
  extends Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> {
  sx?: Sx;
}

/**
 * `<DataGrid.Body>` — the `<tbody>` rowgroup.
 *
 * Maps the paginated rows from the hook to `<DataGrid.Row>` instances. PR 5 layers
 * the loading / empty / error placeholders on top via the high-level `<DataGrid />`
 * wrapper (which swaps body content when those props fire); this part stays a thin
 * data renderer so the headless API stays composable.
 */
function DataGridBodyImpl(
  props: DataGridBodyProps,
  ref: ForwardedRef<HTMLTableSectionElement>,
): ReactElement {
  const { className, sx, style, ...rest } = props;
  const ctx = useDataGridContext();
  const { grid, variant, renderExpandedRow } = ctx;
  const colSpan = grid.visibleColumns.length;
  const hasExpansion = renderExpandedRow !== undefined;

  const { className: tbodyClass, style: tbodyStyle } = useThemedClasses({
    recipe: dataGridTbodyRecipe,
    componentName: 'DataGrid',
    slot: 'tbody',
    props: { variant, className, sx, style },
  });

  return (
    <tbody
      ref={ref}
      className={tbodyClass}
      style={tbodyStyle ?? undefined}
      data-datagrid-tbody=""
      {...rest}
    >
      {grid.paginationInfo.rows.map((row, rowIndex) => {
        const isExpanded = hasExpansion && grid.state.expanded.has(row.id);
        return (
          <Fragment key={String(row.id)}>
            <DataGridRow row={row} rowIndex={rowIndex} />
            {isExpanded ? (
              <DataGridExpansionRow row={row} colSpan={colSpan} />
            ) : null}
          </Fragment>
        );
      })}
    </tbody>
  );
}

export const DataGridBody = forwardRef(DataGridBodyImpl, 'DataGrid.Body') as (
  props: DataGridBodyProps & { ref?: Ref<HTMLTableSectionElement> },
) => ReactElement;
