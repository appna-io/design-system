import { useState } from 'react';
import { TreeView } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

const data: TreeNodeData[] = [
  {
    id: 'electronics',
    label: 'Electronics',
    children: [
      { id: 'electronics/laptops', label: 'Laptops' },
      { id: 'electronics/phones', label: 'Phones' },
      { id: 'electronics/tablets', label: 'Tablets' },
    ],
  },
  {
    id: 'apparel',
    label: 'Apparel',
    children: [
      { id: 'apparel/mens', label: "Men's" },
      { id: 'apparel/womens', label: "Women's" },
    ],
  },
];

export default function MultiSelectCheckboxes() {
  const [selected, setSelected] = useState<string[]>(['electronics/laptops']);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted text-sm">
        Selected: <code>{selected.join(', ') || 'none'}</code>
      </p>
      <div className="max-w-sm border border-border-subtle rounded-md p-2">
        <TreeView
          ariaLabel="Categories"
          data={data}
          selectionMode="multiple"
          showCheckboxes
          defaultExpanded={['electronics', 'apparel']}
          selected={selected}
          onSelectedChange={(next) => setSelected(next as string[])}
        />
      </div>
    </div>
  );
}
