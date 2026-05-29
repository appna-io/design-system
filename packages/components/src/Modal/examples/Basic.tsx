import { Button, Modal } from 'apx-ds';

export default function Basic() {
  return (
    <Modal>
      <Modal.Trigger>
        <Button>Open modal</Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Close />
        <Modal.Header
          title="Profile settings"
          description="Update your display name and avatar."
        />
        <Modal.Body>
          <p className="text-sm">
            Modals are blocking dialogs. They lock the page scroll, trap focus
            inside the content, and dismiss on Escape, backdrop click, or the
            Close button.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Modal.Close>
          <Button>Save</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
