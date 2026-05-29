import { TreeView } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

const seed: TreeNodeData[] = [
  { id: 'root', label: 'Cloud Drive', hasChildren: true },
];

const fakeServer: Record<string, TreeNodeData[]> = {
  root: [
    { id: 'projects', label: 'Projects', hasChildren: true },
    { id: 'archive', label: 'Archive', hasChildren: true },
  ],
  projects: [
    { id: 'projects/2024', label: '2024' },
    { id: 'projects/2025', label: '2025' },
  ],
  archive: [
    { id: 'archive/2022', label: '2022' },
    { id: 'archive/2023', label: '2023' },
  ],
};

const loadChildren = (node: TreeNodeData) =>
  new Promise<TreeNodeData[]>((resolve) =>
    setTimeout(() => resolve(fakeServer[node.id] ?? []), 600),
  );

export default function AsyncLoad() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted text-sm">
        Click a folder once to lazy-load its children with a simulated 600ms latency.
      </p>
      <div className="max-w-sm border border-border-subtle rounded-md p-2">
        <TreeView ariaLabel="Cloud drive" data={seed} loadChildren={loadChildren} />
      </div>
    </div>
  );
}
