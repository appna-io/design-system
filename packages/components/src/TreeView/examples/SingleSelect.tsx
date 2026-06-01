import { useState } from 'react';
import { Div, TreeView, Typography } from '@apx-ui/ds';
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
    <Div display="flex" flexDirection="column" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        Active folder: <code>{selected || 'none'}</code>
      </Typography>
      <Div className="max-w-sm rounded-md border border-border-subtle p-2">
        <TreeView
          ariaLabel="Mailbox"
          data={data}
          defaultExpanded={['inbox', 'sent']}
          selected={selected}
          onSelect={setSelected}
        />
      </Div>
    </Div>
  );
}