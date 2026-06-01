import { useState } from 'react';
import { Button, CommandPalette, Div, highlightMatch, Kbd, Typography } from '@apx-ui/ds';

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
          <Div display="flex" alignItems="center" gap="3" className="w-full">
            <Div className="flex-1 min-w-0">
              <Typography weight="medium" className="truncate">
                {highlightMatch(command.label, query)}
              </Typography>
              {command.description ? (
                <Typography variant="caption" color="fg.muted" className="truncate">
                  {command.description}
                </Typography>
              ) : null}
            </Div>
            {command.shortcut ? <Kbd size="sm">{command.shortcut}</Kbd> : null}
          </Div>
        )}
      />
    </>
  );
}