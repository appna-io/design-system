import { describe, expect, it } from 'vitest';

import { computePageWindow } from '../src/Pagination/computePageWindow';
import type { PageItem } from '../src/Pagination/Pagination.types';

/* -------------------------------------------------------------------------- */
/*  Plan reference table                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Reference cases for the MUI-derived window contract. Each case is named
 * `pageIndex / pageCount / siblingCount / boundaryCount → output`.
 *
 * The algorithm keeps a sliding window of constant length around the current
 * page, so being near a boundary shifts (rather than shrinks) the window.
 * That matches MUI's `usePagination` and TanStack's pagination helpers.
 */
describe('computePageWindow — reference table', () => {
  const cases: Array<{
    label: string;
    in: { pageIndex: number; pageCount: number; siblingCount?: number; boundaryCount?: number };
    out: PageItem[];
  }> = [
    {
      label: '0 / 5 / 1 / 1 — window covers all pages',
      in: { pageIndex: 0, pageCount: 5, siblingCount: 1, boundaryCount: 1 },
      out: [1, 2, 3, 4, 5],
    },
    {
      label: '4 / 10 / 1 / 1 — both ellipses',
      in: { pageIndex: 4, pageCount: 10, siblingCount: 1, boundaryCount: 1 },
      out: [1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 10],
    },
    {
      label: '0 / 10 / 1 / 1 — current at first, window slides right',
      in: { pageIndex: 0, pageCount: 10, siblingCount: 1, boundaryCount: 1 },
      out: [1, 2, 3, 4, 5, 'ellipsis-end', 10],
    },
    {
      label: '9 / 10 / 1 / 1 — current at last, window slides left',
      in: { pageIndex: 9, pageCount: 10, siblingCount: 1, boundaryCount: 1 },
      out: [1, 'ellipsis-start', 6, 7, 8, 9, 10],
    },
    {
      label: '4 / 10 / 2 / 1 — wider sibling window',
      in: { pageIndex: 4, pageCount: 10, siblingCount: 2, boundaryCount: 1 },
      out: [1, 2, 3, 4, 5, 6, 7, 'ellipsis-end', 10],
    },
    {
      label: '4 / 5 / 1 / 2 — window covers all, no ellipsis',
      in: { pageIndex: 4, pageCount: 5, siblingCount: 1, boundaryCount: 2 },
      out: [1, 2, 3, 4, 5],
    },
    {
      label: '4 / 10 / 0 / 0 — no boundaries, no siblings — window of just current',
      in: { pageIndex: 4, pageCount: 10, siblingCount: 0, boundaryCount: 0 },
      out: ['ellipsis-start', 5, 'ellipsis-end'],
    },
    {
      label: '5 / 11 / 1 / 1 — symmetric middle',
      in: { pageIndex: 5, pageCount: 11, siblingCount: 1, boundaryCount: 1 },
      out: [1, 'ellipsis-start', 5, 6, 7, 'ellipsis-end', 11],
    },
  ];

  for (const tc of cases) {
    it(tc.label, () => {
      expect(computePageWindow(tc.in)).toEqual(tc.out);
    });
  }
});

/* -------------------------------------------------------------------------- */
/*  Edge cases                                                                 */
/* -------------------------------------------------------------------------- */

