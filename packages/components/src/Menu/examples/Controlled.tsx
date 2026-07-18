import { useState } from 'react';

import { Button, Div, Menu, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Div display="flex" alignItems="center" gap="3">
        <Menu open={open} onOpenChange={setOpen} closeOnSelect={false}>
          <Menu.Trigger asChild>
            <Button>{open ? 'Close menu' : 'Open menu'}</Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item onSelect={() => setCount((c) => c + 1)}>Increment (stays open)</Menu.Item>
            <Menu.Item onSelect={() => setCount(0)}>Reset</Menu.Item>
          </Menu.Content>
        </Menu>
        <Button variant="outline" onClick={() => setOpen((o) => !o)}>
          Toggle from outside
        </Button>
      </Div>
      <Typography variant="bodySmall" color="fg.muted">
        Count: <strong>{count}</strong> · Open: <strong>{String(open)}</strong>
      </Typography>
    </Div>
  );
}