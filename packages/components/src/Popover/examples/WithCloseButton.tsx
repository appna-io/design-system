import { Button, Popover } from 'apx-ds';

export default function WithCloseButton() {
  return (
    <Popover>
      <Popover.Trigger>
        <Button>Notifications</Button>
      </Popover.Trigger>
      <Popover.Content size="md">
        <Popover.Close />
        <p className="pe-6 text-sm font-medium">3 unread</p>
        <ul className="mt-2 space-y-1 text-xs text-fg-muted">
          <li>• @ahmad mentioned you in #design-system</li>
          <li>• Build #1842 succeeded</li>
          <li>• 1 PR awaiting review</li>
        </ul>
      </Popover.Content>
    </Popover>
  );
}
