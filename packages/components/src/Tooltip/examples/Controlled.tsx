import { useState } from 'react';
import { Button, Div, Tooltip, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
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
      <Typography variant="caption" color="fg.muted">
        open: {String(open)}
      </Typography>
    </Div>
  );
}