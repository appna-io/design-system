import { Button, Div, Popover, Typography } from '@apx-ui/ds';

export default function WithArrow() {
  return (
    <Div display="flex" alignItems="center" className="flex-wrap gap-4">
      <Popover>
        <Popover.Trigger>
          <Button variant="outline">No arrow (default)</Button>
        </Popover.Trigger>
        <Popover.Content>
          <Typography variant="bodySmall">
            Popovers default to <code className="font-mono">showArrow=false</code>.
          </Typography>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger>
          <Button variant="outline">With arrow</Button>
        </Popover.Trigger>
        <Popover.Content showArrow color="primary" variant="outline">
          <Typography variant="bodySmall">
            An arrow points back at the trigger after Floating UI&apos;s flip resolves.
          </Typography>
        </Popover.Content>
      </Popover>
    </Div>
  );
}