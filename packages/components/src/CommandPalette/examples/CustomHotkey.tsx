import { useState } from 'react';
import { Button, CommandPalette } from '@apx-ui/ds';

const COMMANDS = [
  { id: 'a', label: 'Action A', onSelect: () => undefined },
  { id: 'b', label: 'Action B', onSelect: () => undefined },
];

/**
 * Override the default `$mod+K` global shortcut. `$mod` resolves to Cmd on macOS and Ctrl
 * elsewhere — pass an explicit name (`Ctrl+P`, `Cmd+/`) to lock it to a single platform.
 */
export default function CustomHotkey() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open via button (or press Ctrl+P)</Button>
      <CommandPalette open={open} onOpenChange={setOpen} commands={COMMANDS} hotkey="Ctrl+P" />
    </>
  );
}
