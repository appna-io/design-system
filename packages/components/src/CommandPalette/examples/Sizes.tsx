import { useState } from 'react';
import { Button, CommandPalette } from '@apx-ui/ds';
import type { CommandPaletteSize } from '@apx-ui/ds';

const COMMANDS = [
  { id: 'a', label: 'New Document', shortcut: '⌘N', category: 'File', onSelect: () => undefined },
  { id: 'b', label: 'Open',         shortcut: '⌘O', category: 'File', onSelect: () => undefined },
  { id: 'c', label: 'Save',         shortcut: '⌘S', category: 'File', onSelect: () => undefined },
];

const SIZES: CommandPaletteSize[] = ['sm', 'md', 'lg'];

export default function Sizes() {
  const [open, setOpen] = useState<CommandPaletteSize | null>(null);
  return (
    <div className="flex gap-2">
      {SIZES.map((s) => (
        <Button key={s} variant="outline" onClick={() => setOpen(s)}>
          {s}
        </Button>
      ))}
      <CommandPalette
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        commands={COMMANDS}
        size={open ?? 'md'}
      />
    </div>
  );
}
