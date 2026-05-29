import { useState } from 'react';
import { Button, Tooltip } from '@apx-ui/ds';

export default function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip
        content="Controlled — toggle me with the buttons →"
        open={open}
        onOpenChange={setOpen}
      >
        <Button variant="soft">Trigger (controlled)</Button>
      </Tooltip>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Open
      </Button>
      <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
        Close
      </Button>
      <span className="text-xs text-fg-muted">open: {String(open)}</span>
    </div>
  );
}
