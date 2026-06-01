import { useState } from 'react';
import { Div, TreeView, Typography } from '@apx-ui/ds';
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
    <Div display="flex" flexDirection="column" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        Selected: <code>{selected.join(', ') || 'none'}</code>
      </Typography>
      <Div className="max-w-sm rounded-md border border-border-subtle p-2">
        <TreeView
          ariaLabel="Categories"
          data={data}
          selectionMode="multiple"
          showCheckboxes
          defaultExpanded={['electronics', 'apparel']}
          selected={selected}
          onSelectedChange={(next) => setSelected(next as string[])}
        />
      </Div>
    </Div>
  );
}