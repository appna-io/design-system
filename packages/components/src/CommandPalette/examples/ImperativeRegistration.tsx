import { useEffect, useState } from 'react';
import { Button, CommandPalette, commands, Div, palette } from '@apx-ui/ds';

/**
 * Imperative module-level API. Works from anywhere in the app — a Zustand action, a fetch
 * interceptor, a service-worker callback. `commands.register()` returns an `unregister`
 * function for symmetry with `addEventListener`-style APIs.
 */
export default function ImperativeRegistration() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unregister = commands.registerMany([
      { id: 'sync', label: 'Sync workspace', category: 'Workspace', onSelect: () => alert('Syncing…') },
      { id: 'reset', label: 'Reset cache',    category: 'Workspace', onSelect: () => alert('Cache reset') },
    ]);
    return unregister;
  }, []);

  return (
    <Div display="flex" gap="2">
      <Button onClick={() => setOpen(true)}>Open via state</Button>
      <Button variant="ghost" onClick={() => palette.open()}>palette.open()</Button>
      <Button variant="ghost" onClick={() => palette.toggle()}>palette.toggle()</Button>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </Div>
  );
}