import { useState } from 'react';
import { Button, Stack, Toolbar } from '@apx-ui/ds';

const ALL_ACTIONS = [
  'Save',
  'Save as',
  'Export',
  'Print',
  'Share',
  'Duplicate',
  'Move to trash',
];

export default function Overflow() {
  const [count, setCount] = useState(4);
  const shown = ALL_ACTIONS.slice(0, count);

  return (
    <Stack gap={3}>
      <p className="text-sm text-fg-muted">
        Add or remove items to see the toolbar collapse trailing actions into a popover.
      </p>
      <Stack direction="row" gap={2}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCount((n) => Math.max(1, n - 1))}
          disabled={count <= 1}
        >
          Remove item
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setCount((n) => Math.min(ALL_ACTIONS.length, n + 1))
          }
          disabled={count >= ALL_ACTIONS.length}
        >
          Add item
        </Button>
      </Stack>

      <div className="max-w-md">
        <Toolbar
          variant="bordered"
          overflow="menu"
          overflowLabel="More actions"
          aria-label="Document actions"
        >
          {shown.map((action) => (
            <Button key={action} variant="ghost">
              {action}
            </Button>
          ))}
        </Toolbar>
      </div>
    </Stack>
  );
}
