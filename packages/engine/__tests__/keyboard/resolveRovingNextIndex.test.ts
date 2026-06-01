import { describe, expect, it } from 'vitest';

import {
  findNextEnabledIndex,
  indexOfRovingId,
  resolveRovingNextIndex,
  type RovingItem,
} from '../../src/keyboard/_rovingShared';

/**
 * Build an items array of the requested length, all enabled, ids `'a'..`. Convenience for the
 * many table-driven cases below.
 */
function items(n: number, disabled: number[] = []): RovingItem[] {
  const out: RovingItem[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ id: String.fromCharCode(0x61 + i), disabled: disabled.includes(i) });
  }
  return out;
}

describe('resolveRovingNextIndex — horizontal axis (LTR)', () => {
  const orientation = 'horizontal';
  const isRtl = false;
  const set = items(4); // a b c d

  it.each([
    // key, fromIndex, loop, expected
    ['ArrowRight', 0, true, 1],
    ['ArrowRight', 1, true, 2],
    ['ArrowRight', 3, true, 0], // loop -> head
    ['ArrowRight', 3, false, 3], // clamp at boundary
    ['ArrowLeft', 1, true, 0],
    ['ArrowLeft', 0, true, 3], // loop -> tail
    ['ArrowLeft', 0, false, 0], // clamp at boundary
    ['Home', 2, true, 0],
    ['Home', 2, false, 0],
    ['End', 1, true, 3],
    ['End', 1, false, 3],
  ])('key=%s from=%d loop=%s -> %d', (key, fromIndex, loop, expected) => {
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: fromIndex as number,
        key: key as string,
        orientation,
        isRtl,
        loop: loop as boolean,
      }),
    ).toBe(expected);
  });

  it('ignores ArrowUp / ArrowDown on horizontal axis', () => {
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 1,
        key: 'ArrowUp',
        orientation,
        isRtl,
        loop: true,
      }),
    ).toBe(-1);
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 1,
        key: 'ArrowDown',
        orientation,
        isRtl,
        loop: true,
      }),
    ).toBe(-1);
  });
});

describe('resolveRovingNextIndex — horizontal axis (RTL flips Left/Right)', () => {
  const orientation = 'horizontal';
  const isRtl = true;
  const set = items(4);

  it.each([
    ['ArrowRight', 1, true, 0], // RTL: right means backwards
    ['ArrowRight', 0, true, 3], // wrap to tail
    ['ArrowLeft', 1, true, 2], // RTL: left means forwards
    ['ArrowLeft', 3, true, 0], // wrap to head
    ['ArrowLeft', 3, false, 3], // clamp under no-loop
    ['ArrowRight', 0, false, 0], // clamp under no-loop
  ])('key=%s from=%d loop=%s -> %d', (key, fromIndex, loop, expected) => {
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: fromIndex as number,
        key: key as string,
        orientation,
        isRtl,
        loop: loop as boolean,
      }),
    ).toBe(expected);
  });
});

describe('resolveRovingNextIndex — vertical axis', () => {
  const orientation = 'vertical';
  const set = items(4);

  it.each([
    // ArrowDown / ArrowUp accepted; ArrowLeft / ArrowRight ignored regardless of RTL.
    ['ArrowDown', 0, false, true, 1], // RTL has no effect on vertical
    ['ArrowDown', 3, true, false, 0],
    ['ArrowDown', 3, false, false, 3],
    ['ArrowUp', 0, true, false, 3],
    ['ArrowUp', 0, false, false, 0],
    ['ArrowUp', 2, true, false, 1],
    ['Home', 2, true, false, 0],
    ['End', 0, false, false, 3],
  ])('key=%s from=%d loop=%s rtl=%s -> %d', (key, fromIndex, loop, rtl, expected) => {
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: fromIndex as number,
        key: key as string,
        orientation,
        isRtl: rtl as boolean,
        loop: loop as boolean,
      }),
    ).toBe(expected);
  });

  it('ignores ArrowLeft / ArrowRight on vertical axis', () => {
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 1,
        key: 'ArrowLeft',
        orientation,
        isRtl: false,
        loop: true,
      }),
    ).toBe(-1);
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 1,
        key: 'ArrowRight',
        orientation,
        isRtl: true,
        loop: true,
      }),
    ).toBe(-1);
  });
});

