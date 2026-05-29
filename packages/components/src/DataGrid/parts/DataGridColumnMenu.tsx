'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { MoreVertical } from 'lucide-react';
import {
  useMemo,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type ReactElement,
  type Ref,
} from 'react';

import { Button } from '../../Button/Button';
import { Menu } from '../../Menu';
import { useDataGridContext } from '../DataGridContext';
import type { ColumnDef, ColumnId } from '../DataGrid.types';

export interface DataGridColumnMenuProps<T = unknown>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'color'> {
  column: ColumnDef<T>;
  sx?: Sx;
}

/**
 * Kebab Menu rendered inside every reorderable / pinnable / resizable header cell.
 *
 * V1 surface (per plan):
 * - Move left / right (updates `state.columnOrder`)
 * - Pin left / right / Unpin (updates `state.columnPinning`)
 * - Auto-size (clears `state.columnSizes` for this column)
 * - Hide column (sets `state.columnVisibility[id] = false`) — gated by `column.hideable`
 *
 * Items are inserted conditionally so a `pinned: 'end'` column doesn't show "Pin right",
 * a column at index 0 doesn't show "Move left", etc. This keeps the menu compact and
 * avoids the "everything is disabled" look common in spreadsheet UI.
 */
function DataGridColumnMenuImpl<T>(
  props: DataGridColumnMenuProps<T>,
  ref: ForwardedRef<HTMLButtonElement>,
): ReactElement | null {
  const { column, className, ...rest } = props;
  const ctx = useDataGridContext<T>();
  const { grid } = ctx;
  const t = grid.t;

  const pinning = grid.state.columnPinning;
  const isPinnedStart = pinning.start.includes(column.id);
  const isPinnedEnd = pinning.end.includes(column.id);

  const visibleIds = useMemo<ColumnId[]>(
    () => grid.visibleColumns.map((c) => c.id),
    [grid.visibleColumns],
  );
  const idx = visibleIds.indexOf(column.id);
  const canMoveLeft = idx > 0;
  const canMoveRight = idx >= 0 && idx < visibleIds.length - 1;

  const hasSizeOverride = grid.state.columnSizes[column.id] !== undefined;
  const canHide = column.hideable !== false;
  const canResize = column.resizable === true;

  // If literally nothing is actionable for this column the menu would be empty —
  // returning null keeps the header DOM clean instead of dropping a dead trigger.
  if (!canMoveLeft && !canMoveRight && !isPinnedStart && !isPinnedEnd && !canHide && !canResize) {
    return null;
  }

  const headerLabel =
    typeof column.header === 'string' ? column.header : (column.id as string);

  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button
          ref={ref}
          variant="ghost"
          size="sm"
          aria-label={`Column options: ${headerLabel}`}
          data-datagrid-column-menu=""
          data-column-id={column.id}
          // Don't let header sort fire when clicking the kebab.
          onClick={(e) => e.stopPropagation()}
          className={className}
          {...rest}
        >
          <MoreVertical aria-hidden="true" className="size-4" />
        </Button>
      </Menu.Trigger>
      <Menu.Content>
        {canMoveLeft ? (
          <Menu.Item onSelect={() => grid.moveColumn(column.id, 'left')}>
            {t.columnsMoveLeft}
          </Menu.Item>
        ) : null}
        {canMoveRight ? (
          <Menu.Item onSelect={() => grid.moveColumn(column.id, 'right')}>
            {t.columnsMoveRight}
          </Menu.Item>
        ) : null}
        {!isPinnedStart ? (
          <Menu.Item onSelect={() => grid.pinColumn(column.id, 'start')}>
            {t.columnsPinStart}
          </Menu.Item>
        ) : null}
        {!isPinnedEnd ? (
          <Menu.Item onSelect={() => grid.pinColumn(column.id, 'end')}>
            {t.columnsPinEnd}
          </Menu.Item>
        ) : null}
        {isPinnedStart || isPinnedEnd ? (
          <Menu.Item onSelect={() => grid.pinColumn(column.id, null)}>
            {t.columnsUnpin}
          </Menu.Item>
        ) : null}
        {canResize && hasSizeOverride ? (
          <Menu.Item onSelect={() => grid.resetColumnSize(column.id)}>
            {t.columnsAutoSize}
          </Menu.Item>
        ) : null}
        {canHide ? (
          <Menu.Item
            onSelect={() =>
              grid.setColumnVisibility({
                ...grid.state.columnVisibility,
                [column.id]: false,
              })
            }
          >
            {t.columnsHide}
          </Menu.Item>
        ) : null}
      </Menu.Content>
    </Menu>
  );
}

export const DataGridColumnMenu = forwardRef(
  DataGridColumnMenuImpl as (
    props: DataGridColumnMenuProps<unknown>,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => ReactElement | null,
  'DataGrid.ColumnMenu',
) as <T = unknown>(
  props: DataGridColumnMenuProps<T> & { ref?: Ref<HTMLButtonElement> },
) => ReactElement | null;
