import { Tabs } from '@apx-ui/ds';

const variants = ['underline', 'solid', 'pills', 'enclosed'] as const;

export default function Variants() {
  return (
    <div className="flex flex-col gap-8">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-fg-muted">{variant}</span>
          <Tabs variant={variant} defaultValue="overview" aria-label={`${variant} tabs example`}>
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