describe('resolveRovingNextIndex — both axes', () => {
  const orientation = 'both';
  const set = items(4);

  it('accepts all four arrows and steps linearly', () => {
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 0,
        key: 'ArrowRight',
        orientation,
        isRtl: false,
        loop: true,
      }),
    ).toBe(1);
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 0,
        key: 'ArrowDown',
        orientation,
        isRtl: false,
        loop: true,
      }),
    ).toBe(1);
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 2,
        key: 'ArrowUp',
        orientation,
        isRtl: false,
        loop: true,
      }),
    ).toBe(1);
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 2,
        key: 'ArrowLeft',
        orientation,
        isRtl: false,
        loop: true,
      }),
    ).toBe(1);
  });

  it('still flips Left/Right under RTL but leaves Up/Down alone', () => {
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 1,
        key: 'ArrowRight',
        orientation,
        isRtl: true,
        loop: true,
      }),
    ).toBe(0);
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 1,
        key: 'ArrowDown',
        orientation,
        isRtl: true,
        loop: true,
      }),
    ).toBe(2);
  });
});

describe('resolveRovingNextIndex — disabled item handling', () => {
  it('skips disabled items when stepping forward', () => {
    const set = items(5, [1, 2]); // a [b] [c] d e
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 0,
        key: 'ArrowRight',
        orientation: 'horizontal',
        isRtl: false,
        loop: true,
      }),
    ).toBe(3);
  });

  it('skips disabled items when stepping backward', () => {
    const set = items(5, [1, 2]); // a [b] [c] d e
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 3,
        key: 'ArrowLeft',
        orientation: 'horizontal',
        isRtl: false,
        loop: true,
      }),
    ).toBe(0);
  });

  it('Home / End land on the first / last *enabled* item', () => {
    const set = items(5, [0, 4]); // [a] b c d [e]
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 2,
        key: 'Home',
        orientation: 'horizontal',
        isRtl: false,
        loop: true,
      }),
    ).toBe(1);
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 2,
        key: 'End',
        orientation: 'horizontal',
        isRtl: false,
        loop: true,
      }),
    ).toBe(3);
  });

  it('returns the starting index when every item is disabled', () => {
    const set = items(3, [0, 1, 2]);
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: 1,
        key: 'ArrowRight',
        orientation: 'horizontal',
        isRtl: false,
        loop: true,
      }),
    ).toBe(1);
  });

  it('returns -1 on empty list', () => {
    expect(
      resolveRovingNextIndex({
        items: [],
        focusedIndex: -1,
        key: 'ArrowRight',
        orientation: 'horizontal',
        isRtl: false,
        loop: true,
      }),
    ).toBe(-1);
  });
});

describe('resolveRovingNextIndex — focusedIndex edge cases', () => {
  it('treats focusedIndex=-1 as index 0 starting position', () => {
    const set = items(3);
    expect(
      resolveRovingNextIndex({
        items: set,
        focusedIndex: -1,
        key: 'ArrowRight',
        orientation: 'horizontal',
        isRtl: false,
        loop: true,
      }),
    ).toBe(1);
  });

  it('returns -1 for unknown keys', () => {
    const set = items(3);
    for (const key of ['Escape', 'Tab', 'Enter', ' ', 'a', 'F1', '']) {
      expect(
        resolveRovingNextIndex({
          items: set,
          focusedIndex: 0,
          key,
          orientation: 'both',
          isRtl: false,
          loop: true,
        }),
      ).toBe(-1);
    }
  });
});

describe('findNextEnabledIndex direct unit tests', () => {
  it('walks forward with loop and skips disabled', () => {
    const set = items(4, [1]);
    expect(findNextEnabledIndex(set, 0, 1, true)).toBe(2);
    expect(findNextEnabledIndex(set, 3, 1, true)).toBe(0);
  });

  it('walks backward with loop and skips disabled', () => {
    const set = items(4, [2]);
    expect(findNextEnabledIndex(set, 3, -1, true)).toBe(1);
    expect(findNextEnabledIndex(set, 0, -1, true)).toBe(3);
  });

  it('without loop clamps to the boundary enabled item', () => {
    const set = items(4, [0]); // [a] b c d
    expect(findNextEnabledIndex(set, 1, -1, false)).toBe(1); // can't reach disabled 0; stay
    const set2 = items(4, [3]); // a b c [d]
    expect(findNextEnabledIndex(set2, 2, 1, false)).toBe(2);
  });

  it('returns -1 on empty', () => {
    expect(findNextEnabledIndex([], 0, 1, true)).toBe(-1);
  });
});

describe('indexOfRovingId', () => {
  it('finds string ids', () => {
    const set = items(3);
    expect(indexOfRovingId(set, 'b')).toBe(1);
    expect(indexOfRovingId(set, 'zz')).toBe(-1);
    expect(indexOfRovingId(set, null)).toBe(-1);
  });

  it('finds HTMLElement ids by reference', () => {
    const el1 = {} as HTMLElement;
    const el2 = {} as HTMLElement;
    const set: RovingItem[] = [{ id: el1 }, { id: el2 }];
    expect(indexOfRovingId(set, el1)).toBe(0);
    expect(indexOfRovingId(set, el2)).toBe(1);
    expect(indexOfRovingId(set, {} as HTMLElement)).toBe(-1);
  });
});