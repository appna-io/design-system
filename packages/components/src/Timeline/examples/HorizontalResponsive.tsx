import { Timeline } from 'apx-ds';

export default function HorizontalResponsive() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted text-sm">
        Resize the viewport \u2014 below <code>md</code> the horizontal timeline collapses to a vertical
        list, swapping the indicator column from top to leading-edge.
      </p>
      <Timeline orientation="horizontal" responsive aria-label="Release roadmap">
        <Timeline.Item tone="success" timestamp="Q1 2026">
          <Timeline.Title>v1.0</Timeline.Title>
          <Timeline.Description>Initial public release.</Timeline.Description>
        </Timeline.Item>
        <Timeline.Item tone="success" timestamp="Q2 2026">
          <Timeline.Title>v1.1</Timeline.Title>
          <Timeline.Description>Tokens API + theme switcher.</Timeline.Description>
        </Timeline.Item>
        <Timeline.Item tone="info" timestamp="Q3 2026" active>
          <Timeline.Title>v1.2</Timeline.Title>
          <Timeline.Description>Charts and data-grid.</Timeline.Description>
        </Timeline.Item>
        <Timeline.Item tone="neutral" timestamp="Q4 2026">
          <Timeline.Title>v2.0</Timeline.Title>
          <Timeline.Description>Plugin SDK.</Timeline.Description>
        </Timeline.Item>
      </Timeline>
    </div>
  );
}
