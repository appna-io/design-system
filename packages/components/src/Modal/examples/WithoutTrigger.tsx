import { useCallback, useState } from 'react';
import { Button, Modal } from 'apx-ds';

/**
 * Demonstrates the **without-trigger** API: there is no `<Modal.Trigger>` in the tree. The
 * parent component owns when the Modal opens via the controlled `open` prop. Useful for
 * onboarding banners, session timeouts, and announcements where the trigger is a background
 * event (e.g. a server response) rather than an in-tree click.
 *
 * The example deliberately requires a user click before scheduling the open. Earlier shapes
 * auto-opened on page load, which made the renderer's Modal docs page unusable (the modal
 * re-armed itself every 1.5s in a loop). The user-action gate keeps the demo predictable while
 * preserving the "the parent decides when, the Modal just renders" semantic.
 */
export default function WithoutTrigger() {
  const [open, setOpen] = useState(false);

  const handleSchedule = useCallback(() => {
    setTimeout(() => setOpen(true), 1500);
  }, []);

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-fg-muted">
        Click the button to schedule the Modal to open in 1.5 seconds. There is
        no `Modal.Trigger` in the tree &mdash; the parent owns the lifecycle
        directly.
      </p>
      <Button onClick={handleSchedule}>Show welcome in 1.5s</Button>
      <Modal open={open} onOpenChange={setOpen}>
        <Modal.Content size="sm">
          <Modal.Close />
          <Modal.Header
            title="Welcome"
            description="No trigger required — the parent owns when to show this."
          />
          <Modal.Body>
            <p className="text-sm">
              This pattern is common for onboarding banners, session timeouts,
              and announcements where the trigger is &quot;a background event&quot;
              such as a server message rather than an in-tree click.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button>Got it</Button>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </div>
  );
}
