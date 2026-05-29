import { Button, Popover } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Popover>
      <Popover.Trigger>
        <Button>Open popover</Button>
      </Popover.Trigger>
      <Popover.Content>
        <p className="text-sm">
          Popovers carry interactive content. Click outside or press Escape to close.
        </p>
      </Popover.Content>
    </Popover>
  );
}
