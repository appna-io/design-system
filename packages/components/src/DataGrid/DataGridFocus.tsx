'use client';

import { useDirection } from '@apx-ui/engine';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import {
  clampCoord,
  coordEquals,
  nextFocusCoord,
  type CellCoord,
} from './DataGrid.keyboard';

interface FocusContextValue {
  focused: CellCoord;
  isFocused: (row: number, col: number) => boolean;
  setFocused: (coord: CellCoord) => void;
  /** Register a DOM node for a coord so the controller can call `.focus()` on it. */
  registerCell: (row: number, col: number, el: HTMLElement | null) => void;
}

const DataGridFocusContext = createContext<FocusContextValue | null>(null);
DataGridFocusContext.displayName = 'DataGridFocusContext';

interface DataGridFocusProviderProps {
  rowCount: number;
  columnCount: number;
  pageSize: number;
  tableRef: RefObject<HTMLTableElement | null>;
  children: ReactNode;
}

/**
 * Roving-focus controller for the grid.
 *
 * Tracks a single `(row, col)` "tabstop" — at any moment, exactly one cell has
 * `tabIndex=0` and every other cell has `tabIndex=-1`. Keyboard navigation moves the
 * tabstop without leaving the grid; Tab / Shift+Tab take the user out of the grid
 * entirely (the ARIA Grid pattern). After every coord change, the controller calls
 * `.focus()` on the matching cell node — registered via `registerCell` in each cell's
 * mount effect.
 *
 * After the row set changes (sort, filter, page), `clampCoord` reins the coord back
 * into the new bounds so a stale focus never points off the end.
 */
export function DataGridFocusProvider({
  rowCount,
  columnCount,
  pageSize,
  tableRef,
  children,
}: DataGridFocusProviderProps) {
  const direction = useDirection();
  const [focused, setFocusedState] = useState<CellCoord>({ row: -1, col: 0 });
  const cellNodesRef = useRef<Map<string, HTMLElement>>(new Map());
  const focusedRef = useRef(focused);
  focusedRef.current = focused;

  // Clamp focus when the underlying data set shrinks.
  useEffect(() => {
    const clamped = clampCoord(focusedRef.current, {
      rowCount,
      columnCount,
      pageSize,
      direction,
    });
    if (!coordEquals(clamped, focusedRef.current)) {
      setFocusedState(clamped);
    }
  }, [rowCount, columnCount, pageSize, direction]);

  const registerCell = useCallback((row: number, col: number, el: HTMLElement | null) => {
    const key = `${row}:${col}`;
    if (el) cellNodesRef.current.set(key, el);
    else cellNodesRef.current.delete(key);
  }, []);

  const setFocused = useCallback((coord: CellCoord) => {
    setFocusedState(coord);
    // Defer the focus() call so React has time to render the new tabIndex first;
    // otherwise the previously-focused cell (still tabIndex=0) absorbs the call.
    requestAnimationFrame(() => {
      const el = cellNodesRef.current.get(`${coord.row}:${coord.col}`);
      el?.focus();
    });
  }, []);

  const isFocused = useCallback(
    (row: number, col: number) => focused.row === row && focused.col === col,
    [focused],
  );

  const value = useMemo<FocusContextValue>(
    () => ({ focused, isFocused, setFocused, registerCell }),
    [focused, isFocused, setFocused, registerCell],
  );

  // Table-level keydown listener — bubbles up from any cell. We intercept the navigation
  // keys, prevent default + propagation, and dispatch the new coord. Other keys are left
  // alone (Enter/F2 for editing, Space for selection — those land in PR 4/5).
  useEffect(() => {
    const node = tableRef.current;
    if (!node) return;
    const handler = (event: globalThis.KeyboardEvent) => {
      const next = nextFocusCoord(
        focusedRef.current,
        {
          key: event.key,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
        },
        { rowCount, columnCount, pageSize, direction },
      );
      if (next === null) return;
      event.preventDefault();
      if (!coordEquals(next, focusedRef.current)) {
        setFocused(next);
      }
    };
    node.addEventListener('keydown', handler);
    return () => node.removeEventListener('keydown', handler);
  }, [tableRef, rowCount, columnCount, pageSize, direction, setFocused]);

  return (
    <DataGridFocusContext.Provider value={value}>{children}</DataGridFocusContext.Provider>
  );
}

/**
 * Consume the focus controller. Returns sentinel values when used outside a provider
 * (e.g. by a body cell that isn't part of a `<DataGrid.Table>`) so the consumer can
 * still render without focus chrome.
 */
export function useDataGridFocus(): FocusContextValue {
  const ctx = useContext(DataGridFocusContext);
  if (!ctx) {
    return {
      focused: { row: -1, col: 0 },
      isFocused: () => false,
      setFocused: () => {},
      registerCell: () => {},
    };
  }
  return ctx;
}

/**
 * Synthetic helper for cells to record their (rowIndex, colIndex) on mount. Returns
 * a callback ref the cell sets on its `<th>` / `<td>` element.
 *
 * @example
 *   const cellRef = useCellRef(rowIndex, colIndex);
 *   return <td ref={cellRef} … />;
 */
export function useCellRef(
  row: number,
  col: number,
): (el: HTMLElement | null) => void {
  const { registerCell } = useDataGridFocus();
  return useCallback(
    (el) => {
      registerCell(row, col, el);
    },
    [row, col, registerCell],
  );
}

/** Re-export the keyboard-event handler type for parts that handle their own keys. */
export type DataGridKeyboardEvent = KeyboardEvent<HTMLElement>;
