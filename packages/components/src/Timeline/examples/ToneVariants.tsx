import { Timeline } from 'apx-ds';

export default function ToneVariants() {
  return (
    <Timeline aria-label="Tone variants">
      <Timeline.Item tone="info">
        <Timeline.Title>Info — informational event</Timeline.Title>
        <Timeline.Description>Use for status changes and non-critical announcements.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="success">
        <Timeline.Title>Success — positive outcome</Timeline.Title>
        <Timeline.Description>Confirmed actions, completions, green-status events.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="warning">
        <Timeline.Title>Warning — needs attention</Timeline.Title>
        <Timeline.Description>Soft signal — not blocking but worth a glance.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="danger">
        <Timeline.Title>Danger — failure / blocker</Timeline.Title>
        <Timeline.Description>Hard error states, rejected actions, red events.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="neutral">
        <Timeline.Title>Neutral — default tone</Timeline.Title>
        <Timeline.Description>Use when the event carries no semantic weight.</Timeline.Description>
      </Timeline.Item>
    </Timeline>
  );
}
