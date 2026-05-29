import { Scheduler, type SchedulerEvent } from 'apx-ds';

const base = new Date();
function at(hour: number, minute: number, dayOffset = 0): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const events: SchedulerEvent[] = [
  { id: '1', title: 'Locked: Daily standup', start: at(9, 0), end: at(9, 15), color: 'neutral' },
  { id: '2', title: 'Locked: Sprint planning', start: at(10, 0), end: at(11, 30), color: 'primary' },
  { id: '3', title: 'Locked: Lunch', start: at(12, 0), end: at(13, 0), color: 'success' },
  { id: '4', title: 'Locked: All-hands', start: at(15, 0, 1), end: at(16, 0, 1), color: 'warning' },
];

export default function ReadOnly() {
  return (
    <Scheduler
      events={events}
      defaultView="week"
      readOnly
      style={{ height: 600 }}
    />
  );
}
