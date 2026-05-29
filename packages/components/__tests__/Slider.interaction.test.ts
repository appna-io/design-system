import { describe, expect, it } from 'vitest';

import { clampThumb, clampToStep, nearestThumbIndex } from '../src/Slider/clampValue';
import { computeValueFromPointer, valueToPercent } from '../src/Slider/computeValueFromPointer';

describe('clampToStep', () => {
  it('clamps to min when below', () => {
    expect(clampToStep(-5, 0, 100, 1)).toBe(0);
  });

  it('clamps to max when above', () => {
    expect(clampToStep(200, 0, 100, 1)).toBe(100);
  });

  it('snaps to nearest step anchored at min', () => {
    expect(clampToStep(3.4, 0, 100, 1)).toBe(3);
    expect(clampToStep(3.6, 0, 100, 1)).toBe(4);
    expect(clampToStep(7, 0, 100, 5)).toBe(5);
    expect(clampToStep(8, 0, 100, 5)).toBe(10);
  });

  it('anchors step at min, not at zero', () => {
    expect(clampToStep(4, 3, 100, 0.5)).toBe(4);
    expect(clampToStep(3.7, 3, 100, 0.5)).toBe(3.5);
  });

  it('continuous mode (step=null) skips snapping', () => {
    expect(clampToStep(3.4567, 0, 100, null)).toBeCloseTo(3.4567);
    expect(clampToStep(99.9999, 0, 100, null)).toBeCloseTo(99.9999);
  });

  it('treats step=undefined like continuous', () => {
    expect(clampToStep(7.3, 0, 100, undefined)).toBeCloseTo(7.3);
  });

  it('re-clamps after snap when range is not a step multiple', () => {
    expect(clampToStep(9.5, 0, 10, 3)).toBe(9);
    expect(clampToStep(11, 0, 10, 3)).toBe(9);
  });

  it('trims float drift after step arithmetic', () => {
    expect(clampToStep(0.30000000000000004, 0, 1, 0.1)).toBe(0.3);
    expect(clampToStep(0.55, 0, 1, 0.05)).toBe(0.55);
  });

  it('returns min for NaN input', () => {
    expect(clampToStep(Number.NaN, 0, 100, 1)).toBe(0);
  });
});

describe('clampThumb', () => {
  it('moves the active thumb without affecting siblings', () => {
    const next = clampThumb([10, 50, 90], 1, 60, 0, 100, 1, 1);
    expect(next).toEqual([10, 60, 90]);
  });

  it('returns the SAME array reference when the snap is a no-op', () => {
    const original = [10, 50, 90];
    const next = clampThumb(original, 1, 50.4, 0, 100, 1, 1);
    expect(next).toBe(original);
  });

  it('blocks crossing the previous thumb (range minStepsBetweenThumbs=1)', () => {
    const next = clampThumb([20, 80], 1, 10, 0, 100, 1, 1);
    expect(next).toEqual([20, 21]);
  });

  it('blocks crossing the next thumb', () => {
    const next = clampThumb([20, 80], 0, 95, 0, 100, 1, 1);
    expect(next).toEqual([79, 80]);
  });

  it('respects minStepsBetweenThumbs > 1 (each step counts)', () => {
    const next = clampThumb([20, 80], 1, 0, 0, 100, 5, 2);
    expect(next).toEqual([20, 30]);
  });

  it('allows overlap when minStepsBetweenThumbs=0', () => {
    const next = clampThumb([20, 80], 1, 20, 0, 100, 1, 0);
    expect(next).toEqual([20, 20]);
  });

  it('snaps + clamps in one pass', () => {
    const next = clampThumb([10, 50], 0, 200, 0, 100, 5, 1);
    expect(next).toEqual([45, 50]);
  });

  it('continuous mode (step=null) disables minStepsBetweenThumbs gap', () => {
    const next = clampThumb([20, 80], 1, 20.000001, 0, 100, null, 1);
    expect(next[1]).toBeCloseTo(20.000001);
  });

  it('N-thumb (>=3) clamping respects both neighbors', () => {
    const next = clampThumb([10, 30, 60, 90], 1, 100, 0, 100, 1, 1);
    expect(next).toEqual([10, 59, 60, 90]);
  });
});

describe('nearestThumbIndex', () => {
  it('picks the closest thumb', () => {
    expect(nearestThumbIndex([20, 80], 40)).toBe(0);
    expect(nearestThumbIndex([20, 80], 60)).toBe(1);
  });

  it('tie-breaks toward the lowest index', () => {
    expect(nearestThumbIndex([20, 80], 50)).toBe(0);
    expect(nearestThumbIndex([10, 30, 60, 90], 45)).toBe(1);
  });

  it('works for a single-thumb array', () => {
    expect(nearestThumbIndex([42], 1000)).toBe(0);
  });
});

