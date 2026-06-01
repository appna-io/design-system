import { useState } from 'react';
import { Button, Div, Drawer, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [open, setOpen] = useState(false);

  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3">
      <Div display="flex" gap="2">
        <Button onClick={() => setOpen(true)}>Open externally</Button>
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={!open}
        >
          Close externally
        </Button>
      </Div>
      <Typography variant="bodySmall" color="fg.muted">
        State is owned by the parent. The Drawer mirrors `open` and emits
        `onOpenChange` for every transition.
      </Typography>
      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content side="right" size="sm">
          <Drawer.Close />
          <Drawer.Header title="Controlled drawer" />
          <Drawer.Body>
            <Typography variant="bodySmall">
              The parent is the source of truth. This shape is correct when a
              drawer needs to react to async work (e.g. close after save).
            </Typography>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button>Done</Button>
            </Drawer.Close>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Div>
  );
}