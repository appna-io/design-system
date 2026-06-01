import { Div, Timeline, Typography } from '@apx-ui/ds';

export default function HorizontalResponsive() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        Resize the viewport — below <code>md</code> the horizontal timeline collapses to a vertical
        list, swapping the indicator column from top to leading-edge.
      </Typography>
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
    </Div>
  );
}