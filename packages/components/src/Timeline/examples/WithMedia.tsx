import { Div, Timeline } from '@apx-ui/ds';

export default function WithMedia() {
  return (
    <Timeline aria-label="Posts with media">
      <Timeline.Item tone="info" timestamp={new Date(Date.now() - 7_200_000)}>
        <Timeline.Title>Shipped a redesign</Timeline.Title>
        <Timeline.Description>The new dashboard ships with denser KPI tiles.</Timeline.Description>
        <Timeline.Media>
          <Div
            display="flex"
            alignItems="center"
            justifyContent="center"
            className="h-32 w-full bg-bg-subtle text-sm text-fg-muted"
          >
            screenshot placeholder
          </Div>
        </Timeline.Media>
      </Timeline.Item>

      <Timeline.Item tone="success" timestamp={new Date(Date.now() - 86_400_000)}>
        <Timeline.Title>Customer milestone</Timeline.Title>
        <Timeline.Description>10 000 active accounts 🎉</Timeline.Description>
      </Timeline.Item>
    </Timeline>
  );
}