import { useState } from 'react';
import { Button, CommandPalette } from 'apx-ds';
import type { CommandPaletteColor } from 'apx-ds';

const COMMANDS = [
  { id: 'a', label: 'Action A', onSelect: () => undefined },
  { id: 'b', label: 'Action B', onSelect: () => undefined },
  { id: 'c', label: 'Action C', onSelect: () => undefined },
];

const COLORS: CommandPaletteColor[] = ['primary', 'success', 'warning', 'danger', 'info', 'neutral'];

export default function Colors() {
  const [open, setOpen] = useState<CommandPaletteColor | null>(null);
  return (
    <div className="flex gap-2 flex-wrap">
      {COLORS.map((c) => (
        <Button key={c} variant="outline" color={c} onClick={() => setOpen(c)}>
          {c}
        </Button>
      ))}
      <CommandPalette
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        commands={COMMANDS}
        color={open ?? 'primary'}
      />
    </div>
  );
}
