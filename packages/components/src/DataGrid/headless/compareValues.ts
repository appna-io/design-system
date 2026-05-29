/**
 * Comparator for arbitrary cell values, used by the multi-column sort.
 *
 * Ordering rules:
 *  - `null` / `undefined` always sort to the end (in either direction — they're "missing"
 *    rather than "smaller / larger"). Two missing values compare equal.
 *  - `Date` instances compare by `.getTime()`.
 *  - `number` (incl. `NaN` last) compares numerically. `NaN` is treated as missing.
 *  - `boolean` `false < true`.
 *  - `string` uses the supplied `Intl.Collator` so that:
 *      * `"10"` > `"9"` (numeric collation),
 *      * accents fold (`"é"` ≡ `"e"` for sort purposes at `sensitivity: 'base'`),
 *      * Hebrew / Arabic letter order is correct.
 *  - Mixed types fall back to a stable lexicographic compare on `String(value)` so the
 *    sort is at least deterministic.
 */
export function compareValues(a: unknown, b: unknown, collator: Intl.Collator): number {
  const aMissing = isMissing(a);
  const bMissing = isMissing(b);
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return collator.compare(a, b);
  }

  return collator.compare(String(a), String(b));
}

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number' && Number.isNaN(value)) return true;
  return false;
}
