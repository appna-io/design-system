import { useState } from 'react';
import { TreeView } from '@apx-ui/ds';
import type { TreeNodeData } from '@apx-ui/ds';

const data: TreeNodeData[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    children: [
      { id: 'inbox/today', label: 'Today' },
      { id: 'inbox/this-week', label: 'This week' },
      { id: 'inbox/older', label: 'Older' },
    ],
  },
  {
    id: 'sent',
    label: 'Sent',
    children: [
      { id: 'sent/this-week', label: 'This week' },
      { id: 'sent/archived', label: 'Archived' },
    ],
  },
];

export default function SingleSelect() {
  const [selected, setSelected] = useState<string>('inbox/today');
  return (
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted text-sm">
        Active folder: <code>{selected || 'none'}</code>
      </p>
      <div className="max-w-sm border border-border-subtle rounded-md p-2">
        <TreeView
          ariaLabel="Mailbox"
          data={data}
          defaultExpanded={['inbox', 'sent']}
          selected={selected}
          onSelect={setSelected}
        />
      </div>
    </div>
  );
}
