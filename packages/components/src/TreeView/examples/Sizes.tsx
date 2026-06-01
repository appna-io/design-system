import { Div, TreeView, Typography } from '@apx-ui/ds';
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
    <Div display="flex" flexDirection="column" gap="4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Div key={size} display="flex" flexDirection="column" gap="1">
          <Typography variant="caption" color="fg.muted" className="uppercase tracking-wide">
            {size}
          </Typography>
          <Div className="max-w-sm rounded-md border border-border-subtle p-2">
            <TreeView
              ariaLabel={`${size} tree`}
              data={data}
              defaultExpanded={['a', 'b']}
              size={size}
            />
          </Div>
        </Div>
      ))}
    </Div>
  );
}