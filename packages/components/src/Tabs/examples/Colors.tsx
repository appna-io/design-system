import { Tabs, type TabsColor } from '@apx-ui/ds';

const colors: TabsColor[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'];

export default function Colors() {
  return (
    <div className="flex flex-col gap-6">
      {colors.map((color) => (
        <div key={color} className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-fg-muted">{color}</span>
          <Tabs color={color} defaultValue="overview" aria-label={`${color} tabs example`}>
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
