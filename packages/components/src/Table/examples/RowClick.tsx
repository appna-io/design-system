import { useState } from 'react';
import { Div, Table, Typography } from '@apx-ui/ds';
import type { TableColumn } from '@apx-ui/ds';
interface Doc {
  id: string;
  title: string;
  type: string;
}

const data: Doc[] = [
  { id: 'd-1', title: 'Q1 Report', type: 'PDF' },
  { id: 'd-2', title: 'Roadmap', type: 'Doc' },
  { id: 'd-3', title: 'Brand Assets', type: 'Folder' },
];

const columns: TableColumn<Doc>[] = [
  { id: 'title', header: 'Title', accessor: (d) => d.title },
  { id: 'type', header: 'Type', accessor: (d) => d.type, align: 'end' },
];

export default function RowClick() {
  const [opened, setOpened] = useState<string>('none');
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        Click a row to &ldquo;open&rdquo; it. Opened: <code>{opened}</code>
      </Typography>
      <Table
        ariaLabel="Documents"
        columns={columns}
        data={data}
        getRowId={(d) => d.id}
        onRowClick={(d) => setOpened(d.title)}
        hoverable
      />
    </Div>
  );
}