import { useState } from 'react';

import { Button, Menu } from 'apx-ds';

export default function CheckboxItems() {
  const [sidebar, setSidebar] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [statusBar, setStatusBar] = useState(true);

  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button>View</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Label>Visibility</Menu.Label>
        <Menu.CheckboxItem
          checked={sidebar}
          onCheckedChange={setSidebar}
          shortcut="⌘\\"
        >
          Show sidebar
        </Menu.CheckboxItem>
        <Menu.CheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>
          Show status bar
        </Menu.CheckboxItem>
        <Menu.CheckboxItem checked={fullscreen} onCheckedChange={setFullscreen} shortcut="F11">
          Fullscreen
        </Menu.CheckboxItem>
      </Menu.Content>
    </Menu>
  );
}
