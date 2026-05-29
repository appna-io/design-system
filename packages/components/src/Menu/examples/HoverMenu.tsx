import { Button, Menu } from 'apx-ds';

export default function HoverMenu() {
  return (
    <Menu trigger="hover" openDelay={120} closeDelay={220}>
      <Menu.Trigger asChild>
        <Button variant="outline">Hover me</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>Hover opens this menu</Menu.Item>
        <Menu.Item>After a short delay</Menu.Item>
        <Menu.Item>Move pointer away to close</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
