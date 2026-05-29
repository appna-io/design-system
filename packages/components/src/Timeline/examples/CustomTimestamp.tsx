import { Timeline } from '@apx-ui/ds';

const fmt = (d: Date) => `\u23F1 ${d.getUTCHours().toString().padStart(2, '0')}:${d
  .getUTCMinutes()
  .toString()
  .padStart(2, '0')} UTC`;

export default function CustomTimestamp() {
  return (
    <Timeline timestampFormat={fmt} aria-label="Custom timestamp format">
      <Timeline.Item tone="info" timestamp={new Date('2026-05-12T09:14:00Z')}>
        <Timeline.Title>Build started</Timeline.Title>
      </Timeline.Item>
      <Timeline.Item tone="success" timestamp={new Date('2026-05-12T09:17:00Z')}>
        <Timeline.Title>Tests passed (1402)</Timeline.Title>
      </Timeline.Item>
      <Timeline.Item tone="success" timestamp={new Date('2026-05-12T09:21:00Z')}>
        <Timeline.Title>Deployed to production</Timeline.Title>
      </Timeline.Item>
    </Timeline>
  );
}
