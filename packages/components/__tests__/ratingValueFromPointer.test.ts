import { describe, expect, it } from 'vitest';

import { ratingValueFromPointer } from '../src/Rating/ratingValueFromPointer';

const rect = { left: 0, width: 200 };

describe('ratingValueFromPointer — LTR · whole-step', () => {
  it('clicking the leftmost pixel registers 1 (never 0)', () => {
    expect(
      ratingValueFromPointer({ pointerX: 0, rect, max: 5, precision: 1, dir: 'ltr' }),
    ).toBe(1);
  });

  it('uses Math.ceil so any pixel of star N maps to value N', () => {
    expect(
      ratingValueFromPointer({ pointerX: 10, rect, max: 5, precision: 1, dir: 'ltr' }),
    ).toBe(1);
    expect(
      ratingValueFromPointer({ pointerX: 80, rect, max: 5, precision: 1, dir: 'ltr' }),
    ).toBe(2);
    expect(
      ratingValueFromPointer({ pointerX: 199, rect, max: 5, precision: 1, dir: 'ltr' }),
    ).toBe(5);
  });

  it('clamps pointer beyond the right edge to max', () => {
    expect(
      ratingValueFromPointer({ pointerX: 5000, rect, max: 5, precision: 1, dir: 'ltr' }),
    ).toBe(5);
  });
});

describe('ratingValueFromPointer — LTR · half-step', () => {
  it('snaps to 0.5 grid with a floor of 0.5', () => {
    expect(
      ratingValueFromPointer({ pointerX: 1, rect, max: 5, precision: 0.5, dir: 'ltr' }),
    ).toBe(0.5);
    expect(
      ratingValueFromPointer({ pointerX: 20, rect, max: 5, precision: 0.5, dir: 'ltr' }),
    ).toBe(0.5);
    expect(
      ratingValueFromPointer({ pointerX: 120, rect, max: 5, precision: 0.5, dir: 'ltr' }),
    ).toBe(3);
    expect(
      ratingValueFromPointer({ pointerX: 140, rect, max: 5, precision: 0.5, dir: 'ltr' }),
    ).toBe(3.5);
  });

  it('clamps to max at the right edge', () => {
    expect(
      ratingValueFromPointer({ pointerX: 200, rect, max: 5, precision: 0.5, dir: 'ltr' }),
    ).toBe(5);
  });
});

describe('ratingValueFromPointer — RTL', () => {
  it('mirrors x so the right edge is the lowest value', () => {
    expect(
      ratingValueFromPointer({ pointerX: 199, rect, max: 5, precision: 1, dir: 'rtl' }),
    ).toBe(1);
    expect(
      ratingValueFromPointer({ pointerX: 1, rect, max: 5, precision: 1, dir: 'rtl' }),
    ).toBe(5);
  });

  it('half-step on right half of rect maps to lower values in RTL', () => {
    expect(
      ratingValueFromPointer({ pointerX: 180, rect, max: 5, precision: 0.5, dir: 'rtl' }),
    ).toBe(0.5);
    expect(
      ratingValueFromPointer({ pointerX: 80, rect, max: 5, precision: 0.5, dir: 'rtl' }),
    ).toBe(3);
  });
});

describe('ratingValueFromPointer — degenerate input', () => {
  it('returns the minimum value when width is 0', () => {
    expect(
      ratingValueFromPointer({
        pointerX: 0,
        rect: { left: 0, width: 0 },
        max: 5,
        precision: 1,
        dir: 'ltr',
      }),
    ).toBe(1);
    expect(
      ratingValueFromPointer({
        pointerX: 0,
        rect: { left: 0, width: 0 },
        max: 5,
        precision: 0.5,
        dir: 'ltr',
      }),
    ).toBe(0.5);
  });
});
