'use client';

import { Scheduler, type SchedulerEvent } from 'apx-ds';
import { useState } from 'react';

export default function Day() {
  const [events, setEvents] = useState<SchedulerEvent[]>(() => [
    { id: 'd-1', title: 'Standup', start: at(9, 0), end: at(9, 15), color: 'primary' },
    { id: 'd-2', title: 'Focus block', start: at(9, 30), end: at(11, 30), color: 'info' },
    { id: 'd-3', title: 'Lunch', start: at(12, 0), end: at(13, 0), color: 'success' },
    { id: 'd-4', title: 'Pairing', start: at(13, 30), end: at(15, 0), color: 'secondary' },
    { id: 'd-5', title: 'Demo prep', start: at(15, 30), end: at(17, 0), color: 'warning' },
    { id: 'd-6', title: 'Out of office', start: at(0, 0), end: at(23, 59), allDay: true, color: 'neutral' },
  ]);

  return (
    <div style={{ height: 640 }}>
      <Scheduler
        events={events}
        defaultView="day"
        holidays="auto"
        onEventCreate={async (draft) => {
          const created: SchedulerEvent = {
            ...draft,
            id: `evt-${Date.now()}`,
            title: draft.title ?? '(New event)',
          };
          setEvents((prev) => [...prev, created]);
          return created;
        }}
      />
    </div>
  );
}

function at(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}
