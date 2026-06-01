'use client';

import { useThemedClasses } from '@apx-ui/theme';
import {
  useCallback,
  useEffect,
  useRef,
  type ReactElement,
} from 'react';

import { Input } from '../../Input/Input';
import { dataGridCellEditorRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import type { CellEditorContext, ColumnDef, Row } from '../DataGrid.types';

export interface DataGridCellEditorProps<T = unknown> {
  column: ColumnDef<T>;
  row: Row<T>;
  value: unknown;
}

/**
 * Wrapper around the consumer-supplied `column.editor`. Sits inside the active editing
 * cell, replacing the rendered value. Renders a sensible default editor (`<Input>`) when
 * the column doesn't provide one — so simple "string field" columns can flip
 * `editable: true` and immediately be edit-capable.
 *
 * The wrapper traps focus inside the editor: on mount it focuses the first input/select
 * and on commit/cancel it returns focus to the cell so roving-tabindex picks up where
 * the user left off.
 *
 * Keyboard contract (default editor):
 * - `Enter` → commit
 * - `Escape` → cancel
 * - `Tab` → commit (the consumer's `<DataGrid>` arrow-nav controller will move focus)
 *
 * Custom editors receive `onCommit` / `onCancel` and can wire their own shortcuts.
 */
export function DataGridCellEditor<T>(
  props: DataGridCellEditorProps<T>,
): ReactElement {
  const { column, row, value } = props;
  const ctx = useDataGridContext<T>();
  const { grid } = ctx;
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const { className: wrapperClass } = useThemedClasses({
    recipe: dataGridCellEditorRecipe,
    componentName: 'DataGrid',
    slot: 'cellEditor',
    props: {},
  });

  const handleCommit = useCallback(
    (next: unknown) => {
      grid.commitEditing(next);
    },
    [grid],
  );

  const handleCancel = useCallback(() => {
    grid.cancelEditing();
  }, [grid]);

  // Focus the first focusable inside the editor on mount. If the consumer's editor
  // sets `autoFocus` on its own input this is a harmless no-op; if it doesn't, we
  // still get the spreadsheet-style "edit mode = ready to type" UX.
  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;
    const focusable = root.querySelector<HTMLElement>(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, []);

  const editorContext: CellEditorContext<T> = {
    value,
    row: row.original,
    rowId: row.id,
    column,
    onCommit: handleCommit,
    onCancel: handleCancel,
  };

  const editorNode = column.editor
    ? column.editor(editorContext)
    : (
      <Input
        size="sm"
        // eslint-disable-next-line jsx-a11y/no-autofocus -- entering edit mode is an explicit user action; focusing the input is the spreadsheet-correct UX
        autoFocus
        defaultValue={value === null || value === undefined ? '' : String(value)}
        aria-label={
          typeof column.header === 'string' ? `Edit ${column.header}` : 'Edit cell'
        }
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            handleCommit(event.currentTarget.value);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            handleCancel();
          }
        }}
      />
    );

  return (
    // The wrapper itself isn't a widget; the inner editor (input / select / textarea)
    // handles all real interactions. We only intercept arrow keys to keep them from
    // bubbling to the grid's roving-focus controller.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={wrapperRef}
      className={wrapperClass}
      data-datagrid-cell-editor=""
      data-column-id={column.id}
      data-row-id={String(row.id)}
      onKeyDown={(event) => {
        if (event.key.startsWith('Arrow')) event.stopPropagation();
      }}
    >
      {editorNode}
    </div>
  );
}