'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { MoreVertical } from 'lucide-react';
import {
  type ForwardedRef,
  type ReactElement,
  type Ref,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';

import { Button } from '../../Button/Button';
import { Menu } from '../../Menu';
import {
  dataGridActionsCellRecipe,
  dataGridThRecipe,
} from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import { useCellRef, useDataGridFocus } from '../DataGridFocus';
import type { ColumnDef, Row } from '../DataGrid.types';

/* -------------------------------------------------------------------------- */
/*  Header — empty cell with sr-only label                                     */
/* -------------------------------------------------------------------------- */

export interface DataGridActionsHeaderCellProps<T = unknown>
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align' | 'scope'> {
  column: ColumnDef<T>;
  colIndex: number;
  sx?: Sx;
}

function DataGridActionsHeaderCellImpl<T>(
  props: DataGridActionsHeaderCellProps<T>,
  ref: ForwardedRef<HTMLTableCellElement>,
): ReactElement {
  const { column, colIndex, className, sx, style, ...rest } = props;
  const ctx = useDataGridContext<T>();
  const { grid, density, bordered } = ctx;
  const cellRef = useCellRef(-1, colIndex);
  const focus = useDataGridFocus();
  const isFocused = focus.isFocused(-1, colIndex);

  const { className: thClass, style: thStyle } = useThemedClasses({
    recipe: dataGridThRecipe,
    componentName: 'DataGrid',
    slot: 'th',
    props: {
      density,
      align: 'end',
      sortable: false,
      sortActive: false,
      bordered,
      className,
      sx,
      style,
    },
  });
  const { className: actionsClass } = useThemedClasses({
    recipe: dataGridActionsCellRecipe,
    componentName: 'DataGrid',
    slot: 'actionsCell',
    props: {},
  });

  return (
    <th
      ref={(el) => {
        cellRef(el);
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      scope="col"
      className={`${thClass} ${actionsClass}`}
      style={thStyle ?? undefined}
      role="columnheader"
      aria-colindex={colIndex + 1}
      data-datagrid-header-cell=""
      data-datagrid-actions-cell=""
      data-column-id={column.id}
      tabIndex={isFocused ? 0 : -1}
      onFocus={() => {
        if (!isFocused) focus.setFocused({ row: -1, col: colIndex });
      }}
      {...rest}
    >
      <span className="sr-only">{grid.t.rowActions}</span>
    </th>
  );
}

export const DataGridActionsHeaderCell = forwardRef(
  DataGridActionsHeaderCellImpl as (
    props: DataGridActionsHeaderCellProps<unknown>,
    ref: ForwardedRef<HTMLTableCellElement>,
  ) => ReactElement,
  'DataGrid.ActionsHeaderCell',
) as <T = unknown>(
  props: DataGridActionsHeaderCellProps<T> & { ref?: Ref<HTMLTableCellElement> },
) => ReactElement;

/* -------------------------------------------------------------------------- */
/*  Body — Menu trigger with per-row actions                                   */
/* -------------------------------------------------------------------------- */

export interface DataGridActionsBodyCellProps<T = unknown>
  extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  column: ColumnDef<T>;
  row: Row<T>;
  rowIndex: number;
  colIndex: number;
  sx?: Sx;
}

function DataGridActionsBodyCellImpl<T>(
  props: DataGridActionsBodyCellProps<T>,
  ref: ForwardedRef<HTMLTableCellElement>,
): ReactElement {
  const { column, row, rowIndex, colIndex, className: _className, sx: _sx, style, ...rest } = props;
  void _className;
  void _sx;
  const ctx = useDataGridContext<T>();
  const { grid, rowActions } = ctx;
  const cellRef = useCellRef(rowIndex, colIndex);
  const focus = useDataGridFocus();
  const isFocused = focus.isFocused(rowIndex, colIndex);

  const { className: actionsClass } = useThemedClasses({
    recipe: dataGridActionsCellRecipe,
    componentName: 'DataGrid',
    slot: 'actionsCell',
    props: {},
  });

  // When the consumer didn't pass a `rowActions` factory but did declare an `actions`
  // column, fall back to `column.cell` (custom render) so headless consumers can
  // compose their own trigger button without losing the auto-injected column slot.
  const customCell = column.cell;
  const actions = rowActions?.(row.original) ?? [];
  const ariaProps = grid.getCellProps(row.id, column.id);

  return (
    <td
      ref={(el) => {
        cellRef(el);
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={actionsClass}
      style={style}
      data-datagrid-cell=""
      data-datagrid-actions-cell=""
      data-column-id={column.id}
      tabIndex={isFocused ? 0 : -1}
      onFocus={() => {
        if (!isFocused) focus.setFocused({ row: rowIndex, col: colIndex });
      }}
      {...ariaProps}
      {...rest}
    >
      {customCell
        ? customCell({
            value: undefined,
            row: row.original,
            rowId: row.id,
            rowIndex: row.index,
            column,
          })
        : actions.length > 0
          ? (
            <Menu>
              <Menu.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  color="neutral"
                  iconOnly
                  aria-label={grid.t.rowActions}
                  leftIcon={<MoreVertical aria-hidden className="size-4" />}
                />
              </Menu.Trigger>
              <Menu.Content>
                {actions.map((action) => (
                  <Menu.Item
                    key={action.id}
                    {...(action.disabled !== undefined ? { disabled: action.disabled } : {})}
                    color={action.color === 'danger' ? 'danger' : 'neutral'}
                    leftIcon={action.icon}
                    onSelect={action.onSelect}
                  >
                    {action.label}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu>
          )
          : null}
    </td>
  );
}

export const DataGridActionsBodyCell = forwardRef(
  DataGridActionsBodyCellImpl as (
    props: DataGridActionsBodyCellProps<unknown>,
    ref: ForwardedRef<HTMLTableCellElement>,
  ) => ReactElement,
  'DataGrid.ActionsBodyCell',
) as <T = unknown>(
  props: DataGridActionsBodyCellProps<T> & { ref?: Ref<HTMLTableCellElement> },
) => ReactElement;