import { useState } from 'react';
import { Table } from 'apx-ds';
import type { TableColumn } from 'apx-ds';
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
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted text-sm">
        Click a row to &ldquo;open&rdquo; it. Opened: <code>{opened}</code>
      </p>
      <Table
        ariaLabel="Documents"
        columns={columns}
        data={data}
        getRowId={(d) => d.id}
        onRowClick={(d) => setOpened(d.title)}
        hoverable
      />
    </div>
  );
}
