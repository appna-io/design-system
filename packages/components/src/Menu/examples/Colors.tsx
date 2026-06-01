import { Button, Div, Menu } from '@apx-ui/ds';
import type { MenuColor } from '@apx-ui/ds';

const colors: MenuColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

export default function Colors() {
  return (
    <Div display="flex" flexWrap="wrap" gap="3">
      {colors.map((color) => (
        <Menu key={color}>
          <Menu.Trigger asChild>
            <Button color={color} variant="outline">
              {color}
            </Button>
          </Menu.Trigger>
          <Menu.Content variant="soft" color={color}>
            <Menu.Item>Item one</Menu.Item>
            <Menu.Item>Item two</Menu.Item>
            <Menu.Item>Item three</Menu.Item>
          </Menu.Content>
        </Menu>
      ))}
    </Div>
  );
}