describe('computePageWindow — edge cases', () => {
  it('returns empty array when pageCount is 0', () => {
    expect(computePageWindow({ pageIndex: 0, pageCount: 0 })).toEqual([]);
  });

  it('returns [1] when there is exactly one page', () => {
    expect(computePageWindow({ pageIndex: 0, pageCount: 1 })).toEqual([1]);
  });

  it('clamps out-of-bounds pageIndex into the legal range', () => {
    const overflow = computePageWindow({ pageIndex: 99, pageCount: 5 });
    const last = computePageWindow({ pageIndex: 4, pageCount: 5 });
    expect(overflow).toEqual(last);
  });

  it('treats negative pageIndex as 0', () => {
    const neg = computePageWindow({ pageIndex: -10, pageCount: 5 });
    const first = computePageWindow({ pageIndex: 0, pageCount: 5 });
    expect(neg).toEqual(first);
  });

  it('treats negative siblingCount as 0', () => {
    const neg = computePageWindow({ pageIndex: 4, pageCount: 10, siblingCount: -3, boundaryCount: 1 });
    const zero = computePageWindow({ pageIndex: 4, pageCount: 10, siblingCount: 0, boundaryCount: 1 });
    expect(neg).toEqual(zero);
  });

  it('replaces a single-page "gap of one" with the page number itself', () => {
    // Without the gap-of-one rule we would see `[1, 'ellipsis-start', 3, 4, 5, ...]`
    // — but that's a strictly worse UX than `[1, 2, 3, 4, 5, ...]`.
    const result = computePageWindow({
      pageIndex: 3,
      pageCount: 10,
      siblingCount: 1,
      boundaryCount: 1,
    });
    expect(result).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 10]);
  });

  it('renders boundary + current with no overlap when boundaryCount is large', () => {
    const result = computePageWindow({
      pageIndex: 9,
      pageCount: 20,
      siblingCount: 1,
      boundaryCount: 3,
    });
    expect(result).toEqual([1, 2, 3, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 18, 19, 20]);
  });
});

/* -------------------------------------------------------------------------- */
/*  Invariants (property-based-ish — exhaustive over a small grid)             */
/* -------------------------------------------------------------------------- */

describe('computePageWindow — invariants', () => {
  const cases: Array<{ pageCount: number; sibling: number; boundary: number }> = [];
  for (const pageCount of [1, 2, 3, 5, 8, 13, 21, 50, 100]) {
    for (const sibling of [0, 1, 2, 3]) {
      for (const boundary of [0, 1, 2]) {
        cases.push({ pageCount, sibling, boundary });
      }
    }
  }

  it('the current page is always present (numeric or replaced) for every config', () => {
    for (const { pageCount, sibling, boundary } of cases) {
      for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        const items = computePageWindow({
          pageIndex,
          pageCount,
          siblingCount: sibling,
          boundaryCount: boundary,
        });
        const currentLabel = pageIndex + 1;
        expect(
          items.includes(currentLabel),
          `current page ${currentLabel} missing for pageCount=${pageCount}, sibling=${sibling}, boundary=${boundary}, pageIndex=${pageIndex}; got ${JSON.stringify(items)}`,
        ).toBe(true);
      }
    }
  });

  it('first and last pages are present whenever boundaryCount >= 1', () => {
    for (const { pageCount, sibling } of cases) {
      if (pageCount < 2) continue;
      for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        const items = computePageWindow({
          pageIndex,
          pageCount,
          siblingCount: sibling,
          boundaryCount: 1,
        });
        expect(items[0]).toBe(1);
        expect(items[items.length - 1]).toBe(pageCount);
      }
    }
  });

  it('numeric items are strictly monotonically increasing', () => {
    for (const { pageCount, sibling, boundary } of cases) {
      for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        const items = computePageWindow({
          pageIndex,
          pageCount,
          siblingCount: sibling,
          boundaryCount: boundary,
        });
        let prev = -1;
        for (const item of items) {
          if (typeof item === 'number') {
            expect(item > prev, `expected monotonic; got ${JSON.stringify(items)}`).toBe(true);
            prev = item;
          }
        }
      }
    }
  });

  it('numeric items have no duplicates', () => {
    for (const { pageCount, sibling, boundary } of cases) {
      for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        const items = computePageWindow({
          pageIndex,
          pageCount,
          siblingCount: sibling,
          boundaryCount: boundary,
        });
        const nums = items.filter((i): i is number => typeof i === 'number');
        expect(new Set(nums).size).toBe(nums.length);
      }
    }
  });

  it('two adjacent ellipses never appear', () => {
    for (const { pageCount, sibling, boundary } of cases) {
      for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        const items = computePageWindow({
          pageIndex,
          pageCount,
          siblingCount: sibling,
          boundaryCount: boundary,
        });
        for (let i = 0; i < items.length - 1; i++) {
          const a = items[i];
          const b = items[i + 1];
          if (typeof a !== 'number' && typeof b !== 'number') {
            throw new Error(`adjacent ellipses at index ${i}: ${JSON.stringify(items)}`);
          }
        }
      }
    }
  });
});