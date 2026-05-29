import { useState } from 'react';

import { Button, Menu } from '@apx-ui/ds';

export default function Basic() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <Menu>
        <Menu.Trigger asChild>
          <Button>Options</Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={() => setLastAction('Edit profile')}>Edit profile</Menu.Item>
          <Menu.Item onSelect={() => setLastAction('Duplicate')}>Duplicate</Menu.Item>
          <Menu.Separator />
          <Menu.Item color="danger" onSelect={() => setLastAction('Delete')}>
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu>
      <p aria-live="polite" className="min-h-[1.25rem] text-sm text-fg-muted">
        {lastAction ? (
          <>
            Last action: <strong className="text-fg">{lastAction}</strong>
          </>
        ) : (
          <span className="opacity-60">Pick an item to see it here.</span>
        )}
      </p>
    </div>
  );
}