describe('computeValueFromPointer', () => {
  const rect = { left: 100, top: 200, width: 200, height: 100 };

  it('maps horizontal LTR x to value linearly', () => {
    expect(
      computeValueFromPointer({
        clientX: 100,
        clientY: 0,
        trackRect: rect,
        min: 0,
        max: 100,
        step: 1,
        orientation: 'horizontal',
        dir: 'ltr',
      }),
    ).toBe(0);
    expect(
      computeValueFromPointer({
        clientX: 200,
        clientY: 0,
        trackRect: rect,
        min: 0,
        max: 100,
        step: 1,
        orientation: 'horizontal',
        dir: 'ltr',
      }),
    ).toBe(50);
    expect(
      computeValueFromPointer({
        clientX: 300,
        clientY: 0,
        trackRect: rect,
        min: 0,
        max: 100,
        step: 1,
        orientation: 'horizontal',
        dir: 'ltr',
      }),
    ).toBe(100);
  });

  it('mirrors horizontal RTL x', () => {
    expect(
      computeValueFromPointer({
        clientX: 100,
        clientY: 0,
        trackRect: rect,
        min: 0,
        max: 100,
        step: 1,
        orientation: 'horizontal',
        dir: 'rtl',
      }),
    ).toBe(100);
    expect(
      computeValueFromPointer({
        clientX: 300,
        clientY: 0,
        trackRect: rect,
        min: 0,
        max: 100,
        step: 1,
        orientation: 'horizontal',
        dir: 'rtl',
      }),
    ).toBe(0);
  });

  it('vertical: top is max in both LTR and RTL', () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      expect(
        computeValueFromPointer({
          clientX: 0,
          clientY: 200,
          trackRect: rect,
          min: 0,
          max: 100,
          step: 1,
          orientation: 'vertical',
          dir,
        }),
      ).toBe(100);
      expect(
        computeValueFromPointer({
          clientX: 0,
          clientY: 300,
          trackRect: rect,
          min: 0,
          max: 100,
          step: 1,
          orientation: 'vertical',
          dir,
        }),
      ).toBe(0);
    }
  });

  it('snaps to step on the way through', () => {
    expect(
      computeValueFromPointer({
        clientX: 207,
        clientY: 0,
        trackRect: rect,
        min: 0,
        max: 100,
        step: 5,
        orientation: 'horizontal',
        dir: 'ltr',
      }),
    ).toBe(55);
  });

  it('clamps when the pointer is outside the track rect', () => {
    expect(
      computeValueFromPointer({
        clientX: -500,
        clientY: 0,
        trackRect: rect,
        min: 0,
        max: 100,
        step: 1,
        orientation: 'horizontal',
        dir: 'ltr',
      }),
    ).toBe(0);
    expect(
      computeValueFromPointer({
        clientX: 99999,
        clientY: 0,
        trackRect: rect,
        min: 0,
        max: 100,
        step: 1,
        orientation: 'horizontal',
        dir: 'ltr',
      }),
    ).toBe(100);
  });

  it('handles non-zero min and arbitrary max', () => {
    expect(
      computeValueFromPointer({
        clientX: 200,
        clientY: 0,
        trackRect: rect,
        min: -50,
        max: 50,
        step: 1,
        orientation: 'horizontal',
        dir: 'ltr',
      }),
    ).toBe(0);
  });
});

describe('valueToPercent', () => {
  it('maps min to 0% and max to 100%', () => {
    expect(valueToPercent(0, 0, 100)).toBe(0);
    expect(valueToPercent(100, 0, 100)).toBe(100);
  });

  it('linearly maps values in between', () => {
    expect(valueToPercent(25, 0, 100)).toBe(25);
    expect(valueToPercent(50, 0, 100)).toBe(50);
  });

  it('handles non-zero min', () => {
    expect(valueToPercent(0, -50, 50)).toBe(50);
    expect(valueToPercent(-25, -50, 50)).toBe(25);
  });

  it('clamps inputs outside the range', () => {
    expect(valueToPercent(-10, 0, 100)).toBe(0);
    expect(valueToPercent(110, 0, 100)).toBe(100);
  });

  it('returns 0 for a zero-width range (defensive)', () => {
    expect(valueToPercent(5, 5, 5)).toBe(0);
  });
});
