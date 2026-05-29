import { describe, expect, it } from 'vitest';

import { clampIndex, computeSlideStep, computeSlideTarget } from '../src/Carousel/computeSlideStep';

describe('clampIndex', () => {
  it('clamps below 0 to 0 when loop=false', () => {
    expect(clampIndex({ index: -1, count: 5, loop: false })).toBe(0);
  });

  it('clamps above count-1 to count-1 when loop=false', () => {
    expect(clampIndex({ index: 7, count: 5, loop: false })).toBe(4);
  });

  it('wraps below 0 to count-1 when loop=true', () => {
    expect(clampIndex({ index: -1, count: 5, loop: true })).toBe(4);
  });

  it('wraps above count-1 to 0 when loop=true', () => {
    expect(clampIndex({ index: 5, count: 5, loop: true })).toBe(0);
  });

  it('returns 0 for count <= 0', () => {
    expect(clampIndex({ index: 3, count: 0, loop: false })).toBe(0);
  });

  it('wraps multi-step over- and under-flow', () => {
    expect(clampIndex({ index: 12, count: 5, loop: true })).toBe(2);
    expect(clampIndex({ index: -7, count: 5, loop: true })).toBe(3);
  });
});

describe('computeSlideStep', () => {
  it('returns viewportSize for 1-up layout with no gap', () => {
    expect(computeSlideStep({ viewportSize: 400, slidesPerView: 1, gapPx: 0 })).toBe(400);
  });

  it('divides by slidesPerView and adds one gap', () => {
    expect(computeSlideStep({ viewportSize: 300, slidesPerView: 3, gapPx: 0 })).toBe(100);
    expect(computeSlideStep({ viewportSize: 320, slidesPerView: 3, gapPx: 10 })).toBe(100 + 10);
  });

  it('returns 0 for slidesPerView <= 0', () => {
    expect(computeSlideStep({ viewportSize: 400, slidesPerView: 0, gapPx: 0 })).toBe(0);
  });
});

describe('computeSlideTarget', () => {
  it('multiplies slideStepPx by index', () => {
    expect(computeSlideTarget({ index: 0, slideStepPx: 100 })).toBe(0);
    expect(computeSlideTarget({ index: 3, slideStepPx: 100 })).toBe(300);
  });

  it('never returns negative offsets', () => {
    expect(computeSlideTarget({ index: -2, slideStepPx: 100 })).toBe(0);
  });
});
