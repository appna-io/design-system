import { useState } from 'react';
import { TreeView } from '@apx-ui/ds';
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
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted text-sm">
        Group headers are focusable but not selectable. Active: <code>{selected}</code>
      </p>
      <div className="max-w-sm border border-border-subtle rounded-md p-2">
        <TreeView
          ariaLabel="Docs"
          data={data}
          defaultExpanded={['group-design', 'group-engineering']}
          selected={selected}
          onSelect={setSelected}
        />
      </div>
    </div>
  );
}
