import { Scheduler, type SchedulerEvent } from '@apx-ui/ds';

const base = new Date();
function day(offset: number, hour = 10, minute = 0): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const events: SchedulerEvent[] = [
  { id: '1', title: 'Sprint demo', start: day(0, 14, 0), end: day(0, 15, 0), color: 'primary', location: 'Room 4-A' },
  { id: '2', title: 'Coffee with Sara', start: day(1, 9, 0), end: day(1, 9, 30), color: 'info', location: 'Cafe' },
  { id: '3', title: 'Quarterly review', start: day(3, 10, 0), end: day(3, 12, 0), color: 'warning' },
  { id: '4', title: 'OOO', start: day(6), end: day(8), allDay: true, color: 'secondary' },
  { id: '5', title: 'Release notes', start: day(10, 16, 0), end: day(10, 17, 0), color: 'success' },
];

export default function Agenda() {
  return (
    <Scheduler
      events={events}
      defaultView="agenda"
      readOnly
      style={{ height: 600 }}
    />
  );
}
