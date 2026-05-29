import { TreeView } from 'apx-ds';
import type { TreeNodeData } from 'apx-ds';

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
    <div className="max-w-sm border border-border-subtle rounded-md p-2">
      <TreeView ariaLabel="Workspace" data={data} defaultExpanded={['workspace']} />
    </div>
  );
}
