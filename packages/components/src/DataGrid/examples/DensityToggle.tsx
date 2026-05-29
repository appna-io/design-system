import { DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'low' | 'med' | 'high';
  due: string;
}

const tasks: Task[] = [
  { id: 't-1', title: 'Triage inbox', assignee: 'Maya Singh', priority: 'high', due: '2026-05-25' },
  { id: 't-2', title: 'Ship docs site', assignee: 'Liam Cohen', priority: 'med', due: '2026-05-28' },
  { id: 't-3', title: 'Review PRs', assignee: 'Ava Goldberg', priority: 'low', due: '2026-05-30' },
  { id: 't-4', title: 'Customer call', assignee: 'Noah Park', priority: 'high', due: '2026-05-26' },
];

const columns: DataGridColumnDef<Task>[] = [
  { id: 'title', header: 'Title', accessor: 'title', type: 'text', sortable: true },
  { id: 'assignee', header: 'Assignee', accessor: 'assignee', type: 'text' },
  { id: 'priority', header: 'Priority', accessor: 'priority', type: 'text' },
  { id: 'due', header: 'Due', accessor: 'due', type: 'date' },
];

/**
 * The toolbar's density `<Select>` flips `state.density` between `compact` /
 * `standard` / `comfortable`. The recipe wires the choice to row + cell padding so
 * the layout reflows immediately — no reload needed.
 *
 * Pass `defaultDensity="compact"` to seed the initial density without controlling it.
 */
export default function DensityToggle() {
  return (
    <DataGrid<Task>
      data={tasks}
      columns={columns}
      getRowId={(t) => t.id}
      defaultDensity="standard"
    />
  );
}
