import { describe, expect, it } from 'vitest';

import { ratingFillFraction } from '../src/Rating/ratingFillFraction';

describe('ratingFillFraction', () => {
  it('returns 0 below the star index', () => {
    expect(ratingFillFraction(0, 0)).toBe(0);
    expect(ratingFillFraction(1, 2)).toBe(0);
    expect(ratingFillFraction(2.49, 3)).toBe(0);
  });

  it('returns 1 fully above the star index', () => {
    expect(ratingFillFraction(5, 0)).toBe(1);
    expect(ratingFillFraction(3, 2)).toBe(1);
    expect(ratingFillFraction(3.71, 0)).toBe(1);
  });

  it('returns the fractional part within the star', () => {
    expect(ratingFillFraction(3.5, 3)).toBe(0.5);
    expect(ratingFillFraction(0.25, 0)).toBe(0.25);
    expect(ratingFillFraction(2.7, 2)).toBeCloseTo(0.7, 5);
    expect(ratingFillFraction(3.71, 3)).toBeCloseTo(0.71, 5);
  });

  it('treats non-finite input as 0 (no NaN leakage)', () => {
    expect(ratingFillFraction(Number.NaN, 0)).toBe(0);
    expect(ratingFillFraction(Number.POSITIVE_INFINITY, 0)).toBe(0);
  });

  it('clamps negative inputs to 0', () => {
    expect(ratingFillFraction(-1, 0)).toBe(0);
    expect(ratingFillFraction(-100, 5)).toBe(0);
  });
});