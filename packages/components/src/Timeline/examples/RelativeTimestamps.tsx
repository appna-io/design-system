import { Timeline } from '@apx-ui/ds';

const now = Date.now();
const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;

export default function RelativeTimestamps() {
  return (
    <Timeline timestampFormat="relative" aria-label="Relative timestamps">
      <Timeline.Item tone="info" timestamp={new Date(now - 30 * minute)}>
        <Timeline.Title>30 minutes ago</Timeline.Title>
      </Timeline.Item>
      <Timeline.Item tone="info" timestamp={new Date(now - 4 * hour)}>
        <Timeline.Title>A few hours back</Timeline.Title>
      </Timeline.Item>
      <Timeline.Item tone="info" timestamp={new Date(now - 3 * day)}>
        <Timeline.Title>Earlier this week</Timeline.Title>
      </Timeline.Item>
      <Timeline.Item tone="info" timestamp={new Date(now - 45 * day)}>
        <Timeline.Title>Last month</Timeline.Title>
      </Timeline.Item>
    </Timeline>
  );
}
