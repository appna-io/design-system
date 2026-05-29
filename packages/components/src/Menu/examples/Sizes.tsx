import { Button, Menu } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <div className="flex flex-wrap gap-3">
      <Menu>
        <Menu.Trigger asChild>
          <Button size="sm">Small</Button>
        </Menu.Trigger>
        <Menu.Content size="sm">
          <Menu.Item>Apple</Menu.Item>
          <Menu.Item>Banana</Menu.Item>
          <Menu.Item>Cherry</Menu.Item>
        </Menu.Content>
      </Menu>

      <Menu>
        <Menu.Trigger asChild>
          <Button>Medium</Button>
        </Menu.Trigger>
        <Menu.Content size="md">
          <Menu.Item>Apple</Menu.Item>
          <Menu.Item>Banana</Menu.Item>
          <Menu.Item>Cherry</Menu.Item>
        </Menu.Content>
      </Menu>

      <Menu>
        <Menu.Trigger asChild>
          <Button size="lg">Large</Button>
        </Menu.Trigger>
        <Menu.Content size="lg">
          <Menu.Item>Apple</Menu.Item>
          <Menu.Item>Banana</Menu.Item>
          <Menu.Item>Cherry</Menu.Item>
        </Menu.Content>
      </Menu>
    </div>
  );
}
