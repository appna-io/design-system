import { Timeline } from 'apx-ds';

export default function WithMedia() {
  return (
    <Timeline aria-label="Posts with media">
      <Timeline.Item tone="info" timestamp={new Date(Date.now() - 7_200_000)}>
        <Timeline.Title>Shipped a redesign</Timeline.Title>
        <Timeline.Description>The new dashboard ships with denser KPI tiles.</Timeline.Description>
        <Timeline.Media>
          <div className="bg-bg-subtle text-fg-muted flex h-32 w-full items-center justify-center text-sm">
            screenshot placeholder
          </div>
        </Timeline.Media>
      </Timeline.Item>

      <Timeline.Item tone="success" timestamp={new Date(Date.now() - 86_400_000)}>
        <Timeline.Title>Customer milestone</Timeline.Title>
        <Timeline.Description>10 000 active accounts \U0001f389</Timeline.Description>
      </Timeline.Item>
    </Timeline>
  );
}
