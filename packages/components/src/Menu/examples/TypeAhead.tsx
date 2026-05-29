import { Button, Menu } from '@apx-ui/ds';

export default function TypeAhead() {
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button>Fruit</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>Apple</Menu.Item>
        <Menu.Item>Apricot</Menu.Item>
        <Menu.Item>Banana</Menu.Item>
        <Menu.Item>Blueberry</Menu.Item>
        <Menu.Item>Cherry</Menu.Item>
        <Menu.Item>Coconut</Menu.Item>
        <Menu.Item>Date</Menu.Item>
        <Menu.Item>Dragon fruit</Menu.Item>
        <Menu.Item>Mango</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
