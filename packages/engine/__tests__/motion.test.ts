import { describe, expect, it } from 'vitest';
import {
  defaultViewport,
  motionPresets,
  resolveTransition,
  toMotionEase,
  transitionTokens,
} from '../src/motion';

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
describe('motionPresets — reveal presets', () => {
  it('ships horizontal counterparts to the vertical slides', () => {
    expect(motionPresets.slideInFromLeft.initial).toMatchObject({ opacity: 0, x: -24 });
    expect(motionPresets.slideInFromRight.initial).toMatchObject({ opacity: 0, x: 24 });
    expect(motionPresets.slideInFromLeft.animate).toMatchObject({ opacity: 1, x: 0 });
    expect(motionPresets.slideInFromRight.animate).toMatchObject({ opacity: 1, x: 0 });
  });

  it('riseIn travels further than slideInFromBottom, for section-scale reveals', () => {
    expect(motionPresets.riseIn.initial.y as number).toBeGreaterThan(
      motionPresets.slideInFromBottom.initial.y as number,
    );
    expect(motionPresets.riseIn.animate).toMatchObject({ opacity: 1, y: 0 });
  });

  it('blurIn resolves its filter back to zero blur', () => {
    expect(motionPresets.blurIn.initial.filter).toBe('blur(12px)');
    expect(motionPresets.blurIn.animate.filter).toBe('blur(0px)');
  });

  it('zoomIn starts further under-size than scaleIn', () => {
    expect(motionPresets.zoomIn.initial.scale as number).toBeLessThan(
      motionPresets.scaleIn.initial.scale as number,
    );
    expect(motionPresets.zoomIn.animate).toMatchObject({ opacity: 1, scale: 1 });
  });

  it('every reveal preset returns opacity to 1', () => {
    const reveals = [
      'fadeIn',
      'scaleIn',
      'slideInFromBottom',
      'slideInFromTop',
      'slideInFromLeft',
      'slideInFromRight',
      'riseIn',
      'blurIn',
      'zoomIn',
    ] as const;
    for (const name of reveals) {
      expect(motionPresets[name].animate.opacity, name).toBe(1);
      expect(motionPresets[name].initial.opacity, name).toBe(0);
    }
  });
});

describe('resolveTransition', () => {
  it('returns undefined when nothing is specified, so callers can spread it away', () => {
    expect(resolveTransition({})).toBeUndefined();
    expect(
      resolveTransition({ delay: undefined, duration: undefined, ease: undefined }),
    ).toBeUndefined();
  });

  it('maps duration token names onto the token table', () => {
    expect(resolveTransition({ duration: 'slow' })).toEqual({
      duration: transitionTokens.duration.slow,
    });
    expect(resolveTransition({ duration: 'fast' })).toEqual({
      duration: transitionTokens.duration.fast,
    });
  });

  it('maps easing token names onto the token table, in Motion\'s tuple form', () => {
    expect(resolveTransition({ ease: 'emphasized' })).toEqual({ ease: [0.3, 0, 0, 1] });
  });

  it('passes Motion\'s own named easings through untouched', () => {
    expect(resolveTransition({ ease: 'linear' })).toEqual({ ease: 'linear' });
    expect(resolveTransition({ ease: 'easeOut' })).toEqual({ ease: 'easeOut' });
  });

  it('passes raw numbers through and converts a raw CSS bezier to Motion form', () => {
    expect(resolveTransition({ duration: 1.25 })).toEqual({ duration: 1.25 });
    expect(resolveTransition({ ease: 'cubic-bezier(0.1, 0.2, 0.3, 0.4)' })).toEqual({
      ease: [0.1, 0.2, 0.3, 0.4],
    });
  });

  it('keeps a zero delay rather than dropping it as falsy', () => {
    expect(resolveTransition({ delay: 0 })).toEqual({ delay: 0 });
  });

  it('carries orchestration fields through', () => {
    expect(resolveTransition({ staggerChildren: 0.08, delayChildren: 0.2 })).toEqual({
      staggerChildren: 0.08,
      delayChildren: 0.2,
    });
  });

  it('composes timing and orchestration in one object', () => {
    expect(
      resolveTransition({
        delay: 0.1,
        duration: 'normal',
        ease: 'standard',
        staggerChildren: 0.05,
      }),
    ).toEqual({
      delay: 0.1,
      duration: transitionTokens.duration.normal,
      ease: [0.2, 0, 0, 1],
      staggerChildren: 0.05,
    });
  });
});

describe('defaultViewport', () => {
  it('only fires once, so a marketing section does not re-animate on scroll-back', () => {
    expect(defaultViewport.once).toBe(true);
  });

  it('triggers on a partial reveal, before the element is fully on screen', () => {
    expect(defaultViewport.amount).toBeGreaterThan(0);
    expect(defaultViewport.amount).toBeLessThan(1);
  });

  it('uses a negative bottom margin so motion arrives rather than catches up', () => {
    expect(defaultViewport.margin).toContain('-');
  });
});

describe('toMotionEase', () => {
  it('converts a CSS cubic-bezier string to the tuple Motion requires', () => {
    // Motion's JS engine throws "Invalid easing type" on the CSS function form, so this
    // conversion is what stands between the token table and a runtime pageerror.
    expect(toMotionEase('cubic-bezier(0.2, 0, 0, 1)')).toEqual([0.2, 0, 0, 1]);
  });

  it('handles negative control points (overshoot curves)', () => {
    expect(toMotionEase('cubic-bezier(0.34, 1.56, 0.64, -0.2)')).toEqual([0.34, 1.56, 0.64, -0.2]);
  });

  it('tolerates whitespace variation', () => {
    expect(toMotionEase('  cubic-bezier(0.1,0.2,0.3,0.4)  ')).toEqual([0.1, 0.2, 0.3, 0.4]);
  });

  it('leaves named easings alone for Motion to resolve', () => {
    expect(toMotionEase('linear')).toBe('linear');
    expect(toMotionEase('easeInOut')).toBe('easeInOut');
  });

  it('leaves an unparseable value alone rather than guessing', () => {
    expect(toMotionEase('steps(4, end)')).toBe('steps(4, end)');
    expect(toMotionEase('cubic-bezier(1, 2)')).toBe('cubic-bezier(1, 2)');
  });

  it('converts every easing token in the table', () => {
    for (const [name, css] of Object.entries(transitionTokens.ease)) {
      const result = toMotionEase(css);
      if (name === 'linear') {
        expect(result).toBe('linear');
      } else {
        expect(Array.isArray(result), name).toBe(true);
        expect((result as number[]).length, name).toBe(4);
      }
    }
  });
});
