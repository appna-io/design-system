import { Timeline } from '@apx-ui/ds';

export default function Horizontal() {
  return (
    <Timeline orientation="horizontal" aria-label="Horizontal milestones">
      <Timeline.Item tone="success" timestamp="Q1">
        <Timeline.Title>Discovery</Timeline.Title>
        <Timeline.Description>40 customer interviews; shipped a problem brief.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="success" timestamp="Q2">
        <Timeline.Title>Prototype</Timeline.Title>
        <Timeline.Description>Built the design system primitive layer.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="info" timestamp="Q3" active>
        <Timeline.Title>Beta</Timeline.Title>
        <Timeline.Description>50 invited accounts, weekly cohort calls.</Timeline.Description>
      </Timeline.Item>
      <Timeline.Item tone="neutral" timestamp="Q4">
        <Timeline.Title>GA</Timeline.Title>
        <Timeline.Description>Open signup + paid plans.</Timeline.Description>
      </Timeline.Item>
    </Timeline>
  );
}
