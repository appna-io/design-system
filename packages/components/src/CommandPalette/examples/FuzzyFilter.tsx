import { useState } from 'react';
import { Button, CommandPalette } from 'apx-ds';

const COMMANDS = [
  { id: 'open-settings', label: 'Open Settings',  onSelect: () => undefined },
  { id: 'toggle-theme',  label: 'Toggle Theme',   onSelect: () => undefined },
  { id: 'restart-app',   label: 'Restart App',    onSelect: () => undefined },
  { id: 'export-doc',    label: 'Export Document', onSelect: () => undefined },
  { id: 'help',          label: 'Help & Feedback', onSelect: () => undefined },
];

/**
 * Fuzzy subsequence match — "ts" → "Toggle Settings", "rtap" → "Restart App". Built-in fuzzy
 * is intentionally simple (no scoring). For ranked / weighted fuzzy, pass `filterStrategy="custom"`
 * + a `filterCommand` that wraps your favorite matcher (Fuse.js, fzf, …).
 */
export default function FuzzyFilter() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open (try typing {'"tgthm"'} or {'"rtap"'})</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={COMMANDS}
        filterStrategy="fuzzy"
      />
    </>
  );
}
