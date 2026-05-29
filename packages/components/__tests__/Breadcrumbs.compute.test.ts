import { describe, expect, it } from 'vitest';

import { computeVisibleItems } from '../src/Breadcrumbs';

describe('computeVisibleItems', () => {
  it('returns everything visible when maxItems is undefined', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const result = computeVisibleItems({ items });
    expect(result.before).toEqual(items);
    expect(result.after).toEqual([]);
    expect(result.hidden).toEqual([]);
    expect(result.collapsedAt).toBeNull();
  });

  it('returns everything visible when items fit under maxItems', () => {
    const items = ['a', 'b', 'c'];
    const result = computeVisibleItems({ items, maxItems: 5 });
    expect(result.before).toEqual(items);
    expect(result.hidden).toEqual([]);
    expect(result.collapsedAt).toBeNull();
  });

  it('collapses the middle when over budget', () => {
    const items = ['Home', 'Region', 'Country', 'City', 'Street', 'Address'];
    const result = computeVisibleItems({ items, maxItems: 4 });

    expect(result.before).toEqual(['Home']);
    expect(result.after).toEqual(['Address']);
    expect(result.hidden).toEqual(['Region', 'Country', 'City', 'Street']);
    expect(result.collapsedAt).toBe(1);
  });

  it('honors itemsBeforeCollapse / itemsAfterCollapse', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const result = computeVisibleItems({
      items,
      maxItems: 4,
      itemsBeforeCollapse: 2,
      itemsAfterCollapse: 2,
    });
    expect(result.before).toEqual(['a', 'b']);
    expect(result.after).toEqual(['f', 'g']);
    expect(result.hidden).toEqual(['c', 'd', 'e']);
    expect(result.collapsedAt).toBe(2);
  });

  it('clamps negative before / after to 0', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const result = computeVisibleItems({
      items,
      maxItems: 3,
      itemsBeforeCollapse: -2,
      itemsAfterCollapse: -1,
    });
    expect(result.before).toEqual([]);
    expect(result.after).toEqual([]);
    expect(result.hidden).toEqual(items);
    expect(result.collapsedAt).toBe(0);
  });

  it('clamps over-large before to the array length', () => {
    const items = ['a', 'b', 'c'];
    const result = computeVisibleItems({
      items,
      maxItems: 2,
      itemsBeforeCollapse: 100,
      itemsAfterCollapse: 0,
    });
    // before clamped to 3 -> 0 hidden -> no collapse fallback
    expect(result.collapsedAt).toBeNull();
    expect(result.before).toEqual(items);
  });

  it('falls back to "no collapse" when collapsing would not save any slots', () => {
    const items = ['a', 'b', 'c', 'd'];
    // before(2) + after(1) + 1 trigger = 4 ≥ items.length(4) → no collapse
    const result = computeVisibleItems({
      items,
      maxItems: 3,
      itemsBeforeCollapse: 2,
      itemsAfterCollapse: 1,
    });
    expect(result.collapsedAt).toBeNull();
    expect(result.before).toEqual(items);
  });

  it('handles itemsAfterCollapse = 0 (keeps only leading items + overflow)', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const result = computeVisibleItems({
      items,
      maxItems: 3,
      itemsBeforeCollapse: 1,
      itemsAfterCollapse: 0,
    });
    expect(result.before).toEqual(['a']);
    expect(result.after).toEqual([]);
    expect(result.hidden).toEqual(['b', 'c', 'd', 'e']);
    expect(result.collapsedAt).toBe(1);
  });

  it('returns a defensive shallow copy of items (no aliasing)', () => {
    const items = ['a', 'b', 'c'];
    const result = computeVisibleItems({ items, maxItems: 5 });
    expect(result.before).not.toBe(items);
    result.before.push('mutated');
    expect(items).toEqual(['a', 'b', 'c']);
  });
});
