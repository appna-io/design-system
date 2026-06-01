import { useState } from 'react';
import { Button, CommandPalette, Div, Typography } from '@apx-ui/ds';

const COMMANDS = [
  { id: 'open-file', label: 'Open File', shortcut: '⌘O', category: 'File', onSelect: () => undefined },
  { id: 'new-doc', label: 'New Document', shortcut: '⌘N', category: 'File', onSelect: () => undefined },
  { id: 'switch-theme', label: 'Switch Theme', shortcut: '⌘T', category: 'View', onSelect: () => undefined },
  { id: 'go-settings', label: 'Go to Settings', category: 'Navigation', onSelect: () => undefined },
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', shortcut: '⌘B', category: 'View', onSelect: () => undefined },
];

/**
 * Quick-review demo of `<CommandPalette />` — a trigger button plus an open palette
 * with realistic file, view, and navigation commands surfaced by category.
 */
export default function Overview() {
  const [open, setOpen] = useState(true);

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Button onClick={() => setOpen(true)}>Open command palette</Button>
      <Typography variant="bodySmall" color="fg.muted">
        Search app-wide actions with <kbd>⌘K</kbd> — filter by name, jump with arrow keys, press Enter to run.
      </Typography>
      <CommandPalette open={open} onOpenChange={setOpen} commands={COMMANDS} />
    </Div>
  );
}