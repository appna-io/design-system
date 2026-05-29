import { describe, expect, it } from 'vitest';

import { cycleSort, sortRows } from '../src/Table/sortRows';
import type { TableColumn } from '../src/Table';

interface Row {
  id: string;
  name: string;
  age: number;
  joined: string;
}

const rows: Row[] = [
  { id: '1', name: 'Maya', age: 28, joined: '2024-06-12' },
  { id: '2', name: 'Liam', age: 34, joined: '2023-11-03' },
  { id: '3', name: 'Ava', age: 22, joined: '2025-02-19' },
  { id: '4', name: 'Noah', age: 41, joined: '2022-08-30' },
];

describe('sortRows', () => {
  it('returns the input untouched when no column is provided', () => {
    const out = sortRows({ rows, column: undefined, direction: 'asc' });
    expect(out).toBe(rows);
  });

  it('returns the input untouched when column has no accessor', () => {
    const col: TableColumn<Row> = { id: 'name', header: 'Name' };
    const out = sortRows({ rows, column: col, direction: 'asc' });
    expect(out).toBe(rows);
  });

  it('sorts strings ascending with localeCompare', () => {
    const col: TableColumn<Row> = { id: 'name', header: 'Name', accessor: (r) => r.name };
    const out = sortRows({ rows, column: col, direction: 'asc' });
    expect(out.map((r) => r.name)).toEqual(['Ava', 'Liam', 'Maya', 'Noah']);
  });

  it('reverses for direction=desc', () => {
    const col: TableColumn<Row> = { id: 'name', header: 'Name', accessor: (r) => r.name };
    const out = sortRows({ rows, column: col, direction: 'desc' });
    expect(out.map((r) => r.name)).toEqual(['Noah', 'Maya', 'Liam', 'Ava']);
  });

  it('sorts numbers correctly with sortFn=number', () => {
    const col: TableColumn<Row> = {
      id: 'age',
      header: 'Age',
      accessor: (r) => r.age,
      sortFn: 'number',
    };
    const out = sortRows({ rows, column: col, direction: 'asc' });
    expect(out.map((r) => r.age)).toEqual([22, 28, 34, 41]);
  });

  it('sorts ISO date strings correctly with sortFn=date', () => {
    const col: TableColumn<Row> = {
      id: 'joined',
      header: 'Joined',
      accessor: (r) => r.joined,
      sortFn: 'date',
    };
    const out = sortRows({ rows, column: col, direction: 'asc' });
    expect(out.map((r) => r.joined)).toEqual([
      '2022-08-30',
      '2023-11-03',
      '2024-06-12',
      '2025-02-19',
    ]);
  });

  it('supports a custom comparator function', () => {
    const col: TableColumn<Row> = {
      id: 'compound',
      header: '',
      accessor: () => 0,
      sortFn: (a, b) => a.name.length - b.name.length,
    };
    const out = sortRows({ rows, column: col, direction: 'asc' });
    expect(out.map((r) => r.name)).toEqual(['Ava', 'Maya', 'Liam', 'Noah']);
  });

  it('returns a new array (does not mutate input)', () => {
    const col: TableColumn<Row> = { id: 'name', header: 'Name', accessor: (r) => r.name };
    const before = [...rows];
    sortRows({ rows, column: col, direction: 'asc' });
    expect(rows).toEqual(before);
  });

  it('sinks null/undefined values to the bottom in string mode', () => {
    const data = [
      { id: '1', name: 'Beta' },
      { id: '2', name: null as unknown as string },
      { id: '3', name: 'Alpha' },
    ];
    const col: TableColumn<(typeof data)[number]> = {
      id: 'name',
      header: '',
      accessor: (r) => r.name,
    };
    const out = sortRows({ rows: data, column: col, direction: 'asc' });
    expect(out.map((r) => r.id)).toEqual(['3', '1', '2']);
  });

  it('sinks NaN to the bottom in number mode', () => {
    const data = [
      { id: '1', score: 10 },
      { id: '2', score: Number.NaN },
      { id: '3', score: 5 },
    ];
    const col: TableColumn<(typeof data)[number]> = {
      id: 'score',
      header: '',
      accessor: (r) => r.score,
      sortFn: 'number',
    };
    const out = sortRows({ rows: data, column: col, direction: 'asc' });
    expect(out.map((r) => r.id)).toEqual(['3', '1', '2']);
  });
});

describe('cycleSort', () => {
  it('starts at asc when there is no current sort', () => {
    expect(cycleSort(undefined, 'name')).toEqual({ id: 'name', direction: 'asc' });
  });

  it('moves asc → desc on the same column', () => {
    expect(cycleSort({ id: 'name', direction: 'asc' }, 'name')).toEqual({
      id: 'name',
      direction: 'desc',
    });
  });

  it('moves desc → undefined on the same column', () => {
    expect(cycleSort({ id: 'name', direction: 'desc' }, 'name')).toBeUndefined();
  });

  it('resets to asc when switching to a different column', () => {
    expect(cycleSort({ id: 'age', direction: 'desc' }, 'name')).toEqual({
      id: 'name',
      direction: 'asc',
    });
  });
});
