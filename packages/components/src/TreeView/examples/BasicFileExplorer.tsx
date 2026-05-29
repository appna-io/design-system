import { TreeView } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

const data: TreeNodeData[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'src/components',
        label: 'components',
        children: [
          { id: 'src/components/Button.tsx', label: 'Button.tsx' },
          { id: 'src/components/Input.tsx', label: 'Input.tsx' },
          { id: 'src/components/Modal.tsx', label: 'Modal.tsx' },
        ],
      },
      {
        id: 'src/lib',
        label: 'lib',
        children: [
          { id: 'src/lib/api.ts', label: 'api.ts' },
          { id: 'src/lib/utils.ts', label: 'utils.ts' },
        ],
      },
      { id: 'src/index.ts', label: 'index.ts' },
    ],
  },
  { id: 'package.json', label: 'package.json' },
  { id: 'README.md', label: 'README.md' },
];

export default function BasicFileExplorer() {
  return (
    <div className="max-w-sm border border-border-subtle rounded-md p-2">
      <TreeView ariaLabel="Project files" data={data} defaultExpanded={['src', 'src/components']} />
    </div>
  );
}
