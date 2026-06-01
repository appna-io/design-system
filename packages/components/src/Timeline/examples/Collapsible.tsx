import { Div, Timeline, Typography } from '@apx-ui/ds';

export default function Collapsible() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        With <code>collapsible</code>, each title becomes a button with <code>aria-expanded</code> /
        <code>aria-controls</code>. Click a title to expand or collapse its description.
      </Typography>
      <Timeline collapsible aria-label="Audit log (collapsible)">
        <Timeline.Item tone="info" timestamp={new Date(Date.now() - 60_000)}>
          <Timeline.Title>User signed in</Timeline.Title>
          <Timeline.Description>
            IP 10.0.4.32 · Chrome 124 · macOS 14.5. Session token issued for 24 hours.
          </Timeline.Description>
        </Timeline.Item>
        <Timeline.Item tone="warning" timestamp={new Date(Date.now() - 90_000)}>
          <Timeline.Title>Password reset requested</Timeline.Title>
          <Timeline.Description>
            Email sent to ahmad@example.com. The reset link expires in 60 minutes.
          </Timeline.Description>
        </Timeline.Item>
        <Timeline.Item tone="success" timestamp={new Date(Date.now() - 3_600_000)}>
          <Timeline.Title>2FA enabled</Timeline.Title>
          <Timeline.Description>Backup codes downloaded to local device.</Timeline.Description>
        </Timeline.Item>
      </Timeline>
    </Div>
  );
}