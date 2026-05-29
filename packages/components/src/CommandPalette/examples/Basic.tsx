import { useState } from 'react';
import { Button, CommandPalette } from 'apx-ds';

const COMMANDS = [
  { id: 'new-doc', label: 'New Document', shortcut: '⌘N', category: 'File', onSelect: () => alert('New') },
  { id: 'open',    label: 'Open File',    shortcut: '⌘O', category: 'File', onSelect: () => alert('Open') },
  { id: 'save',    label: 'Save',         shortcut: '⌘S', category: 'File', onSelect: () => alert('Save') },
  { id: 'close',   label: 'Close Window', category: 'View',                  onSelect: () => alert('Close') },
];

export default function Basic() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open palette (⌘K)</Button>
      <CommandPalette open={open} onOpenChange={setOpen} commands={COMMANDS} />
    </>
  );
}
