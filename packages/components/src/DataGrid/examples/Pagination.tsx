import { useMemo } from 'react';
import { DataGrid } from 'apx-ds';
import type { DataGridColumnDef } from 'apx-ds';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

function generate(count: number): LogEntry[] {
  const levels: LogEntry['level'][] = ['info', 'warn', 'error'];
  return Array.from({ length: count }, (_, i) => ({
    id: `log-${i + 1}`,
    timestamp: `2026-05-24T16:${String(i % 60).padStart(2, '0')}:00`,
    level: levels[i % 3] as LogEntry['level'],
    message: `Event #${i + 1} — request handled successfully`,
  }));
}

const columns: DataGridColumnDef<LogEntry>[] = [
  { id: 'timestamp', header: 'Timestamp', accessor: 'timestamp', type: 'text', sortable: true },
  { id: 'level', header: 'Level', accessor: 'level', type: 'text' },
  { id: 'message', header: 'Message', accessor: 'message', type: 'text' },
];

/**
 * Generates a 200-row log fixture so pagination has something to chew on. The
 * bottom-anchored toolbar carries the page-size `<Select>`, a `X–Y of N` label, and
 * first/prev/next/last buttons.
 *
 *  - Pass `defaultPagination={{ pageIndex: 0, pageSize: 0 }}` to render every row at
 *    once (hides the pagination bar entirely).
 *  - Pass `defaultPagination={{ cursor: null, pageSize: 25 }}` to enter cursor mode —
 *    the bar hides the "X of Y" label and the first/last buttons.
 */
export default function Pagination() {
  const rows = useMemo(() => generate(200), []);
  return (
    <DataGrid<LogEntry>
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      defaultPagination={{ pageIndex: 0, pageSize: 25 }}
    />
  );
}
