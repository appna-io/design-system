'use client';

import { useSlotClass } from '../helpers/useSlotClass';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  schedulerAllDayBandRecipe,
  schedulerAllDayCellRecipe,
  schedulerAllDayLabelRecipe,
  schedulerDayColumnRecipe,
  schedulerDragPreviewRecipe,
  schedulerHourLineRecipe,
  schedulerTimeGridDayColumnHeaderRecipe,
  schedulerTimeGridDayNumberRecipe,
  schedulerTimeGridHeaderRecipe,
  schedulerTimeGridRecipe,
} from '../Scheduler.recipe';
import type {
  NewEventDraft,
  PositionedEvent,
  SchedulerEvent,
} from '../Scheduler.types';

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
import { useSchedulerContext } from '../SchedulerContext';
import { SchedulerEventCard } from '../parts/SchedulerEventCard';
import { SchedulerNowIndicator } from '../parts/SchedulerNowIndicator';
import { SchedulerTimeAxis } from '../parts/SchedulerTimeAxis';
import {
  addDays,
  eachDayInRange,
  isSameDay,
  isWorkingDay,
  parseHHMM,
  startOfDay,
  toDayKey,
} from '../helpers/dateMath';
import { positionedToStyle } from '../helpers/eventLayout';
import { formatDayNumber, formatTime, formatWeekday } from '../helpers/formatTime';
import { dragRange, pointerToTime } from '../helpers/dragMath';

export interface TimeGridViewProps {
  /** Variant marker. Pure cosmetic — the rendering is the same. */
  variant?: 'week' | 'workWeek' | 'day' | 'multiDay';
}

const TOTAL_MINUTES = 24 * 60;

/**
 * The hour-grid view shared by week / workWeek / day / multiDay. The visible day range
 * comes from the headless hook (`state.visibleRange`) and is laid out as N day columns +
 * the leading time axis.
 *
 * Drag-to-create is implemented inline (no portal/listener registry — just a per-grid
 * pointer-capture flow). Drag-move + resize hook in via the EventCard's `onResizeStart`
 * + the card's own `onPointerDown`.
 */
