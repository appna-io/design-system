'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

import { dataGridToolbarRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';

export interface DataGridToolbarProps
  extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx;
}

/**
 * `<DataGrid.Toolbar>` — the top flex container above the table.
 *
 * Children typically: `<DataGrid.GlobalSearch />`, `<DataGrid.ColumnVisibility />`,
 * `<DataGrid.DensitySelect />`, `<DataGrid.Export />` (any order, any subset). The
 * toolbar carries no opinion about which items appear — the high-level `<DataGrid />`
 * entry wires the default set based on the `globalSearch` / `columnVisibilityToggle`
 * / `densityToggle` / `exportable` props.
 */
function DataGridToolbarImpl(
  props: DataGridToolbarProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { className, sx, style, children, ...rest } = props;
  const ctx = useDataGridContext();
  const { variant, bordered } = ctx;

  const { className: toolbarClass, style: toolbarStyle } = useThemedClasses({
    recipe: dataGridToolbarRecipe,
    componentName: 'DataGrid',
    slot: 'toolbar',
    props: { variant, bordered, className, sx, style },
  });

  return (
    <div
      ref={ref}
      className={toolbarClass}
      style={toolbarStyle ?? undefined}
      data-datagrid-toolbar=""
      role="toolbar"
      aria-label="Data grid toolbar"
      {...rest}
    >
      {children}
    </div>
  );
}

export const DataGridToolbar = forwardRef(DataGridToolbarImpl, 'DataGrid.Toolbar') as (
  props: DataGridToolbarProps & { ref?: Ref<HTMLDivElement> },
) => ReactElement;