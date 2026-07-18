import { Copy, FileEdit, Trash2, User } from 'lucide-react';
import { Button, Menu } from '@apx-ui/ds';

/**
 * Quick-review demo of `<Menu />` — trigger button opens a keyboard-navigable
 * action list with icons, a separator, and a destructive item.
 */
export default function Overview() {
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button>Account</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item leftIcon={<User className="size-4" />}>Profile</Menu.Item>
        <Menu.Item leftIcon={<FileEdit className="size-4" />}>Edit details</Menu.Item>
        <Menu.Separator />
        <Menu.Item leftIcon={<Copy className="size-4" />}>Duplicate</Menu.Item>
        <Menu.Item color="danger" leftIcon={<Trash2 className="size-4" />}>
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
}