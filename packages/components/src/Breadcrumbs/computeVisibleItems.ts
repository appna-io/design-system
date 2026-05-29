/**
 * Pure overflow-collapse calculator. Given a list of items, a `maxItems` budget, and how many
 * items to keep at each end, returns which items remain visible, which are hidden behind the
 * overflow menu, and where the collapsed gap sits.
 *
 * Pulled out of `<Breadcrumbs>` into a standalone function so it's table-testable in isolation
 * (matches the `useTabsKeyboard` / `stackChildrenWithDivider` convention — the moment a small
 * pure helper has more than a couple of branches we test it without the React shell).
 *
 * Rules:
 *  - `maxItems === undefined` or `items.length <= maxItems` → everything visible, no collapse.
 *  - `before + after + 1` (the +1 is the overflow trigger itself) must still fit under `maxItems`
 *    or the function returns everything visible (no value in collapsing if the overflow trigger
 *    would not actually save space).
 *  - Boundaries are clamped to `[0, items.length]` so consumers can pass over-generous values
 *    without runtime errors.
 */
export interface ComputeVisibleArgs<T> {
  items: T[];
  maxItems?: number | undefined;
  itemsBeforeCollapse?: number | undefined;
  itemsAfterCollapse?: number | undefined;
}

export interface ComputeVisibleResult<T> {
  /** Items kept at the start (left side). */
  before: T[];
  /** Items kept at the end (right side). */
  after: T[];
  /** Items removed from the visible row — surfaced through the overflow menu. */
  hidden: T[];
  /** Position (in the visible row) where the overflow trigger should be inserted; `null` if no collapse. */
  collapsedAt: number | null;
}

export function computeVisibleItems<T>({
  items,
  maxItems,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 1,
}: ComputeVisibleArgs<T>): ComputeVisibleResult<T> {
  // No budget or already within budget → no collapse.
  if (maxItems === undefined || items.length <= maxItems) {
    return { before: items.slice(), after: [], hidden: [], collapsedAt: null };
  }

  // Clamp the requested before / after into [0, items.length]. Negative or NaN values become 0;
  // values larger than the array become the array length.
  const safeBefore = Math.max(0, Math.min(itemsBeforeCollapse | 0, items.length));
  const safeAfter = Math.max(0, Math.min(itemsAfterCollapse | 0, items.length - safeBefore));

  // If the overflow trigger wouldn't save any visible slots (e.g. before+after+1 >= items.length
  // or >= maxItems), fall back to "no collapse" — collapsing for zero gain hurts the user.
  if (safeBefore + safeAfter + 1 >= items.length) {
    return { before: items.slice(), after: [], hidden: [], collapsedAt: null };
  }

  const before = items.slice(0, safeBefore);
  const after = safeAfter === 0 ? [] : items.slice(items.length - safeAfter);
  const hidden = items.slice(safeBefore, items.length - safeAfter);

  return { before, after, hidden, collapsedAt: before.length };
}
