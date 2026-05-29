import { useState } from 'react';
import { Button, TreeView } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

const data: TreeNodeData[] = [
  {
    id: 'docs',
    label: 'docs',
    children: [
      { id: 'docs/intro.md', label: 'intro.md' },
      { id: 'docs/api.md', label: 'api.md' },
    ],
  },
  {
    id: 'tests',
    label: 'tests',
    children: [
      { id: 'tests/unit.ts', label: 'unit.ts' },
      { id: 'tests/e2e.ts', label: 'e2e.ts' },
    ],
  },
];

const allBranchIds = ['docs', 'tests'];

export default function ControlledExpansion() {
  const [expanded, setExpanded] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setExpanded(allBranchIds)}>
          Expand all
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setExpanded([])}>
          Collapse all
        </Button>
      </div>
      <div className="max-w-sm border border-border-subtle rounded-md p-2">
        <TreeView
          ariaLabel="Controlled expansion"
          data={data}
          expanded={expanded}
          onExpandedChange={setExpanded}
        />
      </div>
    </div>
  );
}
