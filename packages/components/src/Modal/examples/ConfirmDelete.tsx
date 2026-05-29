import { Button, Modal } from 'apx-ds';

export default function ConfirmDelete() {
  return (
    <Modal closeOnBackdropClick={false}>
      <Modal.Trigger>
        <Button color="danger">Delete account</Button>
      </Modal.Trigger>
      <Modal.Content size="sm">
        <Modal.Header
          title="Delete account?"
          description="This action is permanent and cannot be undone."
        />
        <Modal.Body>
          <p className="text-sm text-fg-default">
            Your projects, settings, and history will be removed from our
            servers within 24 hours. We&apos;ll send you a final invoice if
            you&apos;re on a paid plan.
          </p>
        </Modal.Body>
        <Modal.Footer align="between">
          <Modal.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Modal.Close>
          <Button color="danger">Yes, delete</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
