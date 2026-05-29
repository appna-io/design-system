'use client';

import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';

import {
  calendarDayRecipe,
  calendarWeekNumberCellRecipe,
  calendarWeekdayRecipe,
  calendarWeekdaysRowRecipe,
  calendarWeeksGridRecipe,
} from '../Calendar.recipe';
import type { CalendarDay, CalendarProps } from '../Calendar.types';
import { useCalendarContext } from '../CalendarContext';
import { useCalendarKeyboard } from '../headless/useCalendarKeyboard';
import { isSameDay, isoWeekNumber } from '../helpers/dateMath';
import { getLongDayLabel } from '../helpers/locale';
import { useSlotClass } from '../helpers/useSlotClass';

export interface CalendarMonthGridProps {
  /** Anchor date for this month (1st of month). */
  monthAnchor: Date;
  /** 0 = leading month, 1 = trailing month, … — used for unique cell `data-month-index`. */
  monthIndex: number;
  renderDay?: CalendarProps['renderDay'];
  renderWeekday?: CalendarProps['renderWeekday'];
  onDayHover?: CalendarProps['onDayHover'];
  onDayLeave?: CalendarProps['onDayLeave'];
}

/**
 * A single month's grid — header row + week rows. Responsible for:
 *
 *  - The W3C `grid` ARIA scaffolding (`role="grid"` + `gridcell` per day).
 *  - Roving tabindex (only the focused day has `tabIndex=0`).
 *  - Hover-preview wiring (range mode).
 *  - Keyboard nav (delegated to `useCalendarKeyboard`).
 *
 * Layout is `display: grid` with 7 columns (or 8 when `showWeekNumbers`).
 */
export function CalendarMonthGrid(props: CalendarMonthGridProps) {
  const ctx = useCalendarContext();
  const { monthGrids, weekdays, showWeekNumbers, size, focusedDay, rootId, t } = ctx;

  const grid = monthGrids[props.monthIndex] ?? [];

  const weekdaysRowClass = useSlotClass(
    'calendar.weekdaysRow',
    calendarWeekdaysRowRecipe,
    { showWeekNumbers },
  );
  const weekdayClass = useSlotClass('calendar.weekday', calendarWeekdayRecipe, { size });
  const weeksGridClass = useSlotClass('calendar.weeksGrid', calendarWeeksGridRecipe, {
    showWeekNumbers,
  });

  const handleKeyDown = useCalendarKeyboard();

  /* Ensure that when the focused day lives in *this* month we re-focus its button after each
   * render (keyboard nav across months moves focus too). */
  const gridRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!gridRef.current) return;
    const focusedInThisMonth = grid.some((week) =>
      week.some((cell) => isSameDay(cell.date, focusedDay)),
    );
    if (!focusedInThisMonth) return;
    // Only steal focus if the user is already navigating *inside* the calendar — don't yank
    // focus from elsewhere on the page when `value` changes from a programmatic update.
    const active = document.activeElement;
    if (active && gridRef.current.contains(active)) {
      const btn = gridRef.current.querySelector<HTMLButtonElement>(
        `[data-day-iso="${focusedDay.toISOString().slice(0, 10)}"]`,
      );
      btn?.focus({ preventScroll: true });
    }
  }, [focusedDay, grid]);

  const titleId = `${rootId}-title`;

  return (
    <>
      <div className={weekdaysRowClass} role="row">
        {showWeekNumbers ? (
          <div
            className={weekdayClass}
            role="columnheader"
            aria-label={t.weekNumberHeader}
          >
            {t.weekNumberHeader}
          </div>
        ) : null}
        {weekdays.map((wd) =>
          props.renderWeekday ? (
            <div key={`wd-${wd.weekday}`} role="columnheader">
              {props.renderWeekday(wd)}
            </div>
          ) : (
            <div
              key={`wd-${wd.weekday}`}
              className={weekdayClass}
              role="columnheader"
              title={wd.long}
              aria-label={wd.long}
            >
              {wd.short}
            </div>
          ),
        )}
      </div>

      <div
        ref={gridRef}
        className={weeksGridClass}
        role="grid"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
      >
        {grid.map((week, weekIdx) => {
          const firstDayOfWeek = week.find((c) => !c.isOutside)?.date ?? week[0]!.date;
          const wkNum = isoWeekNumber(firstDayOfWeek);
          return (
            <RowRenderer
              key={`wk-${weekIdx}`}
              showWeekNumbers={showWeekNumbers}
              weekNumber={wkNum}
            >
              {week.map((day) => (
                <DayCell
                  key={day.date.toISOString()}
                  day={day}
                  renderDay={props.renderDay}
                  onDayHover={props.onDayHover}
                  onDayLeave={props.onDayLeave}
                />
              ))}
            </RowRenderer>
          );
        })}
      </div>
    </>
  );
}

