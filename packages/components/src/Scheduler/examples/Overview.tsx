import { Div, Scheduler, type SchedulerEvent } from '@apx-ui/ds';

const now = new Date();
function at(hour: number, minute: number, dayOffset = 0): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const events: SchedulerEvent[] = [
  { id: 'evt-1', title: 'Design review', start: at(10, 0), end: at(11, 30), color: 'primary' },
  { id: 'evt-2', title: 'All-hands', start: at(13, 0), end: at(14, 0), color: 'success' },
  { id: 'evt-3', title: '1:1 with Maya', start: at(15, 30, 1), end: at(16, 0, 1), color: 'info' },
];

export default function Overview() {
  return (
    <Div maxHeight={480} className="overflow-hidden">
      <Scheduler events={events} defaultView="week" readOnly style={{ height: 480 }} />
    </Div>
  );
}