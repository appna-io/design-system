import { Button, Modal } from '@apx-ui/ds';

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
          <p className="text-sm">
            Pressing <kbd>Escape</kbd> closes the topmost modal first. The
            engine&apos;s escape-stack ordering ensures only one layer unwinds per
            press, even when modals are stacked.
          </p>
          <div className="mt-4">
            <Modal>
              <Modal.Trigger>
                <Button variant="outline">Open inner</Button>
              </Modal.Trigger>
              <Modal.Content size="sm">
                <Modal.Close />
                <Modal.Header title="Inner modal" />
                <Modal.Body>
                  <p className="text-sm">
                    This is the inner modal. Pressing Escape closes only this
                    one — the outer modal stays open.
                  </p>
                </Modal.Body>
                <Modal.Footer>
                  <Modal.Close asChild>
                    <Button>Close inner</Button>
                  </Modal.Close>
                </Modal.Footer>
              </Modal.Content>
            </Modal>
          </div>
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
