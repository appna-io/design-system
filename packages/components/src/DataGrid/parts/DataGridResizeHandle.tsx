'use client';

import { forwardRef, useDirection, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type Ref,
} from 'react';

import { dataGridResizeHandleRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import type { ColumnDef } from '../DataGrid.types';

export interface DataGridResizeHandleProps<T = unknown>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  column: ColumnDef<T>;
  /**
   * Element whose width to read when the drag starts. Defaults to the header cell that
   * hosts the handle (resolved via `closest('[data-datagrid-header-cell]')`).
   */
  initialWidthFrom?: HTMLElement | null;
  sx?: Sx;
}

const KEYBOARD_STEP = 8;
const KEYBOARD_BIG_STEP = 32;

/**
 * Pointer-drag affordance rendered at the trailing edge of every resizable header cell.
 *
 * The drag stream uses pointer-capture on the handle itself so the browser keeps
 * routing `pointermove` / `pointerup` to us even when the cursor leaves the handle
 * bounds (the actual drag distance often exceeds the 6px hit area). The new width is
 * computed from the starting width + cursor delta and clamped against
 * `column.minWidth` / `column.maxWidth`.
 *
 * Double-click auto-sizes the column to its widest visible cell — V1 measures the
 * widest rendered cell inside the same column via `data-column-id` and `scrollWidth`.
 *
 * Keyboard: ArrowLeft / ArrowRight nudges by 8px (32px with shift). Backspace /
 * Delete clears the override and falls back to `column.width`.
 *
 * RTL: pointer delta is inverted in RTL so dragging the visually-trailing edge
 * outward always *grows* the column regardless of layout direction.
 */
function DataGridResizeHandleImpl<T>(
  props: DataGridResizeHandleProps<T>,
  ref: ForwardedRef<HTMLButtonElement>,
): ReactElement {
  const { column, initialWidthFrom, className, sx, style, onPointerDown, ...rest } = props;
  const ctx = useDataGridContext<T>();
  const { grid } = ctx;
  const direction = useDirection();
  const isRtl = direction === 'rtl';

  const [active, setActive] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  const { className: handleClass, style: handleStyle } = useThemedClasses({
    recipe: dataGridResizeHandleRecipe,
    componentName: 'DataGrid',
    slot: 'resizeHandle',
    props: { active, className, sx, style },
  });

  const minWidth = column.minWidth ?? 24;
  const maxWidth = column.maxWidth ?? Number.POSITIVE_INFINITY;

  const cleanup = useCallback(
    (target: HTMLButtonElement | null, pointerId: number | undefined) => {
      if (target && pointerId !== undefined) {
        try {
          target.releasePointerCapture(pointerId);
        } catch {
          // pointerId may already be released by the browser — safe to ignore.
        }
      }
      dragRef.current = null;
      setActive(false);
    },
    [],
  );

  const resolveStartingWidth = useCallback(
    (target: HTMLElement): number => {
      const explicitTarget = initialWidthFrom ?? target.closest<HTMLElement>('[data-datagrid-header-cell]');
      const measured = explicitTarget?.getBoundingClientRect().width ?? 0;
      const fromState = grid.state.columnSizes[column.id];
      return (fromState ?? Math.round(measured)) || column.width || minWidth;
    },
    [grid.state.columnSizes, column.id, column.width, initialWidthFrom, minWidth],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented) return;
      // Primary button only — secondary / middle / pen-eraser must not start a drag.
      if (event.button !== 0) return;
      event.preventDefault();
      // Don't bubble to header sort click handler.
      event.stopPropagation();
      const target = event.currentTarget;
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // jsdom + some embedded browsers don't implement pointer capture; the
        // global pointermove listener below still works as a fallback.
      }
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startWidth: resolveStartingWidth(target),
      };
      setActive(true);
    },
    [onPointerDown, resolveStartingWidth],
  );

  useEffect(() => {
    if (!active) return;
    const onMove = (event: PointerEvent): void => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const deltaRaw = event.clientX - drag.startX;
      const delta = isRtl ? -deltaRaw : deltaRaw;
      const next = Math.max(minWidth, Math.min(maxWidth, drag.startWidth + delta));
      grid.setColumnSize(column.id, Math.round(next));
    };
    const onEnd = (event: PointerEvent): void => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const target = document.activeElement as HTMLButtonElement | null;
      cleanup(target, drag.pointerId);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
  }, [active, cleanup, column.id, grid, isRtl, maxWidth, minWidth]);

  const handleDoubleClick = useCallback(() => {
    // Auto-size: find the widest rendered cell in this column and use that.
    if (typeof document === 'undefined') return;
    const root = (document.querySelector(`[data-datagrid] [data-column-id="${column.id}"]`)?.closest('[data-datagrid]')) as HTMLElement | null;
    if (!root) return;
    const cells = root.querySelectorAll<HTMLElement>(`[data-datagrid-cell][data-column-id="${column.id}"]`);
    let widest = 0;
    let measuredAny = false;
    cells.forEach((cell) => {
      // scrollWidth ignores cell padding; add the cell's horizontal padding so the
      // measured column fits without truncation. parseFloat may return NaN under jsdom
      // when computed styles are blank — fall back to 0 so the math stays defined.
      if (cell.scrollWidth > 0) measuredAny = true;
      const styles = getComputedStyle(cell);
      const padLeft = parseFloat(styles.paddingLeft) || 0;
      const padRight = parseFloat(styles.paddingRight) || 0;
      widest = Math.max(widest, cell.scrollWidth + padLeft + padRight + 4);
    });
    // Bail when nothing measurable — happens under jsdom / when the column is empty.
    // Without this guard auto-size would clamp to `minWidth`, shrinking the column.
    if (!measuredAny) return;
    grid.setColumnSize(column.id, Math.max(minWidth, Math.min(maxWidth, Math.round(widest))));
  }, [column.id, grid, maxWidth, minWidth]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const current = grid.state.columnSizes[column.id] ?? column.width ?? minWidth;
      const step = event.shiftKey ? KEYBOARD_BIG_STEP : KEYBOARD_STEP;
      let next: number | null = null;
      if (event.key === 'ArrowLeft') next = current - (isRtl ? -step : step);
      else if (event.key === 'ArrowRight') next = current + (isRtl ? -step : step);
      else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        event.stopPropagation();
        grid.resetColumnSize(column.id);
        return;
      }
      if (next === null) return;
      event.preventDefault();
      event.stopPropagation();
      grid.setColumnSize(column.id, Math.max(minWidth, Math.min(maxWidth, Math.round(next))));
    },
    [grid, column.id, column.width, isRtl, maxWidth, minWidth],
  );

  return (
    <button
      ref={ref}
      type="button"
      className={handleClass}
      style={handleStyle ?? undefined}
      aria-label={`Resize ${typeof column.header === 'string' ? column.header : column.id}`}
      data-datagrid-resize-handle=""
      data-column-id={column.id}
      data-active={active || undefined}
      data-width={grid.state.columnSizes[column.id]}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      // Don't accept focus on click — the handle is keyboard-reachable via Tab from the
      // header cell, but pointer interaction should leave focus where it was.
      tabIndex={-1}
      {...rest}
    />
  );
}

export const DataGridResizeHandle = forwardRef(
  DataGridResizeHandleImpl as (
    props: DataGridResizeHandleProps<unknown>,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => ReactElement,
  'DataGrid.ResizeHandle',
) as <T = unknown>(
  props: DataGridResizeHandleProps<T> & { ref?: Ref<HTMLButtonElement> },
) => ReactElement;
