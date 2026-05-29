import { useState } from 'react';

import { Scheduler, type SchedulerEvent } from 'apx-ds';

const now = new Date();
function at(hour: number, minute: number, dayOffset = 0): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const SEED: SchedulerEvent[] = [
  { id: 'evt-1', title: 'Design review', start: at(10, 0), end: at(11, 30), color: 'primary' },
  { id: 'evt-2', title: 'All-hands', start: at(13, 0), end: at(14, 0), color: 'success' },
  { id: 'evt-3', title: '1:1 with Maya', start: at(15, 30, 1), end: at(16, 0, 1), color: 'info' },
];

export default function Basic() {
  const [events, setEvents] = useState<SchedulerEvent[]>(SEED);

  return (
    <Scheduler
      events={events}
      defaultView="week"
      holidays="auto"
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
      onEventUpdate={async (event, patch) => {
        setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, ...patch } : e)));
      }}
      onEventDelete={async (id) => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }}
      onEventMove={async (event, change) => {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, start: change.start, end: change.end } : e)),
        );
      }}
      onEventResize={async (event, change) => {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, start: change.start, end: change.end } : e)),
        );
      }}
    />
  );
}
