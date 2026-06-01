import { useState } from 'react';
import { Button, Div, Popover, Typography } from '@apx-ui/ds';

/**
 * The "Are you sure?" pattern. The destructive trigger opens a Popover that focuses the
 * Cancel button by default (so accidental Enter doesn't confirm). Confirming closes the
 * Popover and runs the action; cancelling just closes.
 */
export default function ConfirmAction() {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  return (
    <Div display="flex" alignItems="center" gap="3">
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <Button variant="solid" color="danger" disabled={deleted}>
            {deleted ? 'Deleted' : 'Delete account'}
          </Button>
        </Popover.Trigger>
        <Popover.Content variant="outline" color="danger" size="md">
          <Typography variant="bodySmall" weight="medium">
            Delete this account?
          </Typography>
          <Typography variant="caption" color="fg.muted" className="mt-1">
            This action cannot be undone.
          </Typography>
          <Div display="flex" className="mt-3 justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="solid"
              color="danger"
              size="sm"
              onClick={() => {
                setDeleted(true);
                setOpen(false);
              }}
            >
              Delete
            </Button>
          </Div>
        </Popover.Content>
      </Popover>
      {deleted ? (
        <button
          type="button"
          className="text-xs text-fg-muted underline"
          onClick={() => setDeleted(false)}
        >
          (reset)
        </button>
      ) : null}
    </Div>
  );
}