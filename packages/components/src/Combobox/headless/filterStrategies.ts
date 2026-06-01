/**
 * Pure filter predicates. Each takes a candidate `label` and a `query`, returns a boolean.
 *
 * `substring` — case-insensitive `.includes()`. The default; what 90% of consumers expect.
 * `startsWith` — case-insensitive `.startsWith()`. Good for sorted picker UX.
 * `fuzzy` — intentionally simple subsequence match (no scoring). Consumers wanting ranked fuzzy
 * (Fuse.js, fzf-style) can bring their own ranker via the `filterOption` escape hatch.
 *
 * **Why no scoring in `fuzzy`?** The whole point of these strategies is "drop-in, no extra
 * dependency, no opinion about ranking." A consumer wanting "best match first" almost certainly
 * also wants per-domain tie-breakers (recency, popularity, fav-bonus, etc.); shipping a generic
 * scorer would be both too opinionated and immediately wrong for half of consumers. Yes-or-no
 * subsequence match + the original option order is the boring, correct default.
 */

export type FilterStrategyFn = (label: string, query: string) => boolean;

export const filterStrategies = {
  substring: ((label, query) => label.toLowerCase().includes(query.toLowerCase())) as FilterStrategyFn,
  startsWith: ((label, query) =>
    label.toLowerCase().startsWith(query.toLowerCase())) as FilterStrategyFn,
  fuzzy: ((label, query) => fuzzyMatch(label, query)) as FilterStrategyFn,
};

/**
 * O(n) subsequence match — every char in `query` appears in `label` in order. Empty queries
 * match everything (caller has to short-circuit anyway, but symmetric semantics keep the
 * predicate composable).
 */
export function fuzzyMatch(label: string, query: string): boolean {
  if (!query) return true;
  const l = label.toLowerCase();
  const q = query.toLowerCase();
  let i = 0;
  for (let pos = 0; pos < l.length; pos++) {
    if (l[pos] === q[i]) i++;
    if (i === q.length) return true;
  }
  return false;
}