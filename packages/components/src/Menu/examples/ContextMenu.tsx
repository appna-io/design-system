import { Menu } from '@apx-ui/ds';

export default function ContextMenu() {
  return (
    <Menu trigger="context">
      <Menu.Trigger asChild>
        <div className="rounded-md border border-dashed border-border-default p-8 text-center text-sm text-fg-muted">
          Right-click anywhere in this area
        </div>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item>Cut</Menu.Item>
        <Menu.Item>Copy</Menu.Item>
        <Menu.Item>Paste</Menu.Item>
        <Menu.Separator />
        <Menu.Item color="danger">Delete</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
