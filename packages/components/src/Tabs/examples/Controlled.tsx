import { useState } from 'react';
import { Button, Tabs } from 'apx-ds';

export default function Controlled() {
  const [value, setValue] = useState('overview');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-fg-muted">External controls:</span>
        <Button size="sm" variant="ghost" onClick={() => setValue('overview')}>
          Overview
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setValue('activity')}>
          Activity
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setValue('settings')}>
          Settings
        </Button>
      </div>
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
    </div>
  );
}
