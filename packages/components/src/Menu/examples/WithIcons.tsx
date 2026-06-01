import { Copy, FileEdit, LogOut, Trash2, User } from 'lucide-react';
import { Button, Menu } from '@apx-ui/ds';

export default function WithIcons() {
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button>Account</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item leftIcon={<User className="size-4" />}>Profile</Menu.Item>
        <Menu.Item leftIcon={<FileEdit className="size-4" />}>Edit details</Menu.Item>
        <Menu.Item leftIcon={<Copy className="size-4" />}>Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item color="danger" leftIcon={<Trash2 className="size-4" />}>
          Delete
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item leftIcon={<LogOut className="size-4" />}>Sign out</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}