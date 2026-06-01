'use client';

import {
  Div,
  Scheduler,
  type SchedulerCalendarSource,
  type SchedulerEvent,
} from '@apx-ui/ds';
import { useState } from 'react';

/**
 * Everything turned on — sidebar with mini-month, calendar checkboxes, and holiday toggle,
 * plus the toolbar chrome trio (search + density + filter menu). This is the closest
 * approximation to a Google-Calendar-style application surface that the Scheduler ships out
 * of the box. Pass children to the Sidebar to swap in a fully custom layout.
 */

const calendars: SchedulerCalendarSource[] = [
  { id: 'work', name: 'Work', color: 'primary', visible: true },
  { id: 'personal', name: 'Personal', color: 'success', visible: true },
  { id: 'family', name: 'Family', color: 'warning', visible: true },
  { id: 'side', name: 'Side projects', color: 'info', visible: true },
];

export default function FullChrome() {
  const [events, setEvents] = useState<SchedulerEvent[]>(() => [
    { id: 'w-1', title: 'Standup', start: at(9, 0), end: at(9, 15), calendarId: 'work' },
    { id: 'w-2', title: 'Sprint review', start: at(10, 0), end: at(11, 0), calendarId: 'work' },
    { id: 'w-3', title: 'Design crit', start: at(15, 0), end: at(16, 0), calendarId: 'work' },
    { id: 'p-1', title: 'Yoga', start: at(7, 0), end: at(8, 0), calendarId: 'personal' },
    { id: 'p-2', title: 'Dentist', start: at(16, 0, 1), end: at(17, 0, 1), calendarId: 'personal' },
    { id: 'f-1', title: 'Dad birthday', start: at(0, 0, 2), end: at(23, 59, 2), allDay: true, calendarId: 'family' },
    { id: 's-1', title: 'Blog draft', start: at(20, 0, 1), end: at(21, 30, 1), calendarId: 'side' },
  ]);

  return (
    <Div height={720}>
      <Scheduler
        events={events}
        calendars={calendars}
        defaultView="week"
        sidebar
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