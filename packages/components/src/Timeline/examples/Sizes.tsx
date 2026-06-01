import { Div, Timeline, Typography } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="8">
      <Div>
        <Typography as="h3" variant="bodySmall" color="fg.muted" className="mb-2">
          Small
        </Typography>
        <Timeline size="sm">
          <Timeline.Item tone="success"><Timeline.Title>Compact entry</Timeline.Title></Timeline.Item>
          <Timeline.Item tone="info"><Timeline.Title>Another compact entry</Timeline.Title></Timeline.Item>
          <Timeline.Item tone="neutral"><Timeline.Title>One more compact entry</Timeline.Title></Timeline.Item>
        </Timeline>
      </Div>
      <Div>
        <Typography as="h3" variant="bodySmall" color="fg.muted" className="mb-2">
          Medium (default)
        </Typography>
        <Timeline size="md">
          <Timeline.Item tone="success"><Timeline.Title>Default-size entry</Timeline.Title></Timeline.Item>
          <Timeline.Item tone="info"><Timeline.Title>Default-size entry</Timeline.Title></Timeline.Item>
          <Timeline.Item tone="neutral"><Timeline.Title>Default-size entry</Timeline.Title></Timeline.Item>
        </Timeline>
      </Div>
      <Div>
        <Typography as="h3" variant="bodySmall" color="fg.muted" className="mb-2">
          Large
        </Typography>
        <Timeline size="lg">
          <Timeline.Item tone="success"><Timeline.Title>Hero entry with breathing room</Timeline.Title></Timeline.Item>
          <Timeline.Item tone="info"><Timeline.Title>Hero entry with breathing room</Timeline.Title></Timeline.Item>
          <Timeline.Item tone="neutral"><Timeline.Title>Hero entry with breathing room</Timeline.Title></Timeline.Item>
        </Timeline>
      </Div>
    </Div>
  );
}