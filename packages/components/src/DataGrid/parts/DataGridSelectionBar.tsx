'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { X } from 'lucide-react';
import {
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

import { Button } from '../../Button/Button';
import { dataGridSelectionBarRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';

export interface DataGridSelectionBarProps
  extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx;
}

/**
 * `<DataGrid.SelectionBar>` — sticky-bottom action bar that mounts only when ≥ 1
 * row is selected.
 *
 * Default contents: `selectionSummary` label + `selectionClear` button. Consumers
 * append their own actions as children:
 *
 *   <DataGrid.SelectionBar>
 *     <Button color="danger" onClick={bulkDelete}>Delete</Button>
 *     <Button onClick={exportSelected}>Export</Button>
 *   </DataGrid.SelectionBar>
 *
 * Returns `null` when the selection is empty so consumers can render it
 * unconditionally without conditional layout shifts.
 */
function DataGridSelectionBarImpl(
  props: DataGridSelectionBarProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement | null {
  const { className, sx, style, children, ...rest } = props;
  const ctx = useDataGridContext();
  const { grid } = ctx;
  const t = grid.t;
  const selection = grid.state.selection;
  const ids = selection.ids;
  const count =
    ids instanceof Set ? ids.size : ids === null || ids === undefined ? 0 : 1;
  const total = grid.totalRowCount;

  const { className: barClass, style: barStyle } = useThemedClasses({
    recipe: dataGridSelectionBarRecipe,
    componentName: 'DataGrid',
    slot: 'selectionBar',
    props: { className, sx, style },
  });

  if (count === 0) return null;

  return (
    <div
      ref={ref}
      className={barClass}
      style={barStyle ?? undefined}
      data-datagrid-selection-bar=""
      role="region"
      aria-label={t.selectionSummary(count, total)}
      {...rest}
    >
      <span className="text-fg-default text-sm font-medium">
        {t.selectionSummary(count, total)}
      </span>
      <Button
        variant="ghost"
        size="sm"
        color="neutral"
        leftIcon={<X aria-hidden className="size-4" />}
        onClick={() => grid.setSelection(selection.mode === 'multiple' ? new Set() : null)}
      >
        {t.selectionClear}
      </Button>
      {children ? (
        <div className="ms-auto flex items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}

export const DataGridSelectionBar = forwardRef(
  DataGridSelectionBarImpl as (
    props: DataGridSelectionBarProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => ReactElement,
  'DataGrid.SelectionBar',
) as (
  props: DataGridSelectionBarProps & { ref?: Ref<HTMLDivElement> },
) => ReactElement;