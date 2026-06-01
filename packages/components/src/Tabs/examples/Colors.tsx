import { Div, Tabs, Typography, type TabsColor } from '@apx-ui/ds';

const colors: TabsColor[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'];

export default function Colors() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      {colors.map((color) => (
        <Div key={color} display="flex" flexDirection="column" gap="2">
          <Typography as="span" variant="caption" color="fg.muted" className="uppercase tracking-wide">
            {color}
          </Typography>
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
        </Div>
      ))}
    </Div>
  );
}