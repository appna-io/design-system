'use client';

import {
  Div,
  Scheduler,
  type SchedulerCalendarSource,
  type SchedulerEvent,
} from '@apx-ui/ds';
import { useState } from 'react';

/**
 * Toolbar chrome enabled — adds a debounced search field, a density selector, and a filter
 * popover with the calendar checkboxes + holiday toggle. Try filtering by typing "yoga" or
 * unchecking a calendar.
 */

const calendars: SchedulerCalendarSource[] = [
  { id: 'work', name: 'Work', color: 'primary', visible: true },
  { id: 'personal', name: 'Personal', color: 'success', visible: true },
  { id: 'family', name: 'Family', color: 'warning', visible: true },
];

export default function WithFilters() {
  const [events, setEvents] = useState<SchedulerEvent[]>(() => [
    { id: 'w-1', title: 'Sprint review', start: at(10, 0), end: at(11, 0), calendarId: 'work' },
    { id: 'w-2', title: '1:1 with Sam', start: at(14, 0), end: at(14, 30), calendarId: 'work' },
    { id: 'p-1', title: 'Yoga', start: at(7, 0), end: at(8, 0), calendarId: 'personal' },
    { id: 'p-2', title: 'Dentist', start: at(16, 0, 1), end: at(17, 0, 1), calendarId: 'personal' },
    { id: 'f-1', title: 'Dad birthday', start: at(0, 0, 2), end: at(23, 59, 2), allDay: true, calendarId: 'family' },
  ]);

  return (
    <Div height={680}>
      <Scheduler
        events={events}
        calendars={calendars}
        defaultView="week"
        filters
        holidays="auto"
        onEventCreate={async (draft) => {
          const created: SchedulerEvent = {
            ...draft,
            id: `evt-${Date.now()}`,
            title: draft.title ?? '(New event)',
            calendarId: draft.calendarId ?? 'work',
          };
          setEvents((prev) => [...prev, created]);
          return created;
        }}
      />
    </Div>
  );
}

function at(hour: number, minute = 0, dayOffset = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}