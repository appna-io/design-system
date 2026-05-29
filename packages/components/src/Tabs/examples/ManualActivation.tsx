import { Tabs } from 'apx-ds';

export default function ManualActivation() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">
        With <code>activation=&quot;manual&quot;</code>, arrow keys only move focus — press
        <code className="mx-1">Enter</code> or <code className="mx-1">Space</code> to activate the
        focused tab. Useful when switching panels is expensive (large lists, fetches, etc.).
      </p>
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
    </div>
  );
}
