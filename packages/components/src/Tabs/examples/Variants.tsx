import { Div, Tabs, Typography } from '@apx-ui/ds';

const variants = ['underline', 'solid', 'pills', 'enclosed'] as const;

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="8">
      {variants.map((variant) => (
        <Div key={variant} display="flex" flexDirection="column" gap="2">
          <Typography as="span" variant="caption" color="fg.muted" className="uppercase tracking-wide">
            {variant}
          </Typography>
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
        </Div>
      ))}
    </Div>
  );
}