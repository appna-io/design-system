import { TreeView } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

const data: TreeNodeData[] = [
  {
    id: 'a',
    label: 'Folder A',
    children: [
      { id: 'a/1', label: 'File 1' },
      { id: 'a/2', label: 'File 2' },
    ],
  },
  { id: 'b', label: 'Folder B', children: [{ id: 'b/1', label: 'File 3' }] },
];

export default function Sizes() {
  return (
    <div className="flex flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col gap-1">
          <span className="text-fg-muted text-xs uppercase tracking-wide">{size}</span>
          <div className="max-w-sm border border-border-subtle rounded-md p-2">
            <TreeView
              ariaLabel={`${size} tree`}
              data={data}
              defaultExpanded={['a', 'b']}
              size={size}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
