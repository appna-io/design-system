'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { Filter } from 'lucide-react';
import {
  useState,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type ReactElement,
  type Ref,
} from 'react';

import { Popover } from '../../Popover';
import { dataGridFilterButtonRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import type { ColumnDef } from '../DataGrid.types';

import { DataGridFilterPanel } from './DataGridFilterPanel';

export interface DataGridFilterButtonProps<T = unknown>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  column: ColumnDef<T>;
  sx?: Sx;
}

/**
 * `<DataGrid.FilterButton>` — small icon trigger inside a header cell that opens the
 * per-column filter `<Popover>`.
 *
 * Shows a dot indicator when the column has an active filter (see the
 * `dataGridFilterButtonRecipe` `active` variant). The popover's open state is
 * controlled here so the panel's "Apply" / "Clear" can close it cleanly.
 *
 * Click handling stops propagation so clicking the filter icon doesn't accidentally
 * trigger the header's sort toggle.
 */
function DataGridFilterButtonImpl<T>(
  props: DataGridFilterButtonProps<T>,
  ref: ForwardedRef<HTMLButtonElement>,
): ReactElement {
  const { column, className, sx, style, onClick, ...rest } = props;
  const ctx = useDataGridContext<T>();
  const { grid } = ctx;
  const t = grid.t;
  const [open, setOpen] = useState(false);

  const active = grid.state.filters[column.id] !== undefined;

  const { className: btnClass, style: btnStyle } = useThemedClasses({
    recipe: dataGridFilterButtonRecipe,
    componentName: 'DataGrid',
    slot: 'filterButton',
    props: { active, className, sx, style },
  });

  const headerLabel = typeof column.header === 'string' ? column.header : column.id;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <button
          ref={ref}
          type="button"
          className={btnClass}
          style={btnStyle ?? undefined}
          aria-label={t.filterColumn(headerLabel)}
          aria-pressed={active}
          data-datagrid-filter-button=""
          data-active={active || undefined}
          onClick={(event) => {
            // Don't let the click bubble to the header sort button.
            event.stopPropagation();
            onClick?.(event);
          }}
          {...rest}
        >
          <Filter aria-hidden className="size-3.5" />
        </button>
      </Popover.Trigger>
      <Popover.Content placement="bottom-end">
        <DataGridFilterPanel column={column} onClose={() => setOpen(false)} />
      </Popover.Content>
    </Popover>
  );
}

export const DataGridFilterButton = forwardRef(
  DataGridFilterButtonImpl as (
    props: DataGridFilterButtonProps<unknown>,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => ReactElement,
  'DataGrid.FilterButton',
) as <T = unknown>(
  props: DataGridFilterButtonProps<T> & { ref?: Ref<HTMLButtonElement> },
) => ReactElement;