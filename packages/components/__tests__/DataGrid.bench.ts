/**
 * PR 8 — Performance benchmark suite for the DataGrid headless pipeline.
 *
 * Run with `pnpm --filter @apx-ui/components bench` (or `pnpm bench`
 * from the workspace root with the appropriate filter). Output is the
 * `vitest bench` table with median / mean / margin of error per case.
 *
 * Scope: the *pure* derivation pipeline (filter → sort → paginate), the
 * column-visibility helper, and the aggregator helper. We deliberately
 * do **not** benchmark React renders here — `vitest bench` runs in Node,
 * and meaningful render benchmarks need a real browser profiler. The
 * renderer's `Virtualized.tsx` example doubles as the human-visible smoke
 * test for the render path; for a structured browser bench, set up
 * Playwright + the React profiler in a follow-up (out of scope for PR 8).
 *
 * The reference dataset is a synthetic 10k-row table — small enough to
 * run in <100 ms per case on a modern laptop, large enough that an O(n²)
 * regression in any derivation would surface immediately. The 50k-row
 * "stress" cases mirror the renderer's `Virtualized.tsx` example so a
 * regression there gets caught by the bench before the user sees jank.
 */

import { bench, describe } from 'vitest';

import type {
  ColumnAggregation,
  ColumnDef,
  ColumnFiltersState,
  Row as DataGridRow,
  SortDescriptor,
} from '../src/DataGrid';
import {
  deriveFilteredRows,
  derivePaginatedRows,
  deriveSortedRows,
  deriveVisibleColumns,
  runColumnAggregations,
} from '../src/DataGrid';

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                   */
/* -------------------------------------------------------------------------- */

interface Person {
  id: number;
  name: string;
  email: string;
  team: 'platform' | 'growth' | 'design' | 'data' | 'ops';
  signups: number;
  active: boolean;
  lastSeen: string;
}

const TEAMS = ['platform', 'growth', 'design', 'data', 'ops'] as const;

function buildRows(count: number): DataGridRow<Person>[] {
  // Deterministic — bench runs need stable input across iterations.
  const rows: DataGridRow<Person>[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const original: Person = {
      id: i,
      name: `Person ${i.toString().padStart(5, '0')}`,
      email: `person${i}@example.com`,
      team: TEAMS[i % TEAMS.length]!,
      signups: (i * 37) % 1000,
      active: i % 3 === 0,
      lastSeen: new Date(2024, 0, 1 + (i % 365)).toISOString(),
    };
    rows[i] = { id: i, index: i, original };
  }
  return rows;
}

const aggregations: ColumnAggregation<Person>[] = ['sum', 'avg', 'max'];

const columns: ColumnDef<Person>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, type: 'text', filterable: true },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text', filterable: true },
  { id: 'team', header: 'Team', accessor: 'team', sortable: true, type: 'text', filterable: true },
  {
    id: 'signups',
    header: 'Signups',
    accessor: 'signups',
    sortable: true,
    type: 'number',
    align: 'end',
    filterable: true,
    aggregations,
  },
  {
    id: 'active',
    header: 'Active',
    accessor: 'active',
    sortable: true,
    type: 'boolean',
    filterable: true,
  },
  {
    id: 'lastSeen',
    header: 'Last seen',
    accessor: 'lastSeen',
    sortable: true,
    type: 'date',
    filterable: true,
  },
];

const ROWS_10K = buildRows(10_000);
const ROWS_50K = buildRows(50_000);

const COLLATOR_EN = new Intl.Collator('en');

const SORT_NUMERIC: SortDescriptor[] = [{ id: 'signups', direction: 'desc' }];
const SORT_TEXT: SortDescriptor[] = [{ id: 'name', direction: 'asc' }];
const SORT_COMPOUND: SortDescriptor[] = [
  { id: 'team', direction: 'asc' },
  { id: 'signups', direction: 'desc' },
];

const FILTER_TEXT: ColumnFiltersState = {
  name: { operator: 'contains', value: 'Person 00' },
};
const FILTER_COMPOUND: ColumnFiltersState = {
  team: { operator: 'equals', value: 'platform' },
  active: { operator: 'isTrue', value: null },
  signups: { operator: 'gte', value: 500 },
};

/* -------------------------------------------------------------------------- */
/*  Sort                                                                       */
/* -------------------------------------------------------------------------- */

