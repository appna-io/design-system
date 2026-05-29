import { Timeline } from '@apx-ui/ds';

export default function AbsoluteTimestamps() {
  return (
    <Timeline timestampFormat="absolute" locale="en-US" aria-label="Absolute timestamps">
      <Timeline.Item tone="success" timestamp={new Date('2026-05-01T08:14:00Z')}>
        <Timeline.Title>System update applied</Timeline.Title>
        <Timeline.Description>v2.1.4 \u2014 rollouts complete in all regions.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="warning" timestamp={new Date('2026-05-05T17:42:00Z')}>
        <Timeline.Title>Elevated error rate</Timeline.Title>
        <Timeline.Description>p95 latency reached 1.4s for 12 minutes.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="success" timestamp={new Date('2026-05-05T18:10:00Z')}>
        <Timeline.Title>Recovered</Timeline.Title>
        <Timeline.Description>Auto-scaling kicked in; latency back to baseline.</Timeline.Description>
      </Timeline.Item>
    </Timeline>
  );
}
