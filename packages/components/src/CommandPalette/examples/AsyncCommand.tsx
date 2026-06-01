import { useState } from 'react';
import { Button, CommandPalette } from '@apx-ui/ds';

/**
 * Commands can return a Promise — the palette stays open and shows the row in its highlighted
 * state until the work completes, then closes. Use this for actions where the user benefits
 * from immediate feedback ("Syncing…" toast, progress indicator, etc.).
 */
function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const COMMANDS = [
  {
    id: 'sync',
    label: 'Sync workspace (1.5s)',
    category: 'Workspace',
    onSelect: async () => {
      await wait(1500);
      alert('Synced');
    },
  },
  { id: 'noop', label: 'Quick action', category: 'Workspace', onSelect: () => alert('Done') },
];

export default function AsyncCommand() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open palette</Button>
      <CommandPalette open={open} onOpenChange={setOpen} commands={COMMANDS} />
    </>
  );
}