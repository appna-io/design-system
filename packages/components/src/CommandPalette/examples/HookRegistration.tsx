import { useState } from 'react';
import { Button, CommandPalette, Typography, useRegisterCommand } from '@apx-ui/ds';

/**
 * Hook-based registration — commands defined deep in the component tree flow into the palette
 * automatically. Register on mount, unregister on unmount. The store deduplicates by id, so
 * the same command can be re-registered safely (e.g. across hot-reload).
 */
function EditorToolbar() {
  useRegisterCommand({
    id: 'editor.bold',
    label: 'Bold',
    shortcut: '⌘B',
    category: 'Format',
    onSelect: () => alert('Bold toggled'),
  });
  useRegisterCommand({
    id: 'editor.italic',
    label: 'Italic',
    shortcut: '⌘I',
    category: 'Format',
    onSelect: () => alert('Italic toggled'),
  });
  return (
    <Typography variant="bodySmall" color="fg.muted">
      Open the palette — {'"Bold"'} + {'"Italic"'} are registered via hook.
    </Typography>
  );
}

export default function HookRegistration() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} className="mb-3">Open palette</Button>
      <EditorToolbar />
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}