import { DataGrid, Div, Typography } from '@apx-ui/ds';
import type { DataGridColumnDef, DataGridVariant } from '@apx-ui/ds';

interface Row {
  id: number;
  name: string;
  team: string;
  signups: number;
}

const data: Row[] = [
  { id: 1, name: 'Maya', team: 'Platform', signups: 124 },
  { id: 2, name: 'Liam', team: 'Growth', signups: 42 },
  { id: 3, name: 'Ava', team: 'Design', signups: 218 },
  { id: 4, name: 'Noah', team: 'Data', signups: 81 },
];

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
  { id: 'team', header: 'Team', accessor: 'team', type: 'text' },
  { id: 'signups', header: 'Signups', accessor: 'signups', type: 'number', align: 'end' },
];

const VARIANTS: DataGridVariant[] = ['solid', 'outline', 'striped', 'minimal'];

/**
 * Side-by-side comparison of the four chrome variants. The same data + columns are
 * rendered four times so the consumer can read the visual difference at a glance.
 */
export default function Variants() {
  return (
    <Div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {VARIANTS.map((variant) => (
        <Div key={variant} display="flex" flexDirection="column" gap="2">
          <Typography as="h3" variant="bodySmall" weight="semibold" color="fg.default" transform="capitalize">
            {variant}
          </Typography>
          <DataGrid<Row>
            data={data}
            columns={columns}
            getRowId={(r) => r.id}
            variant={variant}
            densityToggle={false}
            columnVisibilityToggle={false}
            exportable={false}
            globalSearch={false}
            defaultPagination={{ pageIndex: 0, pageSize: 0 }}
          />
        </Div>
      ))}
    </Div>
  );
}