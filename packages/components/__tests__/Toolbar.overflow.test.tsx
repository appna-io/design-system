import { describe, expect, it } from 'vitest';

import { measureOverflowCount } from '../src/Toolbar';

/**
 * Pure measurement function — covered exhaustively here without a live ResizeObserver. The
 * React glue (`useToolbarOverflow`) is exercised end-to-end as part of the smoke render in
 * `Toolbar.test.tsx`; this file focuses on the math.
 */

function makeContainer(itemWidths: number[]): HTMLElement {
  const container = document.createElement('div');
  for (const w of itemWidths) {
    const child = document.createElement('div');
    // jsdom doesn't compute layout — stub `offsetWidth` directly so the resolver has stable
    // numbers to walk. Real DOM consumers get `offsetWidth` from the browser.
    Object.defineProperty(child, 'offsetWidth', { value: w, configurable: true });
    container.appendChild(child);
  }
  return container;
}

describe('measureOverflowCount', () => {
  it('returns 0 when all items fit', () => {
    const container = makeContainer([50, 50, 50]);
    const count = measureOverflowCount({
      itemsContainer: container,
      availableWidth: 200,
      reservedTriggerWidth: 30,
      gap: 4,
    });
    expect(count).toBe(0);
  });

  it('returns the count of trailing items that do not fit', () => {
    // 4 items × 50 + 3 gaps × 4 = 212px. Available 120px, trigger 30px → budget 90px.
    // 50 fits (50 ≤ 90). 50 + 4 + 50 = 104 > 90 → 2nd item overflows.
    const container = makeContainer([50, 50, 50, 50]);
    const count = measureOverflowCount({
      itemsContainer: container,
      availableWidth: 120,
      reservedTriggerWidth: 30,
      gap: 4,
    });
    expect(count).toBe(3);
  });

  it('handles 0 items', () => {
    const container = makeContainer([]);
    const count = measureOverflowCount({
      itemsContainer: container,
      availableWidth: 100,
      reservedTriggerWidth: 30,
      gap: 4,
    });
    expect(count).toBe(0);
  });

  it('returns all items as overflow when availableWidth is 0', () => {
    const container = makeContainer([50, 50]);
    const count = measureOverflowCount({
      itemsContainer: container,
      availableWidth: 0,
      reservedTriggerWidth: 30,
      gap: 4,
    });
    expect(count).toBe(2);
  });

  it('returns all items as overflow when the trigger alone exceeds available width', () => {
    const container = makeContainer([50, 50]);
    const count = measureOverflowCount({
      itemsContainer: container,
      availableWidth: 20,
      reservedTriggerWidth: 30,
      gap: 4,
    });
    expect(count).toBe(2);
  });

  it('does NOT show overflow when the items fit exactly within available width (no reserved)', () => {
    // Exactly 100px (50+50) fits within 100px available; we never enter the pessimistic pass.
    const container = makeContainer([50, 50]);
    const count = measureOverflowCount({
      itemsContainer: container,
      availableWidth: 100,
      reservedTriggerWidth: 30,
      gap: 0,
    });
    expect(count).toBe(0);
  });

  it('respects gap when computing total width', () => {
    // 2 items × 50 + 1 gap × 10 = 110. Available 100 → does not fit optimistically.
    // Budget 100 - 30 = 70. First item 50 ≤ 70. Second item 50 + 10 + 50 = 110 > 70 → overflow.
    const container = makeContainer([50, 50]);
    const count = measureOverflowCount({
      itemsContainer: container,
      availableWidth: 100,
      reservedTriggerWidth: 30,
      gap: 10,
    });
    expect(count).toBe(1);
  });
});