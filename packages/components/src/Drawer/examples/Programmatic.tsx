import { useCallback, useState } from 'react';
import { Button, Drawer } from 'apx-ds';

/**
 * Same controller-object pattern Modal uses. No dedicated `useDrawer()` hook — `useState` +
 * `useCallback` + the controlled `open` prop covers the full surface, and the controller object
 * composes with whatever state library a consumer already uses.
 */
function useDrawerController() {
  const [open, setOpen] = useState(false);
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  return { open, setOpen, openDrawer, closeDrawer };
}

export default function Programmatic() {
  const d = useDrawerController();

  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={d.openDrawer}>Open programmatically</Button>
      <p className="text-sm text-fg-muted">
        No `Drawer.Trigger` involved — the parent component opens the drawer
        imperatively via a tiny controller object.
      </p>
      <Drawer open={d.open} onOpenChange={d.setOpen}>
        <Drawer.Content side="right" size="sm">
          <Drawer.Close />
          <Drawer.Header title="Programmatic drawer" />
          <Drawer.Body>
            <p className="text-sm">
              Useful for &quot;Apply filters&quot; flows triggered from a
              toolbar far from the drawer&apos;s location, or from an
              effect-driven background event.
            </p>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="ghost" onClick={d.closeDrawer}>
              Cancel
            </Button>
            <Button onClick={d.closeDrawer}>Apply</Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
