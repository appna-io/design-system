import type { ColumnId, RowId } from '../../DataGrid.types';

export type EditingCell = { rowId: RowId; columnId: ColumnId } | null;

export type EditingAction =
  | { type: 'start'; rowId: RowId; columnId: ColumnId }
  | { type: 'cancel' };

export const initialEditingState: EditingCell = null;

/**
 * Cell-editing reducer. Holds at most one cell at a time. Commit is a side-effect
 * (calls the column's `onCellEdit` and then returns to no-editing); cancel just clears.
 */
export function editingReducer(_state: EditingCell, action: EditingAction): EditingCell {
  switch (action.type) {
    case 'start':
      return { rowId: action.rowId, columnId: action.columnId };
    case 'cancel':
      return null;
  }
}
