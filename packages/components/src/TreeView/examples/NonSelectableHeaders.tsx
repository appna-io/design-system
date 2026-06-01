import { useState } from 'react';
import { Div, TreeView, Typography } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

const data: TreeNodeData[] = [
  {
    id: 'group-design',
    label: 'Design',
    selectable: false,
    children: [
      { id: 'design/colors', label: 'Colors' },
      { id: 'design/type', label: 'Typography' },
    ],
  },
  {
    id: 'group-engineering',
    label: 'Engineering',
    selectable: false,
    children: [
      { id: 'eng/api', label: 'API reference' },
      { id: 'eng/sdk', label: 'SDK guide' },
    ],
  },
];

export default function NonSelectableHeaders() {
  const [selected, setSelected] = useState<string>('design/colors');
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        Group headers are focusable but not selectable. Active: <code>{selected}</code>
      </Typography>
      <Div className="max-w-sm rounded-md border border-border-subtle p-2">
        <TreeView
          ariaLabel="Docs"
          data={data}
          defaultExpanded={['group-design', 'group-engineering']}
          selected={selected}
          onSelect={setSelected}
        />
      </Div>
    </Div>
  );
}