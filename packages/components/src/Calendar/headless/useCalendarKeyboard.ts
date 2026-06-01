'use client';

import { useCallback, type KeyboardEvent } from 'react';

import { useCalendarContext } from '../CalendarContext';
import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from '../helpers/dateMath';

/**
 * W3C Date Picker Dialog keyboard pattern. Returns a single `onKeyDown` handler that the
 * grid attaches to. The handler is RTL-aware via `dir` (left/right arrows are mirrored when
 * the document is in RTL mode).
 *
 * | Key                       | Action                                  |
 * | ------------------------- | --------------------------------------- |
 * | Arrow Left / Right        | -1 / +1 day (RTL-flipped automatically) |
 * | Arrow Up / Down           | -7 / +7 days                            |
 * | Home / End                | First / last day of current week        |
 * | Ctrl/Cmd + Home/End       | First / last day of current month       |
 * | PageUp / PageDown         | Previous / next month                   |
 * | Shift + PageUp/Down       | Previous / next year                    |
 * | Enter / Space             | Select the focused day                  |
 */
export function useCalendarKeyboard() {
  const ctx = useCalendarContext();
  const {
    focusedDay,
    setFocusedDay,
    selectDay,
    goToPrevMonth,
    goToNextMonth,
    visibleMonths,
    weekStartsOn,
  } = ctx;

  return useCallback(
    (e: KeyboardEvent) => {
      let next: Date | null = null;
      let consumed = false;

      const isRtl =
        typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
      const leftDelta = isRtl ? 1 : -1;
      const rightDelta = isRtl ? -1 : 1;

      switch (e.key) {
        case 'ArrowLeft':
          next = addDays(focusedDay, leftDelta);
          consumed = true;
          break;
        case 'ArrowRight':
          next = addDays(focusedDay, rightDelta);
          consumed = true;
          break;
        case 'ArrowUp':
          next = addDays(focusedDay, -7);
          consumed = true;
          break;
        case 'ArrowDown':
          next = addDays(focusedDay, 7);
          consumed = true;
          break;
        case 'Home':
          next = e.ctrlKey || e.metaKey
            ? startOfMonth(focusedDay)
            : startOfWeek(focusedDay, weekStartsOn);
          consumed = true;
          break;
        case 'End':
          next = e.ctrlKey || e.metaKey
            ? endOfMonth(focusedDay)
            : endOfWeek(focusedDay, weekStartsOn);
          consumed = true;
          break;
        case 'PageUp':
          next = e.shiftKey ? addYears(focusedDay, -1) : addMonths(focusedDay, -1);
          consumed = true;
          break;
        case 'PageDown':
          next = e.shiftKey ? addYears(focusedDay, 1) : addMonths(focusedDay, 1);
          consumed = true;
          break;
        case 'Enter':
        case ' ':
          selectDay(focusedDay);
          consumed = true;
          break;
        default:
          break;
      }

      if (consumed) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!next) return;

      setFocusedDay(next);

      /* Keep the focused day in view: if it left the visible window, scroll the month
       * anchor by ±1 in the appropriate direction. With `numberOfMonths > 1` we need to
       * check the entire visible range. */
      const firstVisible = visibleMonths[0]!;
      const lastVisible = visibleMonths[visibleMonths.length - 1]!;
      if (next.getTime() < startOfMonth(firstVisible).getTime()) {
        goToPrevMonth();
      } else if (next.getTime() > endOfMonth(lastVisible).getTime()) {
        goToNextMonth();
      } else if (!isSameMonth(next, firstVisible) && visibleMonths.length === 1) {
        // Single-month view: shift to the month of `next`.
        if (next.getTime() < firstVisible.getTime()) goToPrevMonth();
        else goToNextMonth();
      }
    },
    [
      focusedDay,
      setFocusedDay,
      selectDay,
      goToPrevMonth,
      goToNextMonth,
      visibleMonths,
      weekStartsOn,
    ],
  );
}