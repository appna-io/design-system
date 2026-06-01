import { Trash2 } from 'lucide-react';
import { Button, Menu } from '@apx-ui/ds';

export default function DestructiveItem() {
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button variant="ghost">Row actions</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>Edit row</Menu.Item>
        <Menu.Item>Duplicate row</Menu.Item>
        <Menu.Separator />
        <Menu.Item color="danger" leftIcon={<Trash2 className="size-4" />}>
          Delete row
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
}