import { useState } from 'react';

import { Button, Div, Menu, Typography } from '@apx-ui/ds';

export default function Basic() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <Div display="flex" flexDirection="column" alignItems="center" gap="3">
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
      <Typography
        as="p"
        aria-live="polite"
        variant="bodySmall"
        color="fg.muted"
        className="min-h-[1.25rem]"
      >
        {lastAction ? (
          <>
            Last action: <strong className="text-fg">{lastAction}</strong>
          </>
        ) : (
          <Typography as="span" variant="bodySmall" className="opacity-60">
            Pick an item to see it here.
          </Typography>
        )}
      </Typography>
    </Div>
  );
}