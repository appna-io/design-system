import { Timeline } from '@apx-ui/ds';

export default function AlternatingLayout() {
  return (
    <Timeline layout="alternating" aria-label="Alternating layout">
      <Timeline.Item tone="info">
        <Timeline.Title>2024 — Founded</Timeline.Title>
        <Timeline.Description>Two people, one whiteboard, zero customers.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="success">
        <Timeline.Title>2025 — First product launch</Timeline.Title>
        <Timeline.Description>Shipped the v1 dashboard to 150 beta accounts.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="warning">
        <Timeline.Title>2025 Q3 — Scaling pains</Timeline.Title>
        <Timeline.Description>Rebuilt the data layer; cut p95 latency by 60%.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="success" active>
        <Timeline.Title>2026 — Public release</Timeline.Title>
        <Timeline.Description>Open SDK, third-party plugins, public roadmap.</Timeline.Description>
      </Timeline.Item>
    </Timeline>
  );
}