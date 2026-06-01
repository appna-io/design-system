import { Div, TreeView, Typography } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

const data: TreeNodeData[] = [
  {
    id: 'animals',
    label: 'Animals',
    children: [
      { id: 'animals/cats', label: 'Cats' },
      { id: 'animals/dogs', label: 'Dogs' },
      { id: 'animals/horses', label: 'Horses' },
    ],
  },
  {
    id: 'colors',
    label: 'Colors',
    children: [
      { id: 'colors/red', label: 'Red' },
      { id: 'colors/blue', label: 'Blue' },
      { id: 'colors/green', label: 'Green' },
    ],
  },
  {
    id: 'fruits',
    label: 'Fruits',
    children: [
      { id: 'fruits/apple', label: 'Apple' },
      { id: 'fruits/banana', label: 'Banana' },
      { id: 'fruits/cherry', label: 'Cherry' },
    ],
  },
];

export default function KeyboardDemo() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        Focus the tree and try: <code>↑ ↓</code> to move · <code>← →</code> to collapse/expand ·
        <code>Home</code> / <code>End</code> to jump · <code>*</code> to expand all siblings · type{' '}
        <code>c</code> then <code>o</code> to jump to a matching node.
      </Typography>
      <Div className="max-w-sm rounded-md border border-border-subtle p-2">
        <TreeView ariaLabel="Keyboard demo" data={data} defaultExpanded={['colors']} />
      </Div>
    </Div>
  );
}