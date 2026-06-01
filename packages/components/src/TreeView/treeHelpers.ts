import type { TreeNodeData } from './TreeView.types';

/** Row in the flat, post-expansion visible-list projection. */
export interface FlatTreeRow {
  node: TreeNodeData;
  level: number;
  /** Path of ancestor ids, root-first. Used for ArrowLeft "focus parent". */
  parentId: string | undefined;
  /** True when the row sits at a branch (has `children` or `hasChildren: true`). */
  isBranch: boolean;
  /** True when this branch is in the expanded set. */
  expanded: boolean;
  /** True when the parent chain is fully expanded — used to honour `aria-hidden` skipping. */
  visible: boolean;
}

/**
 * Walk a forest and produce the flat list of rows that are currently visible (parents
 * expanded). Non-branch leaves are always emitted; branch nodes emit themselves AND
 * recurse into children when expanded.
 *
 * Pure. Memoize on `data` + `expanded` identity at the call site.
 */
export function flattenTree(
  data: TreeNodeData[],
  expanded: ReadonlySet<string>,
): FlatTreeRow[] {
  const out: FlatTreeRow[] = [];
  const walk = (
    nodes: TreeNodeData[],
    level: number,
    parentId: string | undefined,
    ancestorVisible: boolean,
  ): void => {
    for (const node of nodes) {
      const isBranch =
        Array.isArray(node.children) ? node.children.length > 0 : Boolean(node.hasChildren);
      const isExpanded = expanded.has(node.id);
      out.push({
        node,
        level,
        parentId,
        isBranch,
        expanded: isExpanded,
        visible: ancestorVisible,
      });
      if (isBranch && isExpanded && Array.isArray(node.children)) {
        walk(node.children, level + 1, node.id, ancestorVisible);
      }
    }
  };
  walk(data, 0, undefined, true);
  return out;
}

/**
 * Find a node by id with a single DFS pass. Returns `undefined` when missing. We don't
 * cache the lookup table because the tree only calls this rarely (programmatic focus,
 * `loadChildren` resolution).
 */
export function findTreeNode(
  data: TreeNodeData[],
  id: string,
): TreeNodeData | undefined {
  for (const node of data) {
    if (node.id === id) return node;
    if (Array.isArray(node.children)) {
      const hit = findTreeNode(node.children, id);
      if (hit) return hit;
    }
  }
  return undefined;
}

/**
 * Look up the id of the next visible focusable row given a direction. Skips disabled
 * nodes — the W3C TreeView pattern requires arrow nav to bypass them entirely. Returns
 * `undefined` when there's no candidate (e.g. ArrowDown on the last row).
 */
export function nextFocusableId(
  rows: FlatTreeRow[],
  current: string | undefined,
  direction: 'next' | 'previous' | 'first' | 'last',
): string | undefined {
  const focusable = rows.filter((row) => row.visible && !row.node.disabled);
  if (focusable.length === 0) return undefined;

  if (direction === 'first') return focusable[0]!.node.id;
  if (direction === 'last') return focusable[focusable.length - 1]!.node.id;

  const idx = focusable.findIndex((row) => row.node.id === current);
  if (idx === -1) return focusable[0]!.node.id;
  if (direction === 'next') return focusable[Math.min(focusable.length - 1, idx + 1)]!.node.id;
  return focusable[Math.max(0, idx - 1)]!.node.id;
}

/**
 * Look up the id of the first matching node by case-insensitive label prefix, starting
 * the search **after** the current focused row and wrapping around. Used by the
 * type-to-search aggregator. Non-string labels are skipped (they have no searchable
 * surface).
 */
export function findByPrefix(
  rows: FlatTreeRow[],
  current: string | undefined,
  buffer: string,
): string | undefined {
  if (!buffer) return undefined;
  const focusable = rows.filter((row) => row.visible && !row.node.disabled);
  if (focusable.length === 0) return undefined;
  const needle = buffer.toLowerCase();
  const startIdx = current
    ? Math.max(0, focusable.findIndex((row) => row.node.id === current))
    : -1;

  for (let offset = 1; offset <= focusable.length; offset += 1) {
    const probe = focusable[(startIdx + offset) % focusable.length]!;
    const label = typeof probe.node.label === 'string' ? probe.node.label : '';
    if (label.toLowerCase().startsWith(needle)) {
      return probe.node.id;
    }
  }
  return undefined;
}

/**
 * Pull the ancestor chain for a node from a flat row list (root → parent → node). Used
 * by ArrowLeft "collapse else focus parent" and by programmatic expand-to-reveal. The
 * row list is the source of truth — we don't re-walk the tree.
 */
export function ancestorIds(rows: FlatTreeRow[], id: string): string[] {
  const out: string[] = [];
  const byId = new Map(rows.map((row) => [row.node.id, row] as const));
  let cursor: string | undefined = id;
  while (cursor !== undefined) {
    const row = byId.get(cursor);
    if (!row || row.parentId === undefined) break;
    out.unshift(row.parentId);
    cursor = row.parentId;
  }
  return out;
}

/**
 * Collect ids of every sibling under the same parent as `id` (excluding the parent
 * itself). Used by the `*` key — "expand all siblings of the focused node".
 */
export function siblingIds(rows: FlatTreeRow[], id: string): string[] {
  const focus = rows.find((row) => row.node.id === id);
  if (!focus) return [];
  return rows
    .filter((row) => row.parentId === focus.parentId && row.isBranch)
    .map((row) => row.node.id);
}