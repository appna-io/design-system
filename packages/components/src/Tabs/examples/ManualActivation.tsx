import { Div, Tabs, Typography } from '@apx-ui/ds';

export default function ManualActivation() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      <Typography variant="bodySmall" color="fg.muted">
        With <code>activation=&quot;manual&quot;</code>, arrow keys only move focus — press
        <code className="mx-1">Enter</code> or <code className="mx-1">Space</code> to activate the
        focused tab. Useful when switching panels is expensive (large lists, fetches, etc.).
      </Typography>
      <Tabs activation="manual" defaultValue="overview" aria-label="Manual activation example">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview">Overview panel content.</Tabs.Panel>
        <Tabs.Panel value="activity">Activity panel content.</Tabs.Panel>
        <Tabs.Panel value="settings">Settings panel content.</Tabs.Panel>
      </Tabs>
    </Div>
  );
}