import { useState } from 'react';
import { Button, Div, Popover, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <Div display="flex" alignItems="center" className="flex-wrap gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <Button variant="outline">Trigger (controlled)</Button>
        </Popover.Trigger>
        <Popover.Content>
          <Typography variant="bodySmall">
            Parent owns <code className="font-mono">open</code>.
          </Typography>
        </Popover.Content>
      </Popover>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        External open
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
        External close
      </Button>
      <Typography as="span" variant="caption" color="fg.muted">
        open: {String(open)}
      </Typography>
    </Div>
  );
}