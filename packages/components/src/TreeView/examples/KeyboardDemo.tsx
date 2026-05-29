import { TreeView } from '@apx-ui/ds';
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
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted text-sm">
        Focus the tree and try: <code>↑ ↓</code> to move \u00b7 <code>← →</code> to collapse/expand \u00b7
        <code>Home</code> / <code>End</code> to jump \u00b7 <code>*</code> to expand all siblings \u00b7 type{' '}
        <code>c</code> then <code>o</code> to jump to a matching node.
      </p>
      <div className="max-w-sm border border-border-subtle rounded-md p-2">
        <TreeView ariaLabel="Keyboard demo" data={data} defaultExpanded={['colors']} />
      </div>
    </div>
  );
}
