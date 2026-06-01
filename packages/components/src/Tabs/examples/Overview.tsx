import { Badge, Div, Tabs, Typography } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Tabs defaultValue="overview" aria-label="Project workspace">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <Div display="flex" flexDirection="column" gap="3">
          <Typography as="h3" variant="bodySmall" weight="semibold" color="fg.default">
            Q2 release is on track
          </Typography>
          <Typography variant="bodySmall" color="fg.muted">
            3 open tasks · 12 commits this week · deploy scheduled Friday.
          </Typography>
          <Div display="flex" alignItems="center" gap="2">
            <Badge variant="soft" color="success">
              Healthy
            </Badge>
            <Badge variant="outline" color="info">
              v2.4.0
            </Badge>
          </Div>
        </Div>
      </Tabs.Panel>
      <Tabs.Panel value="activity">
        <Div display="flex" flexDirection="column" gap="2">
          <Typography variant="bodySmall" color="fg.default">
            <strong>Maya Singh</strong> merged <code>feat/billing-v2</code> · 2h ago
          </Typography>
          <Typography variant="bodySmall" color="fg.default">
            <strong>Liam Cohen</strong> reviewed 4 pull requests · 5h ago
          </Typography>
          <Typography variant="bodySmall" color="fg.muted">
            Audit log of edits, commits, and reviews.
          </Typography>
        </Div>
      </Tabs.Panel>
      <Tabs.Panel value="settings">
        <Div display="flex" flexDirection="column" gap="2">
          <Typography variant="bodySmall" color="fg.default">
            <strong>Project name:</strong> Northstar
          </Typography>
          <Typography variant="bodySmall" color="fg.default">
            <strong>Default branch:</strong> <code>main</code>
          </Typography>
          <Typography variant="bodySmall" color="fg.muted">
            Integrations: GitHub, Slack, Linear.
          </Typography>
        </Div>
      </Tabs.Panel>
    </Tabs>
  );
}