'use client';

import { useSlotClass } from '../helpers/useSlotClass';
import { useMemo } from 'react';

import {
  schedulerAgendaDayLabelRecipe,
  schedulerAgendaDayRecipe,
  schedulerAgendaEventRecipe,
  schedulerAgendaListRecipe,
  schedulerEmptyRecipe,
} from '../Scheduler.recipe';
import type { NewEventDraft, SchedulerEvent } from '../Scheduler.types';

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
import {
  eachDayInRange,
  isSameDay,
  toDayKey,
} from '../helpers/dateMath';
import {
  formatDayMonth,
  formatTime,
  formatTimeRange,
} from '../helpers/formatTime';
import { isNamedColor, resolveEventColor } from '../helpers/eventColor';

/**
 * "Schedule" view — Google Calendar's flat list of upcoming days. Empty days are skipped
 * unless every day in the range is empty (in which case we render the empty state).
 */
export function AgendaView() {
  const ctx = useSchedulerContext();
  const { state, t, locale, timeFormat } = ctx;
  const today = useMemo(() => new Date(), []);

  const days = useMemo(
    () => eachDayInRange(state.visibleRange.start, state.visibleRange.end),
    [state.visibleRange],
  );

  const listClasses = useSlotClass('scheduler.agenda.list', schedulerAgendaListRecipe, {});
  const emptyClasses = useSlotClass('scheduler.agenda.empty', schedulerEmptyRecipe, {});

  const nonEmptyDays = days.filter((d) => (ctx.eventsByDay.get(toDayKey(d)) ?? []).length > 0);

  if (nonEmptyDays.length === 0) {
    return (
      <div className={emptyClasses}>
        <strong>{t.empty}</strong>
        <span>{t.noEventsInRange}</span>
      </div>
    );
  }

  return (
    <div className={listClasses} role="list">
      {nonEmptyDays.map((day) => (
        <AgendaDay
          key={day.getTime()}
          day={day}
          isToday={isSameDay(day, today)}
          events={(ctx.eventsByDay.get(toDayKey(day)) ?? []) as readonly SchedulerEvent[]}
          locale={locale}
          timeFormat={timeFormat}
        />
      ))}
    </div>
  );
}

AgendaView.displayName = 'Scheduler.AgendaView';

function AgendaDay({
  day,
  isToday,
  events,
  locale,
  timeFormat,
}: {
  day: Date;
  isToday: boolean;
  events: readonly SchedulerEvent[];
  locale: string;
  timeFormat: '12h' | '24h';
}) {
  const ctx = useSchedulerContext();
  const rowClasses = useSlotClass('scheduler.agenda.day', schedulerAgendaDayRecipe, {});
  const labelClasses = useSlotClass(
    'scheduler.agenda.dayLabel',
    schedulerAgendaDayLabelRecipe,
    { isToday },
  );
  const eventBaseClasses = useSlotClass(
    'scheduler.agenda.event',
    schedulerAgendaEventRecipe,
    {},
  );

  const sortedEvents = useMemo(
    () => events.slice().sort((a, b) => a.start.getTime() - b.start.getTime()),
    [events],
  );

  return (
    <div className={rowClasses} role="listitem">
      <div className={labelClasses}>{formatDayMonth(day, locale)}</div>
      <div className="flex flex-col gap-1">
        {sortedEvents.map((event) => {
          const color = resolveEventColor(event, ctx.calendarById, ctx.color);
          const namedColor = typeof color === 'string' && isNamedColor(color) ? color : ctx.color;
          const customStyle =
            typeof color === 'string' && !isNamedColor(color)
              ? { borderInlineStartColor: color }
              : undefined;
          return (
            <button
              key={event.id}
              type="button"
              className={`${eventBaseClasses} border-s-${namedColor}`}
              style={customStyle}
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                ctx.selectEvent(event.id);
                ctx.openQuickPopover(toDraft(event), rect, 'view', event.id);
              }}
            >
              <span className="font-semibold">{event.title || ctx.t.untitledEvent}</span>
              <span className="text-xs text-fg-muted">
                {event.allDay
                  ? ctx.t.allDay
                  : formatTimeRange(event.start, event.end, locale, timeFormat)}
              </span>
              {event.location && (
                <span className="text-xs text-fg-muted">{event.location}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

void formatTime;