export function TimeGridView(_props: TimeGridViewProps) {
  const ctx = useSchedulerContext();
  const { state, hourHeight, snapMinutes, t, workingHours, workingDays } = ctx;

  const days = useMemo(
    () => eachDayInRange(state.visibleRange.start, state.visibleRange.end),
    [state.visibleRange],
  );

  const gridClasses = useSlotClass('scheduler.timeGrid', schedulerTimeGridRecipe, {});
  const headerClasses = useSlotClass(
    'scheduler.timeGrid.header',
    schedulerTimeGridHeaderRecipe,
    {},
  );
  const allDayBandClasses = useSlotClass(
    'scheduler.timeGrid.allDayBand',
    schedulerAllDayBandRecipe,
    {},
  );
  const allDayLabelClasses = useSlotClass(
    'scheduler.timeGrid.allDayLabel',
    schedulerAllDayLabelRecipe,
    {},
  );

  const totalHeight = TOTAL_MINUTES * (hourHeight / 60);

  /** Grid for the days region only — N equal columns. */
  const daysGridStyle: CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
    }),
    [days.length],
  );

  /** Outer 2-column grid that mirrors `schedulerTimeGridRecipe`'s `[64px_1fr]`. */
  const headerRowStyle: CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: '64px minmax(0, 1fr)',
    }),
    [],
  );

  /* ---------------------------------------------------------------------- */
  /*  Drag-to-create state                                                   */
  /* ---------------------------------------------------------------------- */

  const [activeDragCol, setActiveDragCol] = useState<number | null>(null);
  const dragAnchorRef = useRef<Date | null>(null);
  const columnRefs = useRef<Array<HTMLDivElement | null>>([]);

  const today = useMemo(() => new Date(), []);

  const handleColumnPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>, dayIdx: number) => {
      if (!ctx.enableDragCreate || ctx.readOnly) return;
      // Only react to primary mouse / pen / touch — ignore right-click / middle-click.
      if (e.button !== 0) return;
      const col = columnRefs.current[dayIdx];
      if (!col) return;
      const rect = col.getBoundingClientRect();
      const day = days[dayIdx]!;
      const start = pointerToTime({
        pointerY: e.clientY,
        containerTop: rect.top,
        hourHeight,
        dayAnchor: day,
        snapMinutes,
      });
      dragAnchorRef.current = start;
      setActiveDragCol(dayIdx);
      ctx.beginDrag({ type: 'create', start, end: start });
      try {
        (e.target as Element).setPointerCapture(e.pointerId);
      } catch {
        // Ignore — some browsers (Safari for non-mouse events) throw.
      }
    },
    [ctx, days, hourHeight, snapMinutes],
  );

  const handleColumnPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>, dayIdx: number) => {
      if (activeDragCol === null || dragAnchorRef.current === null) return;
      const col = columnRefs.current[dayIdx] ?? columnRefs.current[activeDragCol];
      if (!col) return;
      const rect = col.getBoundingClientRect();
      const day = days[activeDragCol]!;
      const cur = pointerToTime({
        pointerY: e.clientY,
        containerTop: rect.top,
        hourHeight,
        dayAnchor: day,
        snapMinutes,
      });
      const { start, end } = dragRange(dragAnchorRef.current, cur);
      ctx.updateDrag({ start, end });
    },
    [activeDragCol, ctx, days, hourHeight, snapMinutes],
  );

  const handleColumnPointerUp = useCallback(() => {
    if (activeDragCol === null) return;
    setActiveDragCol(null);
    dragAnchorRef.current = null;
    void ctx.commitDrag();
  }, [activeDragCol, ctx]);

  useEffect(() => {
    if (activeDragCol === null) return;
    const handler = () => handleColumnPointerUp();
    window.addEventListener('pointerup', handler);
    return () => window.removeEventListener('pointerup', handler);
  }, [activeDragCol, handleColumnPointerUp]);

  return (
    <div className={gridClasses}>
      {/* Sticky header: 64px spacer column + N equal day columns. Uses an outer
       *  [64px_1fr] grid so the day tracks align exactly with the body's day columns. */}
      <div className={headerClasses} style={{ gridColumn: '1 / span 2' }}>
        <div style={headerRowStyle}>
          <DayHeaderRowSpacer />
          <div style={daysGridStyle}>
            {days.map((d, i) => (
              <DayHeader key={i} day={d} isToday={isSameDay(d, today)} />
            ))}
          </div>
        </div>
        {/* All-day band — same [64px_1fr] outer grid */}
        <div className={allDayBandClasses} style={headerRowStyle}>
          <div className={allDayLabelClasses}>{t.allDay}</div>
          <div style={daysGridStyle}>
            {days.map((d, i) => (
              <AllDayCell key={i} day={d} />
            ))}
          </div>
        </div>
      </div>

      {/* Hour-grid body */}
      <SchedulerTimeAxis />
      <div
        className="relative"
        style={{
          ...daysGridStyle,
          height: totalHeight,
        }}
        role="grid"
        aria-label={t.calendarApplication}
      >
        {days.map((day, dayIdx) => (
          <DayColumn
            key={dayIdx}
            day={day}
            dayIdx={dayIdx}
            isToday={isSameDay(day, today)}
            isWeekend={!isWorkingDay(day, workingDays)}
            hourHeight={hourHeight}
            totalHeight={totalHeight}
            positionedEvents={
              (ctx.layoutsByDay.get(toDayKey(day)) ?? []) as readonly PositionedEvent[]
            }
            workingStart={parseHHMM(workingHours.start)}
            workingEnd={parseHHMM(workingHours.end)}
            registerColRef={(node) => {
              columnRefs.current[dayIdx] = node;
            }}
            onPointerDown={(e) => handleColumnPointerDown(e, dayIdx)}
            onPointerMove={(e) => handleColumnPointerMove(e, dayIdx)}
          />
        ))}
      </div>
    </div>
  );
}

TimeGridView.displayName = 'Scheduler.TimeGridView';

