import { useState } from 'react';
import { Button, Div, Modal, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [open, setOpen] = useState(false);

  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3">
      <Div display="flex" gap="2">
        <Button onClick={() => setOpen(true)}>Open externally</Button>
        <Button variant="outline" onClick={() => setOpen(false)} disabled={!open}>
          Close externally
        </Button>
      </Div>
      <Typography variant="bodySmall" color="fg.muted">
        State is owned by the parent. The Modal mirrors `open` and emits
        `onOpenChange` for every transition.
      </Typography>
      <Modal open={open} onOpenChange={setOpen}>
        <Modal.Content size="sm">
          <Modal.Close />
          <Modal.Header title="Controlled modal" />
          <Modal.Body>
            <Typography variant="bodySmall">
              The parent is the source of truth. Tip: this is the right shape
              when a modal needs to react to async work (e.g. close after save).
            </Typography>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button>Done</Button>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Div>
  );
}