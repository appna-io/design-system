import { Tabs } from 'apx-ds';

export default function Disabled() {
  return (
    <Tabs defaultValue="overview" aria-label="Project sections">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="security" disabled>
          Security
        </Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">Overview panel content.</Tabs.Panel>
      <Tabs.Panel value="activity">Activity panel content.</Tabs.Panel>
      <Tabs.Panel value="security">Security panel content (cannot be reached).</Tabs.Panel>
      <Tabs.Panel value="settings">Settings panel content.</Tabs.Panel>
    </Tabs>
  );
}
