import { Timeline } from '@apx-ui/ds';

export default function ActiveEmphasis() {
  return (
    <Timeline aria-label="Active emphasis">
      <Timeline.Item tone="success">
        <Timeline.Title>Step 1 — passed</Timeline.Title>
      </Timeline.Item>
      <Timeline.Item tone="success">
        <Timeline.Title>Step 2 — passed</Timeline.Title>
      </Timeline.Item>
      <Timeline.Item tone="info" active>
        <Timeline.Title>Step 3 — currently running</Timeline.Title>
        <Timeline.Description>The active flag adds a soft pulsing ring (respects prefers-reduced-motion).</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="neutral">
        <Timeline.Title>Step 4 — pending</Timeline.Title>
      </Timeline.Item>
    </Timeline>
  );
}
