import { useState } from 'react';
import { Button, Popover } from '@apx-ui/ds';

export default function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <Button variant="outline">Trigger (controlled)</Button>
        </Popover.Trigger>
        <Popover.Content>
          <p className="text-sm">
            Parent owns <code className="font-mono">open</code>.
          </p>
        </Popover.Content>
      </Popover>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        External open
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
        External close
      </Button>
      <span className="text-xs text-fg-muted">open: {String(open)}</span>
    </div>
  );
}