describe('DataGrid pipeline — sort', () => {
  bench('sort 10k rows by numeric column (desc)', () => {
    deriveSortedRows({ rows: ROWS_10K, columns, sort: SORT_NUMERIC, collator: COLLATOR_EN });
  });

  bench('sort 10k rows by text column (asc, Intl.Collator)', () => {
    deriveSortedRows({ rows: ROWS_10K, columns, sort: SORT_TEXT, collator: COLLATOR_EN });
  });

  bench('sort 10k rows by compound 2-key sort (team asc, signups desc)', () => {
    deriveSortedRows({ rows: ROWS_10K, columns, sort: SORT_COMPOUND, collator: COLLATOR_EN });
  });

  bench('sort 50k rows by numeric column (desc) — virtualization stress', () => {
    deriveSortedRows({ rows: ROWS_50K, columns, sort: SORT_NUMERIC, collator: COLLATOR_EN });
  });
});

/* -------------------------------------------------------------------------- */
/*  Filter                                                                     */
/* -------------------------------------------------------------------------- */

describe('DataGrid pipeline — filter', () => {
  bench('filter 10k rows by single text-contains', () => {
    deriveFilteredRows({ rows: ROWS_10K, columns, filters: FILTER_TEXT, globalSearch: '' });
  });

  bench('filter 10k rows by 3-predicate compound (equals + isTrue + gte)', () => {
    deriveFilteredRows({ rows: ROWS_10K, columns, filters: FILTER_COMPOUND, globalSearch: '' });
  });

  bench('filter 10k rows by global-search across every text/number column', () => {
    deriveFilteredRows({ rows: ROWS_10K, columns, filters: {}, globalSearch: 'person 000' });
  });

  bench('filter 50k rows by 3-predicate compound — virtualization stress', () => {
    deriveFilteredRows({ rows: ROWS_50K, columns, filters: FILTER_COMPOUND, globalSearch: '' });
  });
});

/* -------------------------------------------------------------------------- */
/*  Paginate                                                                   */
/* -------------------------------------------------------------------------- */

describe('DataGrid pipeline — paginate', () => {
  bench('paginate 10k rows → page 0, size 50', () => {
    derivePaginatedRows({ rows: ROWS_10K, pagination: { pageIndex: 0, pageSize: 50 } });
  });

  bench('paginate 10k rows → page 99, size 100 (last page)', () => {
    derivePaginatedRows({ rows: ROWS_10K, pagination: { pageIndex: 99, pageSize: 100 } });
  });
});

/* -------------------------------------------------------------------------- */
/*  End-to-end pipeline                                                        */
/* -------------------------------------------------------------------------- */

describe('DataGrid pipeline — full filter + sort + paginate', () => {
  bench('10k rows → compound filter → compound sort → page 0/25', () => {
    const filtered = deriveFilteredRows({
      rows: ROWS_10K,
      columns,
      filters: FILTER_COMPOUND,
      globalSearch: '',
    });
    const sorted = deriveSortedRows({
      rows: filtered,
      columns,
      sort: SORT_COMPOUND,
      collator: COLLATOR_EN,
    });
    derivePaginatedRows({ rows: sorted, pagination: { pageIndex: 0, pageSize: 25 } });
  });

  bench('50k rows → single-text filter → numeric sort → page 0/100', () => {
    const filtered = deriveFilteredRows({
      rows: ROWS_50K,
      columns,
      filters: FILTER_TEXT,
      globalSearch: '',
    });
    const sorted = deriveSortedRows({
      rows: filtered,
      columns,
      sort: SORT_NUMERIC,
      collator: COLLATOR_EN,
    });
    derivePaginatedRows({ rows: sorted, pagination: { pageIndex: 0, pageSize: 100 } });
  });
});

/* -------------------------------------------------------------------------- */
/*  Column helpers                                                             */
/* -------------------------------------------------------------------------- */

describe('DataGrid column helpers', () => {
  // Visibility derivation is hot — it runs on every grid render whenever the
  // user toggles a column from the visibility menu or the responsive bridge
  // hides one. A regression here ripples into every cell render.
  bench('deriveVisibleColumns over 50-column schema', () => {
    const wideColumns: ColumnDef<Person>[] = new Array(50).fill(null).map((_, i) => ({
      id: `col${i}`,
      header: `Column ${i}`,
      accessor: 'name',
      type: 'text',
    }));
    deriveVisibleColumns(wideColumns, {});
  });
});

/* -------------------------------------------------------------------------- */
/*  Aggregations                                                               */
/* -------------------------------------------------------------------------- */

describe('DataGrid aggregations', () => {
  const signupsColumn = columns.find((c) => c.id === 'signups')!;

  bench('runColumnAggregations sum+avg+max over 10k rows', () => {
    runColumnAggregations(signupsColumn, ROWS_10K);
  });

  bench('runColumnAggregations sum+avg+max over 50k rows', () => {
    runColumnAggregations(signupsColumn, ROWS_50K);
  });
});