function RowRenderer({
  showWeekNumbers,
  weekNumber,
  children,
}: {
  showWeekNumbers: boolean;
  weekNumber: number;
  children: ReactNode;
}) {
  const wkCellClass = useSlotClass(
    'calendar.weekNumberCell',
    calendarWeekNumberCellRecipe,
    {},
  );
  return (
    <div role="row" className="contents">
      {showWeekNumbers ? <span className={wkCellClass}>{weekNumber}</span> : null}
      {children}
    </div>
  );
}

interface DayCellProps {
  day: CalendarDay;
  renderDay?: CalendarProps['renderDay'];
  onDayHover?: CalendarProps['onDayHover'];
  onDayLeave?: CalendarProps['onDayLeave'];
}

function DayCell({ day, renderDay, onDayHover, onDayLeave }: DayCellProps) {
  const ctx = useCalendarContext();
  const { size, focusedDay, selectDay, setHoverPreview, setFocusedDay, locale, t } = ctx;

  const isFocused = isSameDay(day.date, focusedDay);
  const label = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(day.date),
    [day.date, locale],
  );
  const ariaLabel = useMemo(() => {
    const long = getLongDayLabel(day.date, locale);
    if (day.isSelected) return `${long}, ${t.selectedDayAnnouncement('').trim() || 'selected'}`;
    return long;
  }, [day.date, locale, day.isSelected, t]);

  const className = useSlotClass('calendar.day', calendarDayRecipe, {
    size,
    isOutside: day.isOutside,
    isSelected: day.isSelected && !day.isInRange,
    isToday: day.isToday,
    isRangeStart: day.isRangeStart,
    isRangeEnd: day.isRangeEnd,
    isRangeMiddle: day.isInRange && !day.isRangeStart && !day.isRangeEnd,
    isRangePreview: day.isInPreview && !day.isSelected,
    isDisabled: day.isDisabled,
  });

  const handleClick = useCallback(() => {
    if (day.isDisabled) return;
    selectDay(day.date);
  }, [day.isDisabled, day.date, selectDay]);

  const handlePointerEnter = useCallback(() => {
    setHoverPreview(day.date);
    onDayHover?.(day.date);
  }, [day.date, setHoverPreview, onDayHover]);

  const handlePointerLeave = useCallback(() => {
    setHoverPreview(null);
    onDayLeave?.();
  }, [setHoverPreview, onDayLeave]);

  const handleFocus = useCallback(() => {
    setFocusedDay(day.date);
  }, [day.date, setFocusedDay]);

  const isoDate = day.date.toISOString().slice(0, 10);

  if (renderDay) {
    return (
      <div role="gridcell" aria-selected={day.isSelected}>
        {renderDay({ ...day, label, ariaLabel })}
      </div>
    );
  }

  return (
    <button
      type="button"
      role="gridcell"
      aria-selected={day.isSelected}
      aria-disabled={day.isDisabled || undefined}
      aria-current={day.isToday ? 'date' : undefined}
      aria-label={ariaLabel}
      data-day-iso={isoDate}
      data-outside={day.isOutside || undefined}
      data-today={day.isToday || undefined}
      data-selected={day.isSelected || undefined}
      tabIndex={isFocused ? 0 : -1}
      className={className}
      disabled={day.isDisabled}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
    >
      {label}
    </button>
  );
}
