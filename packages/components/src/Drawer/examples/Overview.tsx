import { Button, Drawer, Div, Typography } from '@apx-ui/ds';

/**
 * Quick-review demo of `<Drawer />` — trigger button plus a right-side panel with
 * header, body copy, and footer actions demonstrating the compound API.
 */
export default function Overview() {
  return (
    <Drawer defaultOpen>
      <Div display="flex" flexDirection="column" gap="3">
        <Drawer.Trigger>
          <Button>Open notifications</Button>
        </Drawer.Trigger>
        <Typography variant="bodySmall" color="fg.muted">
          Edge-anchored panel with scroll lock, focus trap, and dismiss on Escape or backdrop click.
        </Typography>
      </Div>
      <Drawer.Content side="right" size="md">
        <Drawer.Close />
        <Drawer.Header
          title="Notifications"
          description="Recent activity from your team."
        />
        <Drawer.Body>
          <Typography variant="bodySmall">
            Maya Singh commented on <strong>Helios platform redesign</strong>. Liam Cohen assigned
            you to <strong>Q2 billing migration</strong>. Two unread mentions in #engineering.
          </Typography>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="ghost">Dismiss</Button>
          </Drawer.Close>
          <Button>Mark all read</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}