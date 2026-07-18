import { Tabs, Typography } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Tabs defaultValue="overview" aria-label="Project sections">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <Typography variant="bodySmall" color="fg.default">
          Headline metrics, status, and recent timeline.
        </Typography>
      </Tabs.Panel>
      <Tabs.Panel value="activity">
        <Typography variant="bodySmall" color="fg.default">
          Audit log of edits, commits, and reviews.
        </Typography>
      </Tabs.Panel>
      <Tabs.Panel value="settings">
        <Typography variant="bodySmall" color="fg.default">
          Project name, default branch, integrations.
        </Typography>
      </Tabs.Panel>
    </Tabs>
  );
}