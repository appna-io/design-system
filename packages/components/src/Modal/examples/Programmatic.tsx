import { useCallback, useState } from 'react';
import { Button, Modal } from 'apx-ds';

/**
 * The DS does not ship a `useModal()` hook. Same effect with `useState` + `useCallback`: a tiny
 * controller object you can pass around imperatively. Cheaper than another hook surface, and the
 * pattern composes with whatever state library a consumer already uses (Zustand, Jotai, …).
 */
function useModalController() {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  return { open, setOpen, openModal, closeModal };
}

export default function Programmatic() {
  const m = useModalController();

  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={m.openModal}>Open programmatically</Button>
      <p className="text-sm text-fg-muted">
        No `Modal.Trigger` involved — the parent component opens the modal
        imperatively via a tiny controller object.
      </p>
      <Modal open={m.open} onOpenChange={m.setOpen}>
        <Modal.Content size="sm">
          <Modal.Close />
          <Modal.Header title="Programmatic modal" />
          <Modal.Body>
            <p className="text-sm">
              Useful for `confirm()`-style flows: open the modal in response to
              user actions far from the trigger (toast undo, bulk action, etc.).
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onClick={m.closeModal}>
              Cancel
            </Button>
            <Button onClick={m.closeModal}>OK</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </div>
  );
}
