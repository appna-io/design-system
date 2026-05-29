import { describe, expect, it } from 'vitest';

import { resolveNextToolbarIndex } from '../src/Toolbar';

function makeItems(count: number): HTMLElement[] {
  return Array.from({ length: count }, (_, i) => {
    const el = document.createElement('button');
    el.textContent = `item-${i}`;
    return el;
  });
}

describe('resolveNextToolbarIndex — horizontal LTR', () => {
  const items = makeItems(3);

  it('ArrowRight moves to the next item', () => {
    const next = resolveNextToolbarIndex({
      items,
      focused: items[0]!,
      key: 'ArrowRight',
      orientation: 'horizontal',
      isRtl: false,
      loop: true,
    });
    expect(next).toBe(1);
  });

  it('ArrowLeft moves to the previous item', () => {
    const next = resolveNextToolbarIndex({
      items,
      focused: items[1]!,
      key: 'ArrowLeft',
      orientation: 'horizontal',
      isRtl: false,
      loop: true,
    });
    expect(next).toBe(0);
  });

  it('ArrowRight wraps when loop=true and at end', () => {
    const next = resolveNextToolbarIndex({
      items,
      focused: items[2]!,
      key: 'ArrowRight',
      orientation: 'horizontal',
      isRtl: false,
      loop: true,
    });
    expect(next).toBe(0);
  });

  it('ArrowRight clamps when loop=false and at end', () => {
    const next = resolveNextToolbarIndex({
      items,
      focused: items[2]!,
      key: 'ArrowRight',
      orientation: 'horizontal',
      isRtl: false,
      loop: false,
    });
    expect(next).toBe(2);
  });

  it('ArrowLeft wraps from start when loop=true', () => {
    const next = resolveNextToolbarIndex({
      items,
      focused: items[0]!,
      key: 'ArrowLeft',
      orientation: 'horizontal',
      isRtl: false,
      loop: true,
    });
    expect(next).toBe(2);
  });

  it('Home jumps to the first item', () => {
    const next = resolveNextToolbarIndex({
      items,
      focused: items[2]!,
      key: 'Home',
      orientation: 'horizontal',
      isRtl: false,
      loop: false,
    });
    expect(next).toBe(0);
  });

  it('End jumps to the last item', () => {
    const next = resolveNextToolbarIndex({
      items,
      focused: items[0]!,
      key: 'End',
      orientation: 'horizontal',
      isRtl: false,
      loop: false,
    });
    expect(next).toBe(2);
  });

  it('returns -1 for unrelated keys (Tab, Enter, etc.)', () => {
    expect(
      resolveNextToolbarIndex({
        items,
        focused: items[0]!,
        key: 'Tab',
        orientation: 'horizontal',
        isRtl: false,
        loop: true,
      }),
    ).toBe(-1);
    expect(
      resolveNextToolbarIndex({
        items,
        focused: items[0]!,
        key: 'Enter',
        orientation: 'horizontal',
        isRtl: false,
        loop: true,
      }),
    ).toBe(-1);
  });
});

describe('resolveNextToolbarIndex — horizontal RTL', () => {
  const items = makeItems(3);

  it('ArrowRight moves backwards in RTL', () => {
    const next = resolveNextToolbarIndex({
      items,
      focused: items[1]!,
      key: 'ArrowRight',
      orientation: 'horizontal',
      isRtl: true,
      loop: true,
    });
    expect(next).toBe(0);
  });

  it('ArrowLeft moves forwards in RTL', () => {
    const next = resolveNextToolbarIndex({
      items,
      focused: items[1]!,
      key: 'ArrowLeft',
      orientation: 'horizontal',
      isRtl: true,
      loop: true,
    });
    expect(next).toBe(2);
  });
});

describe('resolveNextToolbarIndex — vertical', () => {
  const items = makeItems(3);

  it('ArrowDown moves to the next item', () => {
    const next = resolveNextToolbarIndex({
      items,
      focused: items[0]!,
      key: 'ArrowDown',
      orientation: 'vertical',
      isRtl: false,
      loop: true,
    });
    expect(next).toBe(1);
  });

  it('ArrowUp moves to the previous item', () => {
    const next = resolveNextToolbarIndex({
      items,
      focused: items[1]!,
      key: 'ArrowUp',
      orientation: 'vertical',
      isRtl: false,
      loop: true,
    });
    expect(next).toBe(0);
  });

  it('ArrowLeft / ArrowRight do nothing in vertical mode', () => {
    expect(
      resolveNextToolbarIndex({
        items,
        focused: items[0]!,
        key: 'ArrowLeft',
        orientation: 'vertical',
        isRtl: false,
        loop: true,
      }),
    ).toBe(-1);
    expect(
      resolveNextToolbarIndex({
        items,
        focused: items[0]!,
        key: 'ArrowRight',
        orientation: 'vertical',
        isRtl: false,
        loop: true,
      }),
    ).toBe(-1);
  });

  it('ArrowDown / ArrowUp do nothing in horizontal mode', () => {
    expect(
      resolveNextToolbarIndex({
        items,
        focused: items[0]!,
        key: 'ArrowDown',
        orientation: 'horizontal',
        isRtl: false,
        loop: true,
      }),
    ).toBe(-1);
  });
});

describe('resolveNextToolbarIndex — edge cases', () => {
  it('handles empty item list gracefully', () => {
    const next = resolveNextToolbarIndex({
      items: [],
      focused: null,
      key: 'ArrowRight',
      orientation: 'horizontal',
      isRtl: false,
      loop: true,
    });
    expect(next).toBe(-1);
  });

  it('treats missing focused element as start position', () => {
    const items = makeItems(3);
    const next = resolveNextToolbarIndex({
      items,
      focused: null,
      key: 'ArrowRight',
      orientation: 'horizontal',
      isRtl: false,
      loop: true,
    });
    expect(next).toBe(1);
  });

  it('resolves focus living on a descendant of an item', () => {
    const items = makeItems(3);
    const inner = document.createElement('span');
    items[1]!.appendChild(inner);
    const next = resolveNextToolbarIndex({
      items,
      focused: inner,
      key: 'ArrowRight',
      orientation: 'horizontal',
      isRtl: false,
      loop: true,
    });
    expect(next).toBe(2);
  });
});
