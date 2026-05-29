import { Button, Menu } from 'apx-ds';

export default function Disabled() {
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button>Edit</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>Undo</Menu.Item>
        <Menu.Item disabled>Redo</Menu.Item>
        <Menu.Separator />
        <Menu.Item>Cut</Menu.Item>
        <Menu.Item>Copy</Menu.Item>
        <Menu.Item disabled>Paste</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
