import { Div, Menu, Typography } from '@apx-ui/ds';

export default function ContextMenu() {
  return (
    <Menu trigger="context">
      <Menu.Trigger asChild>
        <Div className="rounded-md border border-dashed border-border-default p-8 text-center">
          <Typography variant="bodySmall" color="fg.muted">
            Right-click anywhere in this area
          </Typography>
        </Div>
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