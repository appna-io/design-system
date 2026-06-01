'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import {
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

import { useDataGridContext } from '../DataGridContext';
import { dataGridTheadRecipe } from '../DataGrid.recipe';
import { useThemedClasses } from '@apx-ui/theme';

import { DataGridHeaderCell } from './DataGridHeaderCell';

export interface DataGridHeaderProps
  extends Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> {
  sx?: Sx;
}

/**
 * `<DataGrid.Header>` — the `<thead>` rowgroup.
 *
 * Renders a single header row whose cells are auto-derived from the visible columns.
 * Consumers who want a multi-row header (column groups) can drop in custom children
 * — the part renders `children` when present and skips the auto-derivation.
 */
function DataGridHeaderImpl(
  props: DataGridHeaderProps & { children?: React.ReactNode },
  ref: ForwardedRef<HTMLTableSectionElement>,
): ReactElement {
  const { className, sx, style, children, ...rest } = props;
  const ctx = useDataGridContext();
  const { columns, stickyHeader, variant } = ctx;

  const { className: theadClass, style: theadStyle } = useThemedClasses({
    recipe: dataGridTheadRecipe,
    componentName: 'DataGrid',
    slot: 'thead',
    props: { stickyHeader, variant, className, sx, style },
  });

  return (
    <thead
      ref={ref}
      className={theadClass}
      style={theadStyle ?? undefined}
      data-datagrid-thead=""
      {...rest}
    >
      {children ?? (
        <tr role="row" aria-rowindex={1} data-datagrid-header-row="">
          {columns.map((column, colIndex) => (
            <DataGridHeaderCell key={column.id} column={column} colIndex={colIndex} />
          ))}
        </tr>
      )}
    </thead>
  );
}

export const DataGridHeader = forwardRef(DataGridHeaderImpl, 'DataGrid.Header') as (
  props: DataGridHeaderProps & {
    children?: React.ReactNode;
    ref?: Ref<HTMLTableSectionElement>;
  },
) => ReactElement;