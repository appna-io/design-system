/**
 * Pure JS tests for the DataGrid headless layer — no React, no DOM, no theme.
 *
 * Covers:
 *  - all 12 slice reducers (invariants, idempotency, no aliasing),
 *  - the 6 derivations (filter/sort/paginate, column order/visibility/pinning),
 *  - the filter engine (every operator across every column type),
 *  - the comparator (locale-aware, missing values, numeric collation),
 *  - the CSV / JSON exporters (escaping, header inclusion, Date serialisation).
 */

import { describe, expect, it } from 'vitest';

import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
} from '../src/DataGrid';
import {
  applyOperator,
  compareValues,
  deriveColumnOrder,
  deriveFilteredRows,
  derivePaginatedRows,
  derivePinnedColumns,
  deriveSortedRows,
  deriveVisibleColumns,
  exportCsv,
  exportJson,
  getCellValue,
} from '../src/DataGrid';
import {
  columnOrderReducer,
  type ColumnOrderAction,
} from '../src/DataGrid/headless/reducers/columnOrder';
import {
  columnPinningReducer,
  initialColumnPinningState,
} from '../src/DataGrid/headless/reducers/columnPinning';
import {
  columnSizeReducer,
} from '../src/DataGrid/headless/reducers/columnSize';
import {
  columnVisibilityReducer,
} from '../src/DataGrid/headless/reducers/columnVisibility';
import { densityReducer } from '../src/DataGrid/headless/reducers/density';
import {
  editingReducer,
} from '../src/DataGrid/headless/reducers/editing';
import {
  expansionReducer,
} from '../src/DataGrid/headless/reducers/expansion';
import { filterReducer } from '../src/DataGrid/headless/reducers/filter';
import {
  globalSearchReducer,
} from '../src/DataGrid/headless/reducers/globalSearch';
import {
  initialPaginationState,
  isCursorPagination,
  paginationReducer,
} from '../src/DataGrid/headless/reducers/pagination';
import {
  idsBetween,
  initialSelectionState,
  selectionReducer,
} from '../src/DataGrid/headless/reducers/selection';
import {
  initialSortState,
  sortReducer,
} from '../src/DataGrid/headless/reducers/sort';

/* -------------------------------------------------------------------------- */
/*  Fixture                                                                    */
/* -------------------------------------------------------------------------- */

interface User {
  id: string;
  name: string;
  age: number;
  role: 'admin' | 'editor' | 'viewer';
  active: boolean;
  joined: Date;
  notes: string | null;
}

const users: User[] = [
  { id: 'u1', name: 'Alice',   age: 30, role: 'admin',  active: true,  joined: new Date('2024-01-15'), notes: 'founder' },
  { id: 'u2', name: 'Bob',     age: 22, role: 'editor', active: false, joined: new Date('2023-06-01'), notes: null },
  { id: 'u3', name: 'Charlie', age: 35, role: 'viewer', active: true,  joined: new Date('2025-02-10'), notes: '' },
  { id: 'u4', name: 'Dana',    age: 28, role: 'editor', active: true,  joined: new Date('2024-11-30'), notes: 'beta' },
];

const userRows: Row<User>[] = users.map((u, index) => ({ id: u.id, index, original: u }));

const columns: ColumnDef<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, filterable: true, type: 'text' },
  { id: 'age', header: 'Age', accessor: 'age', sortable: true, filterable: true, type: 'number' },
  {
    id: 'role',
    header: 'Role',
    accessor: 'role',
    filterable: true,
    type: 'select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ],
  },
  { id: 'active', header: 'Active', accessor: 'active', filterable: true, type: 'boolean' },
  { id: 'joined', header: 'Joined', accessor: 'joined', sortable: true, filterable: true, type: 'date' },
  { id: 'notes', header: 'Notes', accessor: 'notes', filterable: true, type: 'text' },
];

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

/* -------------------------------------------------------------------------- */
/*  Reducers — sort                                                            */
/* -------------------------------------------------------------------------- */

