import { useEffect, useMemo, useState } from 'react';

import { DataGrid } from 'apx-ds';
import type {
  DataGridColumnDef,
  DataGridColumnFiltersState,
  DataGridPaginationState,
  DataGridSortDescriptor,
} from 'apx-ds';

interface ApiRow {
  id: number;
  ticket: string;
  owner: string;
  priority: 'low' | 'med' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  createdAt: string;
}

const TOTAL_ROWS = 1_273;

/* Synthetic data source the "server" pretends to query. Generated once. */
const ALL_ROWS: ApiRow[] = Array.from({ length: TOTAL_ROWS }, (_, i) => {
  const prios: ApiRow['priority'][] = ['low', 'med', 'high', 'urgent'];
  const statuses: ApiRow['status'][] = ['open', 'pending', 'resolved', 'closed'];
  return {
    id: i + 1,
    ticket: `TKT-${String(i + 1).padStart(4, '0')}`,
    owner: ['Maya', 'Liam', 'Ava', 'Noah', 'Sara', 'Eitan'][i % 6] as string,
    priority: prios[i % prios.length] as ApiRow['priority'],
    status: statuses[i % statuses.length] as ApiRow['status'],
    createdAt: new Date(2026, 0, 1 + (i % 365)).toISOString().slice(0, 10),
  };
});

/* Pretend network latency so the demo shows a believable loading state. */
async function fetchPage(query: {
  sort: DataGridSortDescriptor[];
  filters: DataGridColumnFiltersState;
  globalSearch: string;
  pagination: DataGridPaginationState;
}): Promise<{ rows: ApiRow[]; total: number }> {
  await new Promise((r) => setTimeout(r, 280));

  let rows = ALL_ROWS;
  // Global search across every text column.
  const needle = query.globalSearch.trim().toLowerCase();
  if (needle) {
    rows = rows.filter((r) =>
      [r.ticket, r.owner, r.priority, r.status].some((s) => s.toLowerCase().includes(needle)),
    );
  }
  // Per-column filters — only `equals` to keep the demo tight.
  for (const [columnId, filter] of Object.entries(query.filters)) {
    if (!filter) continue;
    rows = rows.filter((r) => String(r[columnId as keyof ApiRow]) === String(filter.value));
  }
  // Single-column sort, server-side.
  const [s] = query.sort;
  if (s) {
    const dir = s.direction === 'desc' ? -1 : 1;
    rows = [...rows].sort((a, b) => {
      const av = a[s.id as keyof ApiRow] as string | number;
      const bv = b[s.id as keyof ApiRow] as string | number;
      return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
    });
  }
  const total = rows.length;
  const pagination = query.pagination as { pageIndex: number; pageSize: number };
  const start = pagination.pageIndex * pagination.pageSize;
  return { rows: rows.slice(start, start + pagination.pageSize), total };
}

const columns: DataGridColumnDef<ApiRow>[] = [
  { id: 'ticket', header: 'Ticket', accessor: 'ticket', sortable: true, type: 'text' },
  { id: 'owner', header: 'Owner', accessor: 'owner', sortable: true, type: 'text', filterable: true },
  { id: 'priority', header: 'Priority', accessor: 'priority', sortable: true, type: 'text', filterable: true },
  { id: 'status', header: 'Status', accessor: 'status', sortable: true, type: 'text', filterable: true },
  { id: 'createdAt', header: 'Created', accessor: 'createdAt', sortable: true, type: 'date' },
];

/**
 * Demonstrates the server-driven mode. The consumer owns the query and the data
 * array — every `manual*` flag is on so the grid never touches the rows itself.
 * `rowCount` tells the pagination subpart the true total so "Page X of Y" + the
 * "of N" label stay accurate even though `data` only holds the current page.
 */
export default function ServerSide() {
  const [sort, setSort] = useState<DataGridSortDescriptor[]>([
    { id: 'createdAt', direction: 'desc' },
  ]);
  const [filters, setFilters] = useState<DataGridColumnFiltersState>({});
  const [globalSearch, setGlobalSearch] = useState('');
  const [pagination, setPagination] = useState<DataGridPaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const query = useMemo(
    () => ({ sort, filters, globalSearch, pagination }),
    [sort, filters, globalSearch, pagination],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPage(query).then(({ rows: page, total: t }) => {
      if (cancelled) return;
      setRows(page);
      setTotal(t);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted text-sm">
        Server-side mode: every interaction (sort, filter, search, page) round-trips through{' '}
        <code>fetchPage()</code>. The grid uses <code>rowCount</code> + the <code>manual*</code> flags
        to skip its own derivations and trust the consumer&apos;s data.
      </p>
      <DataGrid<ApiRow>
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        rowCount={total}
        manualSort
        manualFiltering
        manualPagination
        loading={loading}
        defaultSort={[{ id: 'createdAt', direction: 'desc' }]}
        state={{ sort, filters, globalSearch, pagination } as never}
        onStateChange={(next) => {
          setSort(next.sort);
          setFilters(next.filters);
          setGlobalSearch(next.globalSearch);
          setPagination(next.pagination);
        }}
      />
    </div>
  );
}
