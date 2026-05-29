import { useState } from 'react';
import { Button, CommandPalette } from '@apx-ui/ds';

const COMMANDS = [
  { id: 'new',    label: 'New Document', category: 'File', onSelect: () => undefined },
  { id: 'open',   label: 'Open',         category: 'File', onSelect: () => undefined },
  { id: 'save',   label: 'Save',         category: 'File', onSelect: () => undefined },
  { id: 'export', label: 'Export…',      category: 'File', onSelect: () => undefined },
  { id: 'help',   label: 'Help',         onSelect: () => undefined },
];

/**
 * "Recently used" surfacing — when the query is empty, the most-recent N commands appear in a
 * dedicated section above the categories. The palette tracks recents in-memory by default;
 * pass `recentCommandIds` from your own state store to persist across sessions.
 */
export default function RecentCommands() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open palette (use a few, re-open to see recents)</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={COMMANDS}
        maxRecentItems={3}
      />
    </>
  );
}