/* -------------------------------------------------------------------------- */
/*  Subparts                                                                   */
/* -------------------------------------------------------------------------- */

function DayHeaderRowSpacer() {
  return <div aria-hidden />;
}

function DayHeader({ day, isToday }: { day: Date; isToday: boolean }) {
  const ctx = useSchedulerContext();
  const headerClasses = useSlotClass(
    'scheduler.timeGrid.dayHeader',
    schedulerTimeGridDayColumnHeaderRecipe,
    { isToday, interactive: !ctx.readOnly },
  );
  const numClasses = useSlotClass(
    'scheduler.timeGrid.dayNumber',
    schedulerTimeGridDayNumberRecipe,
    { isToday },
  );
  return (
    <button
      type="button"
      className={headerClasses}
      onClick={() => {
        ctx.setDate(day);
        ctx.setView('day');
      }}
      role="columnheader"
      aria-label={`${formatWeekday(day, ctx.locale, 'long')} ${formatDayNumber(day, ctx.locale)}`}
    >
      <span>{formatWeekday(day, ctx.locale, 'short')}</span>
      <span className={numClasses}>{formatDayNumber(day, ctx.locale)}</span>
    </button>
  );
}

function AllDayCell({ day }: { day: Date }) {
  const ctx = useSchedulerContext();
  const classes = useSlotClass(
    'scheduler.timeGrid.allDayCell',
    schedulerAllDayCellRecipe,
    {},
  );
  const dayKey = toDayKey(day);
  const items = (ctx.allDayLayoutsByDay.get(dayKey) ?? []) as readonly PositionedEvent[];
  const rowHeight = 22;
  const minHeight = Math.max(28, items.length * (rowHeight + 2) + 4);

  const openAllDayCreate = (rect: DOMRect) => {
    const start = startOfDay(day);
    const end = new Date(start.getTime() + 86_399_999);
    ctx.openQuickPopover({ start, end, allDay: true }, rect, 'create');
  };

  return (
    <div
      className={classes}
      style={{ minHeight }}
      role="gridcell"
      tabIndex={ctx.readOnly ? -1 : 0}
      aria-label={ctx.t.allDay}
      onClick={(e) => {
        if (ctx.readOnly) return;
        openAllDayCreate((e.currentTarget as HTMLDivElement).getBoundingClientRect());
      }}
      onKeyDown={(e) => {
        if (ctx.readOnly) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAllDayCreate((e.currentTarget as HTMLDivElement).getBoundingClientRect());
        }
      }}
    >
      {items.map((pos) => (
        <div
          key={pos.event.id}
          style={{
            position: 'absolute',
            top: pos.column * (rowHeight + 2) + 2,
            left: 2,
            right: 2,
            height: rowHeight,
          }}
        >
          <SchedulerEventCard
            event={pos.event}
            positioned={pos}
            asAllDay
            isSelected={ctx.state.selection.eventId === pos.event.id}
            onClick={(e) => {
              e.stopPropagation();
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              ctx.selectEvent(pos.event.id);
              ctx.openQuickPopover(
                { ...toDraft(pos.event), allDay: true },
                rect,
                'view',
                pos.event.id,
              );
            }}
          />
        </div>
      ))}
    </div>
  );
}

interface DayColumnProps {
  day: Date;
  dayIdx: number;
  isToday: boolean;
  isWeekend: boolean;
  hourHeight: number;
  totalHeight: number;
  positionedEvents: readonly PositionedEvent[];
  workingStart: number;
  workingEnd: number;
  registerColRef: (node: HTMLDivElement | null) => void;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
}

