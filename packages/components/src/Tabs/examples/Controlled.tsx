import { useState } from 'react';
import { Button, Div, Tabs, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [value, setValue] = useState('overview');

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Div display="flex" alignItems="center" gap="2">
        <Typography as="span" variant="bodySmall" color="fg.muted">
          External controls:
        </Typography>
        <Button size="sm" variant="ghost" onClick={() => setValue('overview')}>
          Overview
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setValue('activity')}>
          Activity
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setValue('settings')}>
          Settings
        </Button>
      </Div>
      <Tabs value={value} onValueChange={setValue} aria-label="Controlled tabs">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview">Overview panel content.</Tabs.Panel>
        <Tabs.Panel value="activity">Activity panel content.</Tabs.Panel>
        <Tabs.Panel value="settings">Settings panel content.</Tabs.Panel>
      </Tabs>
    </Div>
  );
}