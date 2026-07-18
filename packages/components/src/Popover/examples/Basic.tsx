import { Button, Popover, Typography } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Popover>
      <Popover.Trigger>
        <Button>Open popover</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Typography variant="bodySmall">
          Popovers carry interactive content. Click outside or press Escape to close.
        </Typography>
      </Popover.Content>
    </Popover>
  );
}