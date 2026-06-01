import { useState } from 'react';
import { Button, CommandPalette, Div } from '@apx-ui/ds';
import type { CommandPaletteVariant } from '@apx-ui/ds';

const COMMANDS = [
  { id: 'a', label: 'New Document', shortcut: '⌘N', category: 'File', onSelect: () => undefined },
  { id: 'b', label: 'Open',         shortcut: '⌘O', category: 'File', onSelect: () => undefined },
  { id: 'c', label: 'Save',         shortcut: '⌘S', category: 'File', onSelect: () => undefined },
];

const VARIANTS: CommandPaletteVariant[] = ['solid', 'soft', 'minimal'];

export default function Variants() {
  const [open, setOpen] = useState<CommandPaletteVariant | null>(null);
  return (
    <Div display="flex" gap="2">
      {VARIANTS.map((v) => (
        <Button key={v} variant="outline" onClick={() => setOpen(v)}>
          {v}
        </Button>
      ))}
      <CommandPalette
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        commands={COMMANDS}
        variant={open ?? 'solid'}
      />
    </Div>
  );
}