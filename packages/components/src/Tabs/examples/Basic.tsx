import { Tabs } from 'apx-ds';

export default function Basic() {
  return (
    <Tabs defaultValue="overview" aria-label="Project sections">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <p>Headline metrics, status, and recent timeline.</p>
      </Tabs.Panel>
      <Tabs.Panel value="activity">
        <p>Audit log of edits, commits, and reviews.</p>
      </Tabs.Panel>
      <Tabs.Panel value="settings">
        <p>Project name, default branch, integrations.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
