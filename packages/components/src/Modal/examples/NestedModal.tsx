import { Button, Div, Modal, Typography } from '@apx-ui/ds';

export default function NestedModal() {
  return (
    <Modal>
      <Modal.Trigger>
        <Button>Open outer</Button>
      </Modal.Trigger>
      <Modal.Content size="md">
        <Modal.Close />
        <Modal.Header
          title="Outer modal"
          description="Open the inner modal to test the escape stack."
        />
        <Modal.Body>
          <Typography variant="bodySmall">
            Pressing <kbd>Escape</kbd> closes the topmost modal first. The
            engine&apos;s escape-stack ordering ensures only one layer unwinds per
            press, even when modals are stacked.
          </Typography>
          <Div className="mt-4">
            <Modal>
              <Modal.Trigger>
                <Button variant="outline">Open inner</Button>
              </Modal.Trigger>
              <Modal.Content size="sm">
                <Modal.Close />
                <Modal.Header title="Inner modal" />
                <Modal.Body>
                  <Typography variant="bodySmall">
                    This is the inner modal. Pressing Escape closes only this
                    one — the outer modal stays open.
                  </Typography>
                </Modal.Body>
                <Modal.Footer>
                  <Modal.Close asChild>
                    <Button>Close inner</Button>
                  </Modal.Close>
                </Modal.Footer>
              </Modal.Content>
            </Modal>
          </Div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button>Close outer</Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}