function DayColumn(props: DayColumnProps) {
  const {
    day,
    isToday,
    isWeekend,
    hourHeight,
    totalHeight,
    positionedEvents,
    workingStart,
    workingEnd,
    registerColRef,
    onPointerDown,
    onPointerMove,
  } = props;
  const ctx = useSchedulerContext();

  const columnClasses = useSlotClass(
    'scheduler.timeGrid.dayColumn',
    schedulerDayColumnRecipe,
    { isToday, isWeekend, isOffHours: false },
  );

  const hourLineClasses = useSlotClass(
    'scheduler.timeGrid.hourLine',
    schedulerHourLineRecipe,
    { half: false },
  );

  const halfHourLineClasses = useSlotClass(
    'scheduler.timeGrid.hourLineHalf',
    schedulerHourLineRecipe,
    { half: true },
  );

  const dragPreviewClasses = useSlotClass(
    'scheduler.dragPreview',
    schedulerDragPreviewRecipe,
    {},
  );

  return (
    <div
      ref={registerColRef}
      className={columnClasses}
      style={{ height: totalHeight, position: 'relative' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      {/* Hour rules — top of each hour is solid; mid is dashed */}
      {Array.from({ length: 24 }, (_, hour) => (
        <div key={hour}>
          <div className={hourLineClasses} style={{ top: hour * hourHeight }} />
          <div className={halfHourLineClasses} style={{ top: hour * hourHeight + hourHeight / 2 }} />
        </div>
      ))}

      {/* Off-hours dim band (above working start + below working end) */}
      {ctx.dimOffHours && (
        <>
          {workingStart > 0 && (
            <div
              className="pointer-events-none absolute inset-x-0 bg-bg-subtle/30"
              style={{ top: 0, height: (workingStart / 60) * hourHeight }}
            />
          )}
          {workingEnd < TOTAL_MINUTES && (
            <div
              className="pointer-events-none absolute inset-x-0 bg-bg-subtle/30"
              style={{
                top: (workingEnd / 60) * hourHeight,
                height: ((TOTAL_MINUTES - workingEnd) / 60) * hourHeight,
              }}
            />
          )}
        </>
      )}

      {/* Now indicator */}
      {ctx.showNowIndicator && <SchedulerNowIndicator day={day} showLabel={isToday} />}

      {/* Events. The wrapper stops `pointerdown` so the column-level drag-create handler
       *  doesn't fire when the user means to click / drag an existing event. */}
      {positionedEvents.map((pos) => {
        const { top, height, leftPct, widthPct } = positionedToStyle(pos, hourHeight);
        return (
          <div
            key={pos.event.id}
            style={{
              position: 'absolute',
              top,
              height,
              left: `calc(${leftPct}% + 2px)`,
              width: `calc(${widthPct}% - 4px)`,
              zIndex: 1,
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <SchedulerEventCard
              event={pos.event}
              positioned={pos}
              isSelected={ctx.state.selection.eventId === pos.event.id}
              onClick={(e) => {
                e.stopPropagation();
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                ctx.selectEvent(pos.event.id);
                ctx.openQuickPopover(toDraft(pos.event), rect, 'view', pos.event.id);
              }}
            />
          </div>
        );
      })}

      {/* Drag preview */}
      {ctx.state.drag.active &&
        ctx.state.drag.type === 'create' &&
        ctx.state.drag.previewStart &&
        ctx.state.drag.previewEnd &&
        isSameDay(ctx.state.drag.previewStart, day) && (
          <DragPreview
            start={ctx.state.drag.previewStart}
            end={ctx.state.drag.previewEnd}
            hourHeight={hourHeight}
            classes={dragPreviewClasses}
          />
        )}
    </div>
  );
}

function DragPreview({
  start,
  end,
  hourHeight,
  classes,
}: {
  start: Date;
  end: Date;
  hourHeight: number;
  classes: string;
}) {
  const ctx = useSchedulerContext();
  const startMinute = start.getHours() * 60 + start.getMinutes();
  const endMinute = end.getHours() * 60 + end.getMinutes();
  const top = (startMinute / 60) * hourHeight;
  const height = Math.max(20, ((endMinute - startMinute) / 60) * hourHeight);
  return (
    <div
      className={classes}
      style={{ top, height, left: 4, right: 4 }}
      aria-hidden
    >
      <span className="px-1 py-0.5">
        {formatTime(start, ctx.locale, ctx.timeFormat)} – {formatTime(end, ctx.locale, ctx.timeFormat)}
      </span>
    </div>
  );
}

void addDays;