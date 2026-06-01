import { Button, Modal, Typography } from '@apx-ui/ds';

/**
 * Quick-review demo of `<Modal />` — trigger opens a confirmation dialog with
 * header, body copy, and footer actions.
 */
export default function Overview() {
  return (
    <Modal closeOnBackdropClick={false}>
      <Modal.Trigger>
        <Button color="danger">Delete project</Button>
      </Modal.Trigger>
      <Modal.Content size="sm">
        <Modal.Header
          title="Delete project?"
          description="This action is permanent and cannot be undone."
        />
        <Modal.Body>
          <Typography variant="bodySmall" color="fg.default">
            All environments, deploy history, and team access for{' '}
            <strong>Helios platform redesign</strong> will be removed. Paid plans receive a final
            invoice within 24 hours.
          </Typography>
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