import { Div, TreeView } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

const data: TreeNodeData[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    children: [
      { id: 'workspace/admin', label: 'Admin tools', disabled: true },
      { id: 'workspace/reports', label: 'Reports' },
      { id: 'workspace/insights', label: 'Insights (coming soon)', disabled: true },
    ],
  },
];

export default function DisabledNodes() {
  return (
    <Div className="max-w-sm rounded-md border border-border-subtle p-2">
      <TreeView ariaLabel="Workspace" data={data} defaultExpanded={['workspace']} />
    </Div>
  );
}