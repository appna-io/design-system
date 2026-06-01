import { Button, Div, Popover, Typography } from '@apx-ui/ds';

export default function WithCloseButton() {
  return (
    <Popover>
      <Popover.Trigger>
        <Button>Notifications</Button>
      </Popover.Trigger>
      <Popover.Content size="md">
        <Popover.Close />
        <Typography variant="bodySmall" weight="medium" className="pe-6">
          3 unread
        </Typography>
        <Div as="ul" className="mt-2 space-y-1">
          <Typography as="li" variant="caption" color="fg.muted">
            • @ahmad mentioned you in #design-system
          </Typography>
          <Typography as="li" variant="caption" color="fg.muted">
            • Build #1842 succeeded
          </Typography>
          <Typography as="li" variant="caption" color="fg.muted">
            • 1 PR awaiting review
          </Typography>
        </Div>
      </Popover.Content>
    </Popover>
  );
}