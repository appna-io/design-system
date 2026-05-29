import { useState } from 'react';
import { Button, Modal } from 'apx-ds';

export default function Controlled() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex gap-2">
        <Button onClick={() => setOpen(true)}>Open externally</Button>
        <Button variant="outline" onClick={() => setOpen(false)} disabled={!open}>
          Close externally
        </Button>
      </div>
      <p className="text-sm text-fg-muted">
        State is owned by the parent. The Modal mirrors `open` and emits
        `onOpenChange` for every transition.
      </p>
      <Modal open={open} onOpenChange={setOpen}>
        <Modal.Content size="sm">
          <Modal.Close />
          <Modal.Header title="Controlled modal" />
          <Modal.Body>
            <p className="text-sm">
              The parent is the source of truth. Tip: this is the right shape
              when a modal needs to react to async work (e.g. close after save).
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button>Done</Button>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </div>
  );
}
