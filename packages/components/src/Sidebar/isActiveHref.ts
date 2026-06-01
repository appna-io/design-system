import type { SidebarActiveMatchStrategy } from './Sidebar.types';

/**
 * Pure helper: decides whether a Sidebar.Item with `itemHref` should be considered active given
 * the current URL path (`current`) and the configured matching `strategy`.
 *
 * Rules:
 *   - Either string missing → not active.
 *   - Trailing slashes are normalized (`/inbox/` and `/inbox` are equivalent) so consumers
 *     don't have to think about it. The root path `'/'` is preserved as-is.
 *   - `exact`  → both paths must match after normalization.
 *   - `prefix` → either exact match, OR `current` starts with `itemHref + '/'`. The trailing
 *     slash boundary check is critical: without it, `/photos` would match `/p`, which would
 *     wrongly highlight unrelated parent items.
 *
 * Exported as a pure function (no React, no hooks) so it can be unit-tested as a truth table
 * and reused by future siblings (NavigationMenu, Breadcrumbs auto-highlight, etc.).
 */
export function isActiveHref(args: {
  current: string | undefined;
  itemHref: string | undefined;
  strategy: SidebarActiveMatchStrategy;
}): boolean {
  const { current, itemHref, strategy } = args;
  if (!current || !itemHref) return false;

  const a = normalizePath(current);
  const b = normalizePath(itemHref);

  if (strategy === 'exact') return a === b;
  // strategy === 'prefix'
  if (a === b) return true;
  // Boundary check: `/p` should NOT match `/photos`; it SHOULD match `/p/launch`.
  return a.startsWith(b === '/' ? '/' : b + '/');
}

/**
 * Strips trailing slashes from a path while keeping the root path as `'/'`. Internal helper
 * for `isActiveHref`; exported lazily via the same module for testability if a consumer wants
 * to write their own activeness predicate against the same normalization rule.
 */
function normalizePath(path: string): string {
  if (path === '/' || path === '') return '/';
  // Strip trailing slashes one or more, then guarantee at least one character remains.
  const stripped = path.replace(/\/+$/, '');
  return stripped === '' ? '/' : stripped;
}