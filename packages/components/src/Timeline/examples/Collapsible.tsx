import { Timeline } from 'apx-ds';

export default function Collapsible() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted text-sm">
        With <code>collapsible</code>, each title becomes a button with <code>aria-expanded</code> /
        <code>aria-controls</code>. Click a title to expand or collapse its description.
      </p>
      <Timeline collapsible aria-label="Audit log (collapsible)">
        <Timeline.Item tone="info" timestamp={new Date(Date.now() - 60_000)}>
          <Timeline.Title>User signed in</Timeline.Title>
          <Timeline.Description>
            IP 10.0.4.32 \u00b7 Chrome 124 \u00b7 macOS 14.5. Session token issued for 24 hours.
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
    </div>
  );
}
