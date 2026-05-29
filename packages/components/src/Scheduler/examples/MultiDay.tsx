import { useState } from 'react';

import { Scheduler, type SchedulerEvent } from '@apx-ui/ds';

const base = new Date();
function at(hour: number, minute: number, dayOffset = 0): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export default function MultiDay() {
  const [events, setEvents] = useState<SchedulerEvent[]>([
    { id: '1', title: 'Workshop', start: at(10, 0, 0), end: at(12, 0, 0), color: 'primary' },
    { id: '2', title: 'Client call', start: at(14, 30, 1), end: at(15, 30, 1), color: 'info' },
    { id: '3', title: 'Conf travel', start: at(0, 0, 2), end: at(0, 0, 3), allDay: true, color: 'warning' },
  ]);

  return (
    <Scheduler
      events={events}
      defaultView="multiDay"
      multiDayCount={4}
      style={{ height: 680 }}
      onEventCreate={async (draft) => {
        const created: SchedulerEvent = {
          ...draft,
          id: `evt-${Date.now()}`,
          title: draft.title ?? '(No title)',
        };
        setEvents((prev) => [...prev, created]);
        return created;
      }}
    />
  );
}
