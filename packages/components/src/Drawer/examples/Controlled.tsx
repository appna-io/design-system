import { useState } from 'react';
import { Button, Drawer } from 'apx-ds';

export default function Controlled() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex gap-2">
        <Button onClick={() => setOpen(true)}>Open externally</Button>
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={!open}
        >
          Close externally
        </Button>
      </div>
      <p className="text-sm text-fg-muted">
        State is owned by the parent. The Drawer mirrors `open` and emits
        `onOpenChange` for every transition.
      </p>
      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content side="right" size="sm">
          <Drawer.Close />
          <Drawer.Header title="Controlled drawer" />
          <Drawer.Body>
            <p className="text-sm">
              The parent is the source of truth. This shape is correct when a
              drawer needs to react to async work (e.g. close after save).
            </p>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button>Done</Button>
            </Drawer.Close>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
