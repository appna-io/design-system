import { Badge, Tabs } from 'apx-ds';

export default function WithBadges() {
  return (
    <Tabs defaultValue="inbox" aria-label="Inbox folders">
      <Tabs.List>
        <Tabs.Trigger value="inbox" badge={<Badge color="primary">12</Badge>}>
          Inbox
        </Tabs.Trigger>
        <Tabs.Trigger value="mentions" badge={<Badge color="warning">3</Badge>}>
          Mentions
        </Tabs.Trigger>
        <Tabs.Trigger value="archive">Archive</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="inbox">12 unread conversations.</Tabs.Panel>
      <Tabs.Panel value="mentions">3 new mentions.</Tabs.Panel>
      <Tabs.Panel value="archive">Archived items.</Tabs.Panel>
    </Tabs>
  );
}
