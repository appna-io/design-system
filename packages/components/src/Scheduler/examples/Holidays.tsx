'use client';

import { Div, Scheduler, type SchedulerEvent, type SchedulerHoliday } from '@apx-ui/ds';
import { useState } from 'react';

const customHolidays: SchedulerHoliday[] = [
  { id: 'h-1', date: isoDate(20), name: 'Company Off-Site', type: 'custom', region: 'CO' },
  { id: 'h-2', date: isoDate(25), name: 'Q-end Demo Day', type: 'observance', region: 'CO' },
];

export default function Holidays() {
  const [events] = useState<SchedulerEvent[]>(() => [
    { id: '1', title: 'Sprint planning', start: at(10, 0), end: at(11, 0), color: 'info' },
    { id: '2', title: 'OKR review', start: at(14, 0), end: at(15, 0), color: 'warning' },
  ]);

  return (
    <Div height={680}>
      <Scheduler
        events={events}
        defaultView="month"
        holidays={customHolidays}
        showHolidays
      />
    </Div>
  );
}

function at(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

function isoDate(dayOfMonth: number): string {
  const d = new Date();
  d.setDate(dayOfMonth);
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dd}`;
}