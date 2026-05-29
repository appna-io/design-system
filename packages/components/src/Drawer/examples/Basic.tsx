import { Button, Drawer } from 'apx-ds';

export default function Basic() {
  return (
    <Drawer>
      <Drawer.Trigger>
        <Button>Open drawer</Button>
      </Drawer.Trigger>
      <Drawer.Content side="right">
        <Drawer.Close />
        <Drawer.Header
          title="Notifications"
          description="Recent activity from your team."
        />
        <Drawer.Body>
          <p className="text-sm">
            Drawers are edge-anchored panels. They lock the page scroll, trap
            focus inside the content, and dismiss on Escape, backdrop click, or
            the Close button.
          </p>
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
