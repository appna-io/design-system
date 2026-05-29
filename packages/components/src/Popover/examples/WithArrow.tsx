import { Button, Popover } from '@apx-ui/ds';

export default function WithArrow() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Popover>
        <Popover.Trigger>
          <Button variant="outline">No arrow (default)</Button>
        </Popover.Trigger>
        <Popover.Content>
          <p className="text-sm">Popovers default to <code className="font-mono">showArrow=false</code>.</p>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger>
          <Button variant="outline">With arrow</Button>
        </Popover.Trigger>
        <Popover.Content showArrow color="primary" variant="outline">
          <p className="text-sm">
            An arrow points back at the trigger after Floating UI&apos;s flip resolves.
          </p>
        </Popover.Content>
      </Popover>
    </div>
  );
}
