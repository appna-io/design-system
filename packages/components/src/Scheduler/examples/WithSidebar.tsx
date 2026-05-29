'use client';

import {
  Scheduler,
  type SchedulerCalendarSource,
  type SchedulerEvent,
} from 'apx-ds';
import { useState } from 'react';

/**
 * Sidebar enabled — renders mini-month + calendar checkboxes + holiday toggle on the
 * leading edge of the body. Click any day in the mini-month to jump the main view.
 */

const calendars: SchedulerCalendarSource[] = [
  { id: 'work', name: 'Work', color: 'primary', visible: true },
  { id: 'personal', name: 'Personal', color: 'success', visible: true },
  { id: 'family', name: 'Family', color: 'warning', visible: true },
];

export default function WithSidebar() {
  const [events, setEvents] = useState<SchedulerEvent[]>(() => [
    { id: 'w-1', title: 'Standup', start: at(9, 0), end: at(9, 15), calendarId: 'work' },
    { id: 'w-2', title: 'Sprint review', start: at(10, 0), end: at(11, 0), calendarId: 'work' },
    { id: 'p-1', title: 'Yoga', start: at(7, 0), end: at(8, 0), calendarId: 'personal' },
    { id: 'p-2', title: 'Dentist', start: at(16, 0, 1), end: at(17, 0, 1), calendarId: 'personal' },
    { id: 'f-1', title: 'Dad birthday', start: at(0, 0, 2), end: at(23, 59, 2), allDay: true, calendarId: 'family' },
  ]);

  return (
    <div style={{ height: 680 }}>
      <Scheduler
        events={events}
        calendars={calendars}
        defaultView="week"
        sidebar
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
    </div>
  );
}

function at(hour: number, minute = 0, dayOffset = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}
