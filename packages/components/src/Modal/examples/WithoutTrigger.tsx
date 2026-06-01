import { useCallback, useState } from 'react';
import { Button, Div, Modal, Typography } from '@apx-ui/ds';

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
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Click the button to schedule the Modal to open in 1.5 seconds. There is
        no `Modal.Trigger` in the tree &mdash; the parent owns the lifecycle
        directly.
      </Typography>
      <Button onClick={handleSchedule}>Show welcome in 1.5s</Button>
      <Modal open={open} onOpenChange={setOpen}>
        <Modal.Content size="sm">
          <Modal.Close />
          <Modal.Header
            title="Welcome"
            description="No trigger required — the parent owns when to show this."
          />
          <Modal.Body>
            <Typography variant="bodySmall">
              This pattern is common for onboarding banners, session timeouts,
              and announcements where the trigger is &quot;a background event&quot;
              such as a server message rather than an in-tree click.
            </Typography>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button>Got it</Button>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Div>
  );
}