import { Timeline } from 'apx-ds';

export default function Sizes() {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="text-fg-muted mb-2 text-sm">Small</h3>
        <Timeline size="sm">
          <Timeline.Item tone="success"><Timeline.Title>Compact entry</Timeline.Title></Timeline.Item>
          <Timeline.Item tone="info"><Timeline.Title>Another compact entry</Timeline.Title></Timeline.Item>
          <Timeline.Item tone="neutral"><Timeline.Title>One more compact entry</Timeline.Title></Timeline.Item>
        </Timeline>
      </section>
      <section>
        <h3 className="text-fg-muted mb-2 text-sm">Medium (default)</h3>
        <Timeline size="md">
          <Timeline.Item tone="success"><Timeline.Title>Default-size entry</Timeline.Title></Timeline.Item>
          <Timeline.Item tone="info"><Timeline.Title>Default-size entry</Timeline.Title></Timeline.Item>
          <Timeline.Item tone="neutral"><Timeline.Title>Default-size entry</Timeline.Title></Timeline.Item>
        </Timeline>
      </section>
      <section>
        <h3 className="text-fg-muted mb-2 text-sm">Large</h3>
        <Timeline size="lg">
          <Timeline.Item tone="success"><Timeline.Title>Hero entry with breathing room</Timeline.Title></Timeline.Item>
          <Timeline.Item tone="info"><Timeline.Title>Hero entry with breathing room</Timeline.Title></Timeline.Item>
          <Timeline.Item tone="neutral"><Timeline.Title>Hero entry with breathing room</Timeline.Title></Timeline.Item>
        </Timeline>
      </section>
    </div>
  );
}
