import { describe, expect, it } from 'vitest';
import { motionPresets, transitionTokens } from '../src/motion';

describe('transitionTokens', () => {
  it('has duration tokens in seconds', () => {
    expect(transitionTokens.duration.fast).toBeLessThan(transitionTokens.duration.normal);
    expect(transitionTokens.duration.normal).toBeLessThan(transitionTokens.duration.slow);
  });

  it('has named easings', () => {
    expect(transitionTokens.ease.standard).toContain('cubic-bezier');
    expect(transitionTokens.ease.emphasized).toContain('cubic-bezier');
    expect(transitionTokens.ease.linear).toBe('linear');
  });
});

describe('motionPresets', () => {
  it('contains shape-stable preset names', () => {
    expect(motionPresets).toHaveProperty('fadeIn');
    expect(motionPresets).toHaveProperty('scaleIn');
    expect(motionPresets).toHaveProperty('slideInFromBottom');
    expect(motionPresets).toHaveProperty('slideInFromTop');
    expect(motionPresets).toHaveProperty('pressScale');
  });

  it('fadeIn animates opacity', () => {
    expect(motionPresets.fadeIn.initial?.opacity).toBe(0);
    expect(motionPresets.fadeIn.animate?.opacity).toBe(1);
  });

  it('scaleIn combines opacity + scale', () => {
    expect(motionPresets.scaleIn.initial).toMatchObject({ opacity: 0, scale: 0.95 });
    expect(motionPresets.scaleIn.animate).toMatchObject({ opacity: 1, scale: 1 });
  });

  it('pressScale provides whileTap only', () => {
    expect(motionPresets.pressScale.whileTap?.scale).toBe(0.97);
  });
});