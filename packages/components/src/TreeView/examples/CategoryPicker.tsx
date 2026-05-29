import { useState } from 'react';
import { Button, TreeView } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

const data: TreeNodeData[] = [
  {
    id: 'docs',
    label: 'Documentation',
    children: [
      { id: 'docs/guides', label: 'Guides' },
      { id: 'docs/api', label: 'API' },
      { id: 'docs/recipes', label: 'Recipes' },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    children: [
      { id: 'community/forum', label: 'Forum' },
      { id: 'community/discord', label: 'Discord' },
    ],
  },
];

export default function CategoryPicker() {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<string>('');
  return (
    <div className="flex flex-col gap-2">
      <div className="max-w-sm border border-border-subtle rounded-md p-2">
        <TreeView
          ariaLabel="Tag picker"
          data={data}
          selectionMode="multiple"
          showCheckboxes
          defaultExpanded={['docs', 'community']}
          selected={selected}
          onSelectedChange={(next) => setSelected(next as string[])}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setSubmitted(selected.join(', '))}>
          Apply tags
        </Button>
        <span className="text-fg-muted text-sm">
          Applied: <code>{submitted || 'none'}</code>
        </span>
      </div>
    </div>
  );
}
