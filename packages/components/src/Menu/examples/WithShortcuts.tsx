import { Button, Menu } from '@apx-ui/ds';

export default function WithShortcuts() {
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button>File</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item shortcut="⌘N">New file</Menu.Item>
        <Menu.Item shortcut="⌘O">Open…</Menu.Item>
        <Menu.Item shortcut="⌘S">Save</Menu.Item>
        <Menu.Item shortcut="⌘⇧S">Save as…</Menu.Item>
        <Menu.Separator />
        <Menu.Item shortcut="⌘W">Close window</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}