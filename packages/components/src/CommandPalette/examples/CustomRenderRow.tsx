import { useState } from 'react';
import { Button, CommandPalette, highlightMatch, Kbd } from '@apx-ui/ds';

const COMMANDS = [
  { id: 'a', label: 'New Document', shortcut: '⌘N', category: 'File', description: 'Create an empty doc', onSelect: () => undefined },
  { id: 'b', label: 'Open File',    shortcut: '⌘O', category: 'File', description: 'Pick from disk',     onSelect: () => undefined },
  { id: 'c', label: 'Save',         shortcut: '⌘S', category: 'File', description: 'Write to disk',      onSelect: () => undefined },
];

/**
 * `renderCommand` lets you completely replace the row layout — useful for adding descriptions,
 * thumbnails, or alternative shortcut renderings. `highlightMatch` (re-exported from Combobox)
 * wraps matched query segments in `<mark>` for visual feedback.
 */
export default function CustomRenderRow() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open palette</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={COMMANDS}
        renderCommand={({ command, query }) => (
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{highlightMatch(command.label, query)}</div>
              {command.description ? (
                <div className="text-xs text-fg-muted truncate">{command.description}</div>
              ) : null}
            </div>
            {command.shortcut ? <Kbd size="sm">{command.shortcut}</Kbd> : null}
          </div>
        )}
      />
    </>
  );
}
