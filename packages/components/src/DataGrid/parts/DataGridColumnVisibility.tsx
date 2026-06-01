'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { Columns3 } from 'lucide-react';
import {
  useMemo,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

import { Button } from '../../Button/Button';
import { Checkbox } from '../../Checkbox/Checkbox';
import { Popover } from '../../Popover';
import { useDataGridContext } from '../DataGridContext';
import { isStructuralColumn } from '../structuralColumns';
import type { ColumnDef } from '../DataGrid.types';

export interface DataGridColumnVisibilityProps
  extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx;
}

/**
 * `<DataGrid.ColumnVisibility>` — toolbar button that opens a `<Popover>` containing
 * a `<Checkbox>` list of toggleable columns.
 *
 * Structural columns (`rowSelect`, `actions`, `expand`) and columns marked
 * `hideable: false` are excluded from the toggle list — they're owned by the grid,
 * not the user. The list reads from the column definitions (not from the rendered
 * `visibleColumns`) so a hidden column still appears as a row the user can toggle
 * back on.
 */
function DataGridColumnVisibilityImpl(
  props: DataGridColumnVisibilityProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { className, sx: _sx, style, ...rest } = props;
  const ctx = useDataGridContext();
  const { grid } = ctx;
  const t = grid.t;

  // List every declared column (including currently-hidden ones) so the user can
  // toggle them back on. Structural columns + columns marked `hideable: false` are
  // owned by the grid and never appear in the toggle list.
  const toggleable = useMemo<ColumnDef<unknown>[]>(
    () =>
      (grid.columns as ReadonlyArray<ColumnDef<unknown>>).filter(
        (col) => !isStructuralColumn(col) && col.hideable !== false,
      ),
    [grid.columns],
  );

  return (
    <div ref={ref} className={className} style={style} data-datagrid-column-visibility="" {...rest}>
      <Popover>
        <Popover.Trigger>
          <Button
            variant="ghost"
            size="sm"
            color="neutral"
            leftIcon={<Columns3 aria-hidden className="size-4" />}
          >
            {t.columnsManage}
          </Button>
        </Popover.Trigger>
        <Popover.Content placement="bottom-end">
          <div className="flex w-56 flex-col gap-1 p-1">
            <div className="text-fg-muted px-2 py-1 text-xs font-semibold uppercase tracking-wider">
              {t.columnsManage}
            </div>
            {toggleable.map((col) => {
              const visible = grid.state.columnVisibility[col.id] !== false;
              const label =
                typeof col.header === 'string' ? col.header : col.id;
              return (
                <Checkbox
                  key={col.id}
                  checked={visible}
                  onCheckedChange={(next) =>
                    grid.setColumnVisibility({
                      ...grid.state.columnVisibility,
                      [col.id]: next,
                    })
                  }
                  aria-label={label}
                >
                  {label}
                </Checkbox>
              );
            })}
            <div className="border-border mt-1 border-t pt-1">
              <Button
                variant="ghost"
                size="sm"
                color="neutral"
                fullWidth
                onClick={() => grid.setColumnVisibility({})}
              >
                {t.columnsReset}
              </Button>
            </div>
          </div>
        </Popover.Content>
      </Popover>
    </div>
  );
}

export const DataGridColumnVisibility = forwardRef(
  DataGridColumnVisibilityImpl,
  'DataGrid.ColumnVisibility',
) as (
  props: DataGridColumnVisibilityProps & { ref?: Ref<HTMLDivElement> },
) => ReactElement;