import { describe, expect, it } from 'vitest';

import {
  ancestorIds,
  findByPrefix,
  findTreeNode,
  flattenTree,
  nextFocusableId,
  siblingIds,
} from '../src/TreeView/treeHelpers';
import type { TreeNodeData } from '../src/TreeView';

const data: TreeNodeData[] = [
  {
    id: 'a',
    label: 'Animals',
    children: [
      { id: 'a/cats', label: 'Cats' },
      { id: 'a/dogs', label: 'Dogs', disabled: true },
      { id: 'a/horses', label: 'Horses' },
    ],
  },
  {
    id: 'b',
    label: 'Bands',
    children: [
      { id: 'b/abba', label: 'Abba' },
      { id: 'b/queen', label: 'Queen' },
    ],
  },
];

describe('flattenTree', () => {
  it('emits only root rows when nothing is expanded', () => {
    const rows = flattenTree(data, new Set());
    expect(rows.map((r) => r.node.id)).toEqual(['a', 'b']);
    expect(rows.every((r) => r.level === 0)).toBe(true);
    expect(rows.every((r) => r.isBranch)).toBe(true);
  });

  it('expands a branch and emits its children', () => {
    const rows = flattenTree(data, new Set(['a']));
    expect(rows.map((r) => r.node.id)).toEqual([
      'a',
      'a/cats',
      'a/dogs',
      'a/horses',
      'b',
    ]);
    expect(rows.find((r) => r.node.id === 'a/cats')?.level).toBe(1);
  });

  it('tags branches that are expanded', () => {
    const rows = flattenTree(data, new Set(['a']));
    expect(rows.find((r) => r.node.id === 'a')?.expanded).toBe(true);
    expect(rows.find((r) => r.node.id === 'b')?.expanded).toBe(false);
  });

  it('treats hasChildren=true as a branch even without inline children', () => {
    const lazy: TreeNodeData[] = [{ id: 'l', label: 'Lazy', hasChildren: true }];
    const rows = flattenTree(lazy, new Set());
    expect(rows[0]!.isBranch).toBe(true);
  });
});

describe('findTreeNode', () => {
  it('finds a node deep in the tree', () => {
    expect(findTreeNode(data, 'a/horses')?.label).toBe('Horses');
    expect(findTreeNode(data, 'b/queen')?.label).toBe('Queen');
  });

  it('returns undefined for missing ids', () => {
    expect(findTreeNode(data, 'nope')).toBeUndefined();
  });
});

describe('nextFocusableId', () => {
  const rows = flattenTree(data, new Set(['a']));

  it('returns the first focusable when current is undefined', () => {
    expect(nextFocusableId(rows, undefined, 'next')).toBe('a');
    expect(nextFocusableId(rows, undefined, 'first')).toBe('a');
  });

  it('moves next + skips disabled nodes', () => {
    expect(nextFocusableId(rows, 'a/cats', 'next')).toBe('a/horses');
  });

  it('moves previous + skips disabled nodes', () => {
    expect(nextFocusableId(rows, 'a/horses', 'previous')).toBe('a/cats');
  });

  it('clamps at the ends', () => {
    const first = nextFocusableId(rows, 'a', 'previous');
    expect(first).toBe('a');
    const last = nextFocusableId(rows, 'b', 'next');
    expect(last).toBe('b');
  });

  it('returns the last visible focusable on direction=last', () => {
    expect(nextFocusableId(rows, undefined, 'last')).toBe('b');
  });
});

describe('findByPrefix', () => {
  const rows = flattenTree(data, new Set(['a', 'b']));

  it('matches case-insensitively from the next row', () => {
    expect(findByPrefix(rows, 'a', 'q')).toBe('b/queen');
  });

  it('wraps around to the start', () => {
    expect(findByPrefix(rows, 'b/queen', 'a')).toBe('a');
  });

  it('returns undefined when nothing matches', () => {
    expect(findByPrefix(rows, 'a', 'zzz')).toBeUndefined();
  });
});

describe('ancestorIds + siblingIds', () => {
  const rows = flattenTree(data, new Set(['a']));

  it('returns the ancestor chain', () => {
    expect(ancestorIds(rows, 'a/cats')).toEqual(['a']);
    expect(ancestorIds(rows, 'a')).toEqual([]);
  });

  it('lists sibling branch ids', () => {
    const rows2 = flattenTree(data, new Set());
    expect(siblingIds(rows2, 'a')).toEqual(['a', 'b']);
  });
});
