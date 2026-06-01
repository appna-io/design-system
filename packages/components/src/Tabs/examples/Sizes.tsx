import { Div, Tabs, Typography } from '@apx-ui/ds';

const sizes = ['sm', 'md', 'lg'] as const;

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      {sizes.map((size) => (
        <Div key={size} display="flex" flexDirection="column" gap="2">
          <Typography as="span" variant="caption" color="fg.muted" className="uppercase tracking-wide">
            {size}
          </Typography>
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
        </Div>
      ))}
    </Div>
  );
}