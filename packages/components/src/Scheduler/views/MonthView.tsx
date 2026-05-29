'use client';

import { useSlotClass } from '../helpers/useSlotClass';
import { useMemo } from 'react';

import {
  schedulerMonthCellRecipe,
  schedulerMonthDayNumberRecipe,
  schedulerMonthGridRecipe,
  schedulerMonthHeaderCellRecipe,
  schedulerMonthHeaderRecipe,
} from '../Scheduler.recipe';
import type { SchedulerEvent } from '../Scheduler.types';
import { useSchedulerContext } from '../SchedulerContext';
import { SchedulerHolidayBanner } from '../parts/SchedulerHolidayBanner';
import {
  addDays,
  computeMonthGrid,
  isSameDay,
  isSameMonth,
  startOfWeek,
  toDayKey,
} from '../helpers/dateMath';
import { formatDayNumber, formatWeekday } from '../helpers/formatTime';
import { isNamedColor, resolveEventColor } from '../helpers/eventColor';
import type { NewEventDraft } from '../Scheduler.types';

/** Build a `NewEventDraft` from a `SchedulerEvent` without leaking `undefined`-typed fields. */
function toDraft(event: SchedulerEvent): NewEventDraft {
  const draft: NewEventDraft = { start: event.start, end: event.end };
  if (event.title !== undefined) draft.title = event.title;
  if (event.description !== undefined) draft.description = event.description;
  if (event.location !== undefined) draft.location = event.location;
  if (event.allDay !== undefined) draft.allDay = event.allDay;
  if (event.calendarId !== undefined) draft.calendarId = event.calendarId;
  if (event.resourceId !== undefined) draft.resourceId = event.resourceId;
  return draft;
}

/**
 * Google-Calendar-style month grid: 6 rows × 7 cols, padded with leading/trailing days.
 * Today's cell highlights via the `dayNumber` recipe; holidays render as a banner badge
 * inside the cell.
 *
 * Click semantics:
 *  - Click a cell → open quick-create popover anchored at the cell.
 *  - Click an event chip → open quick-popover in `view` mode.
 *  - Drag-create is intentionally skipped here — month view's resolution is "day",
 *    not "minute", so a click is the right primary affordance.
 */
export function MonthView() {
  const ctx = useSchedulerContext();
  const { state, t, locale, weekStartsOn } = ctx;

  const cells = useMemo(
    () => computeMonthGrid(state.date, weekStartsOn),
    [state.date, weekStartsOn],
  );

  const headerCells = useMemo(() => {
    const start = startOfWeek(state.date, weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [state.date, weekStartsOn]);

  const gridClasses = useSlotClass(
    'scheduler.month.grid',
    schedulerMonthGridRecipe,
    {},
  );
  const headerClasses = useSlotClass(
    'scheduler.month.header',
    schedulerMonthHeaderRecipe,
    {},
  );
  const headerCellClasses = useSlotClass(
    'scheduler.month.headerCell',
    schedulerMonthHeaderCellRecipe,
    {},
  );

  return (
    <div className="flex h-full w-full flex-col" role="grid" aria-label={t.calendarApplication}>
      <div className={headerClasses} role="row">
        {headerCells.map((d, i) => (
          <div
            key={i}
            className={headerCellClasses}
            role="columnheader"
            aria-label={formatWeekday(d, locale, 'long')}
          >
            {formatWeekday(d, locale, 'short')}
          </div>
        ))}
      </div>
      <div className={gridClasses}>
        {cells.map((day) => (
          <MonthCell key={day.getTime()} day={day} anchor={state.date} />
        ))}
      </div>
    </div>
  );
}

MonthView.displayName = 'Scheduler.MonthView';

function MonthCell({ day, anchor }: { day: Date; anchor: Date }) {
  const ctx = useSchedulerContext();
  const { state, locale, t } = ctx;
  const today = useMemo(() => new Date(), []);

  const dayKey = toDayKey(day);
  const inMonth = isSameMonth(day, anchor);
  const isToday = isSameDay(day, today);
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const holidays = ctx.visibleHolidays.get(dayKey) ?? [];
  const isHoliday = holidays.length > 0;
  const isSelected = state.selection.slotRange
    ? isSameDay(state.selection.slotRange.start, day)
    : false;

  const cellClasses = useSlotClass(
    'scheduler.month.cell',
    schedulerMonthCellRecipe,
    {
      inMonth,
      isToday,
      isWeekend,
      isHoliday,
      isSelected,
      interactive: !ctx.readOnly,
    },
  );
  const dayNumberClasses = useSlotClass(
    'scheduler.month.dayNumber',
    schedulerMonthDayNumberRecipe,
    { isToday },
  );

  const dayEvents = (ctx.eventsByDay.get(dayKey) ?? []) as readonly SchedulerEvent[];

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (ctx.readOnly) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const start = new Date(day);
    start.setHours(9, 0, 0, 0);
    const end = new Date(day);
    end.setHours(10, 0, 0, 0);
    ctx.selectSlot({ start, end });
    ctx.openQuickPopover({ start, end }, rect, 'create');
  };

  const handleEventClick = (event: SchedulerEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    ctx.selectEvent(event.id);
    ctx.openQuickPopover(toDraft(event), rect, 'view', event.id);
  };

  return (
    <div
      className={cellClasses}
      role="gridcell"
      tabIndex={ctx.readOnly ? -1 : 0}
      aria-label={t.slotLabel(formatDayNumber(day, locale), '')}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (ctx.readOnly) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className={dayNumberClasses}>{formatDayNumber(day, locale)}</span>
        {isHoliday && <SchedulerHolidayBanner holidays={holidays} variant="badge" />}
      </div>
      <div className="flex flex-col gap-0.5 overflow-hidden">
        {dayEvents.slice(0, 3).map((event) => (
          <MonthEventChip key={event.id} event={event} onClick={(e) => handleEventClick(event, e)} />
        ))}
        {dayEvents.length > 3 && (
          <span className="text-[10px] font-medium text-fg-muted">
            +{dayEvents.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}

function MonthEventChip({
  event,
  onClick,
}: {
  event: SchedulerEvent;
  onClick: (e: React.MouseEvent) => void;
}) {
  const ctx = useSchedulerContext();
  const color = resolveEventColor(event, ctx.calendarById, ctx.color);
  const namedColor = typeof color === 'string' && isNamedColor(color) ? color : ctx.color;
  const customStyle =
    typeof color === 'string' && !isNamedColor(color)
      ? { backgroundColor: color, color: '#fff' }
      : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'truncate rounded-sm px-1.5 py-0.5 text-start text-[11px] font-medium leading-tight',
        'hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        `bg-${namedColor}-subtle text-${namedColor}`,
      ].join(' ')}
      style={customStyle}
      title={event.title}
    >
      {event.allDay
        ? event.title || ctx.t.untitledEvent
        : `${event.start.getHours().toString().padStart(2, '0')}:${event.start
            .getMinutes()
            .toString()
            .padStart(2, '0')} ${event.title || ctx.t.untitledEvent}`}
    </button>
  );
}
