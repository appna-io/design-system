import { useState } from 'react';
import { Button, Div, TreeView, Typography } from '@apx-ui/ds';
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
    <Div display="flex" flexDirection="column" gap="2">
      <Div className="max-w-sm rounded-md border border-border-subtle p-2">
        <TreeView
          ariaLabel="Tag picker"
          data={data}
          selectionMode="multiple"
          showCheckboxes
          defaultExpanded={['docs', 'community']}
          selected={selected}
          onSelectedChange={(next) => setSelected(next as string[])}
        />
      </Div>
      <Div display="flex" alignItems="center" gap="2">
        <Button size="sm" onClick={() => setSubmitted(selected.join(', '))}>
          Apply tags
        </Button>
        <Typography variant="bodySmall" color="fg.muted">
          Applied: <code>{submitted || 'none'}</code>
        </Typography>
      </Div>
    </Div>
  );
}