import { Button, Popover, Typography } from '@apx-ui/ds';

/**
 * `modal={true}` is the rare middle-ground between a non-modal Popover and a full Modal.
 * It adds a backdrop that captures pointer events (so accidental clicks elsewhere don't
 * bypass the action) and sets `aria-modal="true"` on Content. Use sparingly — for actual
 * blocking dialogs, reach for `<Modal />`.
 */
export default function ModalPopover() {
  return (
    <Popover modal>
      <Popover.Trigger>
        <Button variant="solid" color="warning">
          Modal popover
        </Button>
      </Popover.Trigger>
      <Popover.Content size="md">
        <Popover.Close />
        <Typography variant="bodySmall" weight="medium" className="pe-6">
          Heads up — this is a modal popover.
        </Typography>
        <Typography variant="caption" color="fg.muted" className="mt-1">
          Clicks outside the surface land on the backdrop and close the popover instead of
          activating page elements. <code className="font-mono">aria-modal</code> is set so
          screen readers treat it as a modal-style overlay.
        </Typography>
      </Popover.Content>
    </Popover>
  );
}