describe('sortReducer', () => {
  it('starts empty', () => {
    expect(initialSortState).toEqual([]);
  });

  it('cycle: none → asc → desc → none (single column)', () => {
    let state = sortReducer([], { type: 'cycle', id: 'name', multi: false, removable: true });
    expect(state).toEqual([{ id: 'name', direction: 'asc' }]);
    state = sortReducer(state, { type: 'cycle', id: 'name', multi: false, removable: true });
    expect(state).toEqual([{ id: 'name', direction: 'desc' }]);
    state = sortReducer(state, { type: 'cycle', id: 'name', multi: false, removable: true });
    expect(state).toEqual([]);
  });

  it('cycle without removable: asc → desc → asc (never empties)', () => {
    let state = sortReducer([], { type: 'cycle', id: 'name', multi: false, removable: false });
    state = sortReducer(state, { type: 'cycle', id: 'name', multi: false, removable: false });
    state = sortReducer(state, { type: 'cycle', id: 'name', multi: false, removable: false });
    expect(state).toEqual([{ id: 'name', direction: 'asc' }]);
  });

  it('cycle multi: stacks columns and updates direction in place', () => {
    let state = sortReducer([], { type: 'cycle', id: 'name', multi: false, removable: true });
    state = sortReducer(state, { type: 'cycle', id: 'age', multi: true, removable: true });
    expect(state).toEqual([
      { id: 'name', direction: 'asc' },
      { id: 'age', direction: 'asc' },
    ]);
    state = sortReducer(state, { type: 'cycle', id: 'age', multi: true, removable: true });
    expect(state).toEqual([
      { id: 'name', direction: 'asc' },
      { id: 'age', direction: 'desc' },
    ]);
    state = sortReducer(state, { type: 'cycle', id: 'age', multi: true, removable: true });
    expect(state).toEqual([{ id: 'name', direction: 'asc' }]);
  });

  it('set replaces the stack', () => {
    const state = sortReducer([{ id: 'name', direction: 'asc' }], {
      type: 'set',
      sort: [{ id: 'age', direction: 'desc' }],
    });
    expect(state).toEqual([{ id: 'age', direction: 'desc' }]);
  });

  it('clear empties the stack', () => {
    expect(sortReducer([{ id: 'name', direction: 'asc' }], { type: 'clear' })).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/*  Reducers — filter                                                          */
/* -------------------------------------------------------------------------- */

describe('filterReducer', () => {
  it('set adds and replaces, undefined removes, never mutates input', () => {
    const initial: ColumnFiltersState = {};
    const added = filterReducer(initial, {
      type: 'set',
      columnId: 'name',
      filter: { operator: 'contains', value: 'Al' },
    });
    expect(added.name).toEqual({ operator: 'contains', value: 'Al' });
    expect(initial.name).toBeUndefined();

    const replaced = filterReducer(added, {
      type: 'set',
      columnId: 'name',
      filter: { operator: 'equals', value: 'Alice' },
    });
    expect(replaced.name).toEqual({ operator: 'equals', value: 'Alice' });

    const removed = filterReducer(replaced, { type: 'set', columnId: 'name', filter: undefined });
    expect(removed.name).toBeUndefined();
  });

  it('replaceAll swaps the whole map', () => {
    const next = filterReducer(
      { name: { operator: 'contains', value: 'a' } },
      { type: 'replaceAll', filters: { age: { operator: 'gt', value: 25 } } },
    );
    expect(next).toEqual({ age: { operator: 'gt', value: 25 } });
  });

  it('clear empties the map', () => {
    expect(filterReducer({ name: { operator: 'contains', value: 'x' } }, { type: 'clear' })).toEqual({});
  });
});

/* -------------------------------------------------------------------------- */
/*  Reducers — globalSearch, density, editing, expansion                       */
/* -------------------------------------------------------------------------- */

describe('globalSearchReducer', () => {
  it('set replaces the query', () => {
    expect(globalSearchReducer('', { type: 'set', value: 'hello' })).toBe('hello');
    expect(globalSearchReducer('hello', { type: 'set', value: '' })).toBe('');
  });
});

describe('densityReducer', () => {
  it('set replaces', () => {
    expect(densityReducer('standard', { type: 'set', density: 'compact' })).toBe('compact');
  });
});

describe('editingReducer', () => {
  it('start sets the active cell; cancel clears', () => {
    expect(editingReducer(null, { type: 'start', rowId: 'u1', columnId: 'name' })).toEqual({
      rowId: 'u1',
      columnId: 'name',
    });
    expect(editingReducer({ rowId: 'u1', columnId: 'name' }, { type: 'cancel' })).toBeNull();
  });
});

describe('expansionReducer', () => {
  it('toggle / expand / collapse / collapseAll behave as Set semantics', () => {
    let state = expansionReducer(new Set(), { type: 'toggle', id: 'u1' });
    expect(state.has('u1')).toBe(true);
    state = expansionReducer(state, { type: 'toggle', id: 'u1' });
    expect(state.has('u1')).toBe(false);

    state = expansionReducer(state, { type: 'expand', id: 'u2' });
    state = expansionReducer(state, { type: 'expand', id: 'u2' }); // idempotent
    expect(state.size).toBe(1);

    state = expansionReducer(state, { type: 'collapseAll' });
    expect(state.size).toBe(0);
  });

  it('returns the same Set reference when expand/collapse is a no-op', () => {
    const start = new Set(['u1']);
    expect(expansionReducer(start, { type: 'expand', id: 'u1' })).toBe(start);
    expect(expansionReducer(start, { type: 'collapse', id: 'missing' })).toBe(start);
  });
});

/* -------------------------------------------------------------------------- */
/*  Reducers — pagination                                                      */
/* -------------------------------------------------------------------------- */

describe('paginationReducer', () => {
  it('setPageIndex clamps negatives to 0', () => {
    const state = paginationReducer(initialPaginationState, { type: 'setPageIndex', pageIndex: -5 });
    if (!isCursorPagination(state)) expect(state.pageIndex).toBe(0);
    else throw new Error('expected offset pagination');
  });

  it('setPageSize resets pageIndex to 0 in offset mode', () => {
    const state = paginationReducer(
      { pageIndex: 4, pageSize: 25 },
      { type: 'setPageSize', pageSize: 50 },
    );
    if (!isCursorPagination(state)) {
      expect(state.pageIndex).toBe(0);
      expect(state.pageSize).toBe(50);
    } else throw new Error('expected offset pagination');
  });

  it('setCursor flips into cursor mode and preserves pageSize', () => {
    const state = paginationReducer(
      { pageIndex: 3, pageSize: 25 },
      { type: 'setCursor', cursor: 'abc' },
    );
    expect(isCursorPagination(state)).toBe(true);
    expect(state.pageSize).toBe(25);
  });

  it('setPageIndex on cursor state is a no-op', () => {
    const cursor = { cursor: 'x', pageSize: 10 };
    expect(paginationReducer(cursor, { type: 'setPageIndex', pageIndex: 2 })).toBe(cursor);
  });
});

/* -------------------------------------------------------------------------- */
/*  Reducers — selection                                                       */
/* -------------------------------------------------------------------------- */

describe('selectionReducer', () => {
  const orderedIds = ['u1', 'u2', 'u3', 'u4'];

  it('single mode toggles the lone id', () => {
    let state = selectionReducer(
      { ...initialSelectionState, mode: 'single', ids: null },
      { type: 'toggleRow', id: 'u2', orderedIds },
    );
    expect(state.ids).toBe('u2');
    state = selectionReducer(state, { type: 'toggleRow', id: 'u2', orderedIds });
    expect(state.ids).toBeNull();
  });

  it('multiple mode: cmd-toggle adds + removes; anchor updates', () => {
    let state = selectionReducer(
      { ...initialSelectionState, mode: 'multiple', ids: new Set() },
      { type: 'toggleRow', id: 'u2', orderedIds },
    );
    expect(idsAsArray(state.ids)).toEqual(['u2']);
    expect(state.anchorId).toBe('u2');

    state = selectionReducer(state, { type: 'toggleRow', id: 'u4', orderedIds });
    expect(new Set(idsAsArray(state.ids))).toEqual(new Set(['u2', 'u4']));
    expect(state.anchorId).toBe('u4');
  });

  it('multiple mode: shift-click extends the range from anchor', () => {
    let state = selectionReducer(
      { ...initialSelectionState, mode: 'multiple', ids: new Set() },
      { type: 'toggleRow', id: 'u1', orderedIds },
    );
    state = selectionReducer(state, { type: 'toggleRow', id: 'u4', orderedIds, range: true });
    expect(new Set(idsAsArray(state.ids))).toEqual(new Set(['u1', 'u2', 'u3', 'u4']));
  });

  it('toggleAll: tri-state — none → all → none', () => {
    let state = selectionReducer(
      { ...initialSelectionState, mode: 'multiple', ids: new Set() },
      { type: 'toggleAll', orderedIds },
    );
    expect(new Set(idsAsArray(state.ids))).toEqual(new Set(orderedIds));
    state = selectionReducer(state, { type: 'toggleAll', orderedIds });
    expect(idsAsArray(state.ids)).toEqual([]);
  });

  it('setMode resets ids appropriately', () => {
    const state = selectionReducer(
      { ...initialSelectionState, mode: 'multiple', ids: new Set(['u1', 'u2']) },
      { type: 'setMode', mode: 'single' },
    );
    expect(state.mode).toBe('single');
    expect(state.ids).toBeNull();
  });
});

describe('idsBetween', () => {
  it('inclusive both directions', () => {
    expect(idsBetween(['a', 'b', 'c', 'd'], 'a', 'c')).toEqual(['a', 'b', 'c']);
    expect(idsBetween(['a', 'b', 'c', 'd'], 'd', 'b')).toEqual(['b', 'c', 'd']);
  });

  it('empty when either id is missing', () => {
    expect(idsBetween(['a', 'b'], 'a', 'z')).toEqual([]);
    expect(idsBetween(['a', 'b'], 'z', 'a')).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/*  Reducers — column visibility / order / size / pinning                      */
/* -------------------------------------------------------------------------- */

describe('columnVisibilityReducer', () => {
  it('hide sets false; show deletes the key; toggle alternates', () => {
    let state = columnVisibilityReducer({}, { type: 'hide', columnId: 'role' });
    expect(state.role).toBe(false);
    state = columnVisibilityReducer(state, { type: 'show', columnId: 'role' });
    expect(state.role).toBeUndefined();
    state = columnVisibilityReducer({}, { type: 'toggle', columnId: 'role' });
    expect(state.role).toBe(false);
    state = columnVisibilityReducer(state, { type: 'toggle', columnId: 'role' });
    expect(state.role).toBeUndefined();
  });

  it('reset clears the map', () => {
    expect(columnVisibilityReducer({ role: false }, { type: 'reset' })).toEqual({});
  });
});

describe('columnOrderReducer', () => {
  const seed: ColumnOrderAction = { type: 'set', order: ['a', 'b', 'c', 'd'] };

  it('move left/right at boundaries is a no-op', () => {
    let state = columnOrderReducer([], seed);
    state = columnOrderReducer(state, { type: 'move', columnId: 'a', direction: 'left' });
    expect(state).toEqual(['a', 'b', 'c', 'd']);
    state = columnOrderReducer(state, { type: 'move', columnId: 'd', direction: 'right' });
    expect(state).toEqual(['a', 'b', 'c', 'd']);
  });

  it('move swaps adjacent', () => {
    const state = columnOrderReducer(['a', 'b', 'c', 'd'], {
      type: 'move',
      columnId: 'b',
      direction: 'right',
    });
    expect(state).toEqual(['a', 'c', 'b', 'd']);
  });

  it('moveTo clamps to bounds', () => {
    const state = columnOrderReducer(['a', 'b', 'c', 'd'], {
      type: 'moveTo',
      columnId: 'a',
      toIndex: 99,
    });
    expect(state).toEqual(['b', 'c', 'd', 'a']);
  });

  it('reset returns the empty override list', () => {
    expect(columnOrderReducer(['a', 'b'], { type: 'reset' })).toEqual([]);
  });
});

describe('columnSizeReducer', () => {
  it('setOne clamps tiny sizes to the minimum', () => {
    const state = columnSizeReducer({}, { type: 'setOne', columnId: 'name', size: 5 });
    expect(state.name).toBeGreaterThanOrEqual(24);
  });

  it('idempotent set returns same reference', () => {
    const initial = { name: 100 };
    expect(columnSizeReducer(initial, { type: 'setOne', columnId: 'name', size: 100 })).toBe(initial);
  });

  it('reset removes a column; resetAll empties', () => {
    let state = columnSizeReducer({ name: 100, age: 80 }, { type: 'reset', columnId: 'age' });
    expect(state).toEqual({ name: 100 });
    state = columnSizeReducer(state, { type: 'resetAll' });
    expect(state).toEqual({});
  });
});

describe('columnPinningReducer', () => {
  it('pin start moves the id to the start list', () => {
    const state = columnPinningReducer(initialColumnPinningState, {
      type: 'pin',
      columnId: 'name',
      side: 'start',
    });
    expect(state.start).toEqual(['name']);
    expect(state.end).toEqual([]);
  });

  it('pin end inserts at front of end list', () => {
    const state = columnPinningReducer(
      { start: [], end: ['actions'] },
      { type: 'pin', columnId: 'role', side: 'end' },
    );
    expect(state.end).toEqual(['role', 'actions']);
  });

  it('pin null unpins a previously pinned column', () => {
    const state = columnPinningReducer(
      { start: ['name'], end: [] },
      { type: 'pin', columnId: 'name', side: null },
    );
    expect(state).toEqual({ start: [], end: [] });
  });

  it('idempotent unpin returns same reference', () => {
    const initial = { start: [], end: [] };
    expect(
      columnPinningReducer(initial, { type: 'pin', columnId: 'missing', side: null }),
    ).toBe(initial);
  });
});

/* -------------------------------------------------------------------------- */
/*  filterEngine — every operator                                              */
/* -------------------------------------------------------------------------- */

describe('filterEngine — text operators', () => {
  it('equals / notEquals / contains / startsWith / endsWith (case-insensitive)', () => {
    expect(applyOperator('equals', 'Alice', 'alice', 'text')).toBe(true);
    expect(applyOperator('notEquals', 'Alice', 'Bob', 'text')).toBe(true);
    expect(applyOperator('contains', 'Alice', 'lic', 'text')).toBe(true);
    expect(applyOperator('startsWith', 'Alice', 'al', 'text')).toBe(true);
    expect(applyOperator('endsWith', 'Alice', 'ICE', 'text')).toBe(true);
  });

  it('empty needle: contains/notContains are vacuous truths', () => {
    expect(applyOperator('contains', 'x', '', 'text')).toBe(true);
    expect(applyOperator('notContains', 'x', '', 'text')).toBe(true);
  });

  it('isEmpty / isNotEmpty', () => {
    expect(applyOperator('isEmpty', null, undefined, 'text')).toBe(true);
    expect(applyOperator('isEmpty', '', undefined, 'text')).toBe(true);
    expect(applyOperator('isNotEmpty', 'x', undefined, 'text')).toBe(true);
  });
});

describe('filterEngine — number operators', () => {
  it('comparison operators', () => {
    expect(applyOperator('equals', 30, 30, 'number')).toBe(true);
    expect(applyOperator('gt', 30, 20, 'number')).toBe(true);
    expect(applyOperator('gte', 30, 30, 'number')).toBe(true);
    expect(applyOperator('lt', 10, 20, 'number')).toBe(true);
    expect(applyOperator('lte', 10, 10, 'number')).toBe(true);
  });

  it('between with reversed tuple', () => {
    expect(applyOperator('between', 25, [30, 20], 'number')).toBe(true);
    expect(applyOperator('between', 35, [30, 20], 'number')).toBe(false);
  });

  it('string filter value coerces to number', () => {
    expect(applyOperator('gt', 30, '20', 'number')).toBe(true);
  });

  it('rejects bad filter values gracefully', () => {
    expect(applyOperator('gt', 30, 'not a number', 'number')).toBe(false);
    expect(applyOperator('between', 30, [1], 'number')).toBe(false);
  });
});

describe('filterEngine — date operators', () => {
  const base = new Date('2024-06-15T12:00:00Z');

  it('before / after', () => {
    expect(applyOperator('before', base, new Date('2024-07-01'), 'date')).toBe(true);
    expect(applyOperator('after', base, new Date('2024-05-01'), 'date')).toBe(true);
  });

  it('equals compares same-day, not millisecond-equal', () => {
    // Build both dates in *local* time so the same-day predicate (which reads
    // getFullYear/getMonth/getDate, all local-time accessors) is timezone-stable.
    const morning = new Date(2024, 5, 15, 8, 0, 0);
    const evening = new Date(2024, 5, 15, 22, 0, 0);
    expect(applyOperator('equals', morning, evening, 'date')).toBe(true);
  });

  it('between accepts string tuples', () => {
    expect(applyOperator('between', base, ['2024-06-01', '2024-06-30'], 'date')).toBe(true);
  });
});

describe('filterEngine — select + boolean', () => {
  it('select in / notIn', () => {
    expect(applyOperator('in', 'admin', ['admin', 'editor'], 'select')).toBe(true);
    expect(applyOperator('notIn', 'viewer', ['admin', 'editor'], 'select')).toBe(true);
  });

  it('empty filter list is vacuous for in / notIn', () => {
    expect(applyOperator('in', 'admin', [], 'select')).toBe(true);
    expect(applyOperator('notIn', 'admin', [], 'select')).toBe(true);
  });

  it('boolean matches cell strictly', () => {
    expect(applyOperator('equals', true, true, 'boolean')).toBe(true);
    expect(applyOperator('equals', false, true, 'boolean')).toBe(false);
  });

  it('isTrue / isFalse', () => {
    expect(applyOperator('isTrue', true, undefined, 'boolean')).toBe(true);
    expect(applyOperator('isFalse', false, undefined, 'boolean')).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  compareValues                                                              */
/* -------------------------------------------------------------------------- */

describe('compareValues', () => {
  it('numeric collation: "9" < "10"', () => {
    expect(compareValues('9', '10', collator)).toBeLessThan(0);
  });

  it('accent folding at base sensitivity', () => {
    expect(compareValues('cafe', 'café', collator)).toBe(0);
  });

  it('null / undefined / NaN sort after real values', () => {
    expect(compareValues(null, 5, collator)).toBeGreaterThan(0);
    expect(compareValues(5, undefined, collator)).toBeLessThan(0);
    expect(compareValues(NaN, 5, collator)).toBeGreaterThan(0);
    expect(compareValues(undefined, null, collator)).toBe(0);
  });

  it('Date compares by getTime', () => {
    expect(compareValues(new Date('2024-01-01'), new Date('2024-06-01'), collator)).toBeLessThan(0);
  });

  it('Hebrew comparison is deterministic', () => {
    const heCollator = new Intl.Collator('he', { numeric: true, sensitivity: 'base' });
    expect(compareValues('א', 'ב', heCollator)).toBeLessThan(0);
  });
});

/* -------------------------------------------------------------------------- */
/*  Derivations                                                                */
/* -------------------------------------------------------------------------- */

describe('deriveFilteredRows', () => {
  it('returns all rows when no filters + no search', () => {
    const result = deriveFilteredRows({ rows: userRows, columns, filters: {}, globalSearch: '' });
    expect(result).toHaveLength(4);
  });

  it('AND-composes multiple column filters', () => {
    const result = deriveFilteredRows({
      rows: userRows,
      columns,
      filters: {
        role: { operator: 'in', value: ['editor', 'admin'] },
        active: { operator: 'isTrue', value: undefined },
      },
      globalSearch: '',
    });
    expect(result.map((r) => r.id)).toEqual(['u1', 'u4']);
  });

  it('global search matches across filterable columns', () => {
    const result = deriveFilteredRows({
      rows: userRows,
      columns,
      filters: {},
      globalSearch: 'beta',
    });
    expect(result.map((r) => r.id)).toEqual(['u4']);
  });

  it('skips structural columns in global search', () => {
    const colsWithActions: ColumnDef<User>[] = [
      ...columns,
      { id: 'actions', type: 'actions' },
    ];
    const result = deriveFilteredRows({
      rows: userRows,
      columns: colsWithActions,
      filters: {},
      globalSearch: 'admin',
    });
    expect(result.map((r) => r.id)).toEqual(['u1']);
  });
});

describe('deriveSortedRows', () => {
  it('single asc / desc on a text column', () => {
    const asc = deriveSortedRows({
      rows: userRows,
      columns,
      sort: [{ id: 'name', direction: 'asc' }],
      collator,
    });
    expect(asc.map((r) => r.id)).toEqual(['u1', 'u2', 'u3', 'u4']);
    const desc = deriveSortedRows({
      rows: userRows,
      columns,
      sort: [{ id: 'name', direction: 'desc' }],
      collator,
    });
    expect(desc.map((r) => r.id)).toEqual(['u4', 'u3', 'u2', 'u1']);
  });

  it('multi-column with tie-breaking on the second key', () => {
    const sorted = deriveSortedRows({
      rows: userRows,
      columns,
      sort: [
        { id: 'role', direction: 'asc' },
        { id: 'age', direction: 'asc' },
      ],
      collator,
    });
    // role asc: admin (u1) → editor (u2,u4 by age) → viewer (u3)
    expect(sorted.map((r) => r.id)).toEqual(['u1', 'u2', 'u4', 'u3']);
  });

  it('returns a fresh array', () => {
    const sorted = deriveSortedRows({ rows: userRows, columns, sort: [], collator });
    expect(sorted).not.toBe(userRows);
  });

  it('Date column sorts chronologically', () => {
    const sorted = deriveSortedRows({
      rows: userRows,
      columns,
      sort: [{ id: 'joined', direction: 'asc' }],
      collator,
    });
    expect(sorted.map((r) => r.id)).toEqual(['u2', 'u1', 'u4', 'u3']);
  });
});

describe('derivePaginatedRows', () => {
  it('slices to the current page', () => {
    const result = derivePaginatedRows({
      rows: userRows,
      pagination: { pageIndex: 0, pageSize: 2 },
    });
    expect(result.rows).toHaveLength(2);
    expect(result.pageCount).toBe(2);
    expect(result.fromRow).toBe(1);
    expect(result.toRow).toBe(2);
  });

  it('clamps an over-large pageIndex to the last page', () => {
    const result = derivePaginatedRows({
      rows: userRows,
      pagination: { pageIndex: 99, pageSize: 2 },
    });
    expect(result.pageIndex).toBe(1);
    expect(result.rows).toHaveLength(2);
  });

  it('pageSize 0 → returns everything in one page', () => {
    const result = derivePaginatedRows({
      rows: userRows,
      pagination: { pageIndex: 0, pageSize: 0 },
    });
    expect(result.rows).toHaveLength(4);
    expect(result.pageCount).toBe(1);
  });

  it('cursor mode returns rows as-is and pageCount = Infinity', () => {
    const result = derivePaginatedRows({
      rows: userRows,
      pagination: { cursor: null, pageSize: 4 },
    });
    expect(result.rows).toHaveLength(4);
    expect(result.pageCount).toBe(Number.POSITIVE_INFINITY);
  });

  it('empty rows yield fromRow=0', () => {
    const result = derivePaginatedRows({
      rows: [],
      pagination: { pageIndex: 0, pageSize: 10 },
    });
    expect(result.fromRow).toBe(0);
    expect(result.toRow).toBe(0);
  });
});

describe('deriveColumnOrder', () => {
  it('empty override returns natural order', () => {
    const result = deriveColumnOrder(columns, []);
    expect(result.map((c) => c.id)).toEqual(columns.map((c) => c.id));
  });

  it('override pulls listed columns first, then appends the rest', () => {
    const result = deriveColumnOrder(columns, ['role', 'name']);
    const ids = result.map((c) => c.id);
    expect(ids.slice(0, 2)).toEqual(['role', 'name']);
    expect(ids).toHaveLength(columns.length);
  });

  it('ignores unknown ids in the override', () => {
    const result = deriveColumnOrder(columns, ['nope', 'name']);
    expect(result[0]?.id).toBe('name');
  });
});

describe('deriveVisibleColumns', () => {
  it('hides only the ids set to false', () => {
    const result = deriveVisibleColumns(columns, { role: false });
    expect(result.find((c) => c.id === 'role')).toBeUndefined();
  });

  it('structural columns are always visible regardless of map', () => {
    const cols: ColumnDef<User>[] = [
      ...columns,
      { id: 'select', type: 'rowSelect' },
    ];
    const result = deriveVisibleColumns(cols, { select: false });
    expect(result.find((c) => c.id === 'select')).toBeDefined();
  });
});

describe('derivePinnedColumns', () => {
  it('splits into start / middle / end groups in pinning order', () => {
    const groups = derivePinnedColumns(columns, { start: ['role'], end: ['notes'] });
    expect(groups.start.map((c) => c.id)).toEqual(['role']);
    expect(groups.end.map((c) => c.id)).toEqual(['notes']);
    expect(groups.middle.map((c) => c.id)).toEqual(['name', 'age', 'active', 'joined']);
  });

  it('drops pinning ids not present in columns', () => {
    const groups = derivePinnedColumns(columns, { start: ['missing'], end: [] });
    expect(groups.start).toEqual([]);
    expect(groups.middle.length).toBe(columns.length);
  });
});

/* -------------------------------------------------------------------------- */
/*  Exporters                                                                  */
/* -------------------------------------------------------------------------- */

describe('exportCsv', () => {
  it('produces a header row and serialises Dates as ISO', () => {
    const csv = exportCsv({
      rows: userRows.slice(0, 1),
      columns: [
        { id: 'name', accessor: 'name', type: 'text', header: 'Name' },
        { id: 'joined', accessor: 'joined', type: 'date', header: 'Joined' },
      ],
    });
    const [header, row] = csv.split('\r\n');
    expect(header).toBe('Name,Joined');
    expect(row).toBe('Alice,2024-01-15T00:00:00.000Z');
  });

  it('escapes commas, quotes, and newlines per RFC 4180', () => {
    const rows: Row<{ id: string; v: string }>[] = [
      { id: 'a', index: 0, original: { id: 'a', v: 'has, comma' } },
      { id: 'b', index: 1, original: { id: 'b', v: 'has "quote"' } },
      { id: 'c', index: 2, original: { id: 'c', v: 'has\nnewline' } },
    ];
    const csv = exportCsv({
      rows,
      columns: [{ id: 'v', accessor: 'v', type: 'text', header: 'V' }],
    });
    const lines = csv.split('\r\n');
    expect(lines[1]).toBe('"has, comma"');
    expect(lines[2]).toBe('"has ""quote"""');
    expect(lines[3]).toBe('"has\nnewline"');
  });

  it('skips structural columns', () => {
    const cols: ColumnDef<User>[] = [
      { id: 'select', type: 'rowSelect' },
      { id: 'name', accessor: 'name', type: 'text', header: 'Name' },
      { id: 'actions', type: 'actions' },
    ];
    const csv = exportCsv({ rows: userRows.slice(0, 1), columns: cols });
    expect(csv.split('\r\n')[0]).toBe('Name');
  });

  it('omits the header when includeHeader is false', () => {
    const csv = exportCsv({
      rows: userRows.slice(0, 1),
      columns: [{ id: 'name', accessor: 'name', type: 'text', header: 'Name' }],
      includeHeader: false,
    });
    expect(csv).toBe('Alice');
  });
});

describe('exportJson', () => {
  it('keys by column id and serialises Date as ISO', () => {
    const json = exportJson({
      rows: userRows.slice(0, 1),
      columns: [
        { id: 'name', accessor: 'name', type: 'text' },
        { id: 'joined', accessor: 'joined', type: 'date' },
      ],
    });
    const parsed = JSON.parse(json);
    expect(parsed).toEqual([{ name: 'Alice', joined: '2024-01-15T00:00:00.000Z' }]);
  });
});

/* -------------------------------------------------------------------------- */
/*  getCellValue — accessor resolution                                         */
/* -------------------------------------------------------------------------- */

describe('getCellValue', () => {
  it('keyof accessor', () => {
    expect(getCellValue(users[0]!, columns[0]!)).toBe('Alice');
  });

  it('function accessor', () => {
    const column: ColumnDef<User> = { id: 'derived', accessor: (u) => u.name.toUpperCase(), type: 'text' };
    expect(getCellValue(users[0]!, column)).toBe('ALICE');
  });

  it('missing accessor falls back to row[column.id]', () => {
    const column: ColumnDef<User> = { id: 'name', type: 'text' };
    expect(getCellValue(users[0]!, column)).toBe('Alice');
  });
});

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function idsAsArray(ids: unknown): string[] {
  if (ids instanceof Set) return [...ids].map(String);
  if (ids === null || ids === undefined) return [];
  return [String(ids)];
}
