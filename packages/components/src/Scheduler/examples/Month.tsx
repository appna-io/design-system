'use client';

import { Scheduler, type SchedulerEvent } from '@apx-ui/ds';
import { useState } from 'react';

export default function Month() {
  const [events, setEvents] = useState<SchedulerEvent[]>(() => seedMonthEvents());

  return (
    <div style={{ height: 680 }}>
      <Scheduler
        events={events}
        defaultView="month"
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

function seedMonthEvents(): SchedulerEvent[] {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const make = (day: number, hour: number, durationMinutes: number, title: string, color: SchedulerEvent['color']): SchedulerEvent => {
    const start = new Date(y, m, day, hour, 0, 0, 0);
    const end = new Date(start.getTime() + durationMinutes * 60_000);
    return { id: `${day}-${hour}-${title}`, title, start, end, color };
  };
  return [
    make(2, 10, 60, 'Onboarding session', 'primary'),
    make(5, 14, 30, 'Coffee with Alex', 'secondary'),
    make(8, 9, 90, 'Design crit', 'info'),
    make(12, 13, 60, 'All-hands', 'success'),
    make(15, 16, 30, 'Retro', 'warning'),
    make(18, 11, 120, 'Architecture review', 'info'),
    make(22, 9, 30, 'Standup', 'primary'),
    make(25, 15, 60, 'Customer call', 'danger'),
  ];
}
