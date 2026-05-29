import { Tabs } from 'apx-ds';

const sizes = ['sm', 'md', 'lg'] as const;

export default function Sizes() {
  return (
    <div className="flex flex-col gap-6">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-fg-muted">{size}</span>
          <Tabs size={size} defaultValue="overview" aria-label={`${size} tabs example`}>
            <Tabs.List>
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
              <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="overview">Overview panel</Tabs.Panel>
            <Tabs.Panel value="activity">Activity panel</Tabs.Panel>
            <Tabs.Panel value="settings">Settings panel</Tabs.Panel>
          </Tabs>
        </div>
      ))}
    </div>
  );
}
