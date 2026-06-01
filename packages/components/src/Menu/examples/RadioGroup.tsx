import { useState } from 'react';

import { Button, Menu } from '@apx-ui/ds';

export default function RadioGroup() {
  const [theme, setTheme] = useState('system');

  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button>Theme: {theme}</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.RadioGroup value={theme} onValueChange={setTheme}>
          <Menu.Label>Appearance</Menu.Label>
          <Menu.RadioItem value="light">Light</Menu.RadioItem>
          <Menu.RadioItem value="dark">Dark</Menu.RadioItem>
          <Menu.RadioItem value="system">System</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu>
  );
}