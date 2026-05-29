import { useState } from 'react';
import { Button, CommandPalette } from 'apx-ds';

const COMMANDS = [
  { id: 'new-doc', label: 'New Document', shortcut: '⌘N', category: 'File', onSelect: () => undefined },
  { id: 'open',    label: 'Open',         shortcut: '⌘O', category: 'File', keywords: ['load'], onSelect: () => undefined },
  { id: 'save',    label: 'Save',         shortcut: '⌘S', category: 'File', onSelect: () => undefined },
  { id: 'cut',     label: 'Cut',          shortcut: '⌘X', category: 'Edit', onSelect: () => undefined },
  { id: 'copy',    label: 'Copy',         shortcut: '⌘C', category: 'Edit', onSelect: () => undefined },
  { id: 'paste',   label: 'Paste',        shortcut: '⌘V', category: 'Edit', onSelect: () => undefined },
  { id: 'zoom-in', label: 'Zoom In',      shortcut: '⌘+', category: 'View', onSelect: () => undefined },
  { id: 'help',    label: 'Help',         onSelect: () => undefined },
];

export default function WithCategories() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open palette</Button>
      <CommandPalette open={open} onOpenChange={setOpen} commands={COMMANDS} />
    </>
  );
}
