import { Button, Div, Menu } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Div display="flex" flexWrap="wrap" gap="3">
      <Menu>
        <Menu.Trigger asChild>
          <Button>Solid</Button>
        </Menu.Trigger>
        <Menu.Content variant="solid">
          <Menu.Item>Apple</Menu.Item>
          <Menu.Item>Banana</Menu.Item>
          <Menu.Item>Cherry</Menu.Item>
        </Menu.Content>
      </Menu>

      <Menu>
        <Menu.Trigger asChild>
          <Button>Outline</Button>
        </Menu.Trigger>
        <Menu.Content variant="outline" color="primary">
          <Menu.Item>Apple</Menu.Item>
          <Menu.Item>Banana</Menu.Item>
          <Menu.Item>Cherry</Menu.Item>
        </Menu.Content>
      </Menu>

      <Menu>
        <Menu.Trigger asChild>
          <Button>Soft</Button>
        </Menu.Trigger>
        <Menu.Content variant="soft" color="success">
          <Menu.Item>Apple</Menu.Item>
          <Menu.Item>Banana</Menu.Item>
          <Menu.Item>Cherry</Menu.Item>
        </Menu.Content>
      </Menu>
    </Div>
  );
}