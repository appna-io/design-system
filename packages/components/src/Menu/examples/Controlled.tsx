import { useState } from 'react';

import { Button, Menu } from '@apx-ui/ds';

export default function Controlled() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Menu open={open} onOpenChange={setOpen}>
          <Menu.Trigger asChild>
            <Button>{open ? 'Close menu' : 'Open menu'}</Button>
          </Menu.Trigger>
          <Menu.Content closeOnSelect={false}>
            <Menu.Item onSelect={() => setCount((c) => c + 1)}>Increment (stays open)</Menu.Item>
            <Menu.Item onSelect={() => setCount(0)}>Reset</Menu.Item>
          </Menu.Content>
        </Menu>
        <Button variant="outline" onClick={() => setOpen((o) => !o)}>
          Toggle from outside
        </Button>
      </div>
      <p className="text-sm text-fg-muted">
        Count: <strong>{count}</strong> · Open: <strong>{String(open)}</strong>
      </p>
    </div>
  );
}
