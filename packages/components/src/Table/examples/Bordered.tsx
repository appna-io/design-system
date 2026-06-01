import { Table } from '@apx-ui/ds';
import type { TableColumn } from '@apx-ui/ds';

interface Row {
  id: string;
  metric: string;
  value: string;
}

const data: Row[] = [
  { id: '1', metric: 'MRR', value: '$84,210' },
  { id: '2', metric: 'Active accounts', value: '1,204' },
  { id: '3', metric: 'Churn', value: '2.1%' },
];

const columns: TableColumn<Row>[] = [
  { id: 'metric', header: 'Metric', accessor: (r) => r.metric },
  { id: 'value', header: 'Value', accessor: (r) => r.value, align: 'end' },
];

export default function Bordered() {
  return (
    <Table
      ariaLabel="Bordered table"
      columns={columns}
      data={data}
      getRowId={(r) => r.id}
      bordered
      hoverable
    />
  );
}