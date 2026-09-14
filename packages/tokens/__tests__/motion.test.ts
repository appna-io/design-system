import { describe, expect, it } from 'vitest';
import { motion } from '../src/motion';

/**
 * These assert the *design intent* behind the numbers, not the numbers themselves — so that
 * retuning a value tells you what it was chosen to produce rather than just going red.
 */
describe('motion tokens', () => {
  it('separates interaction timings from reveal timings', () => {
    // 150-300ms is how long something you are already looking at should take to acknowledge you.
    expect(motion.duration.fast).toBeLessThanOrEqual(300);
    expect(motion.duration.slow).toBeLessThanOrEqual(300);

    // A section entering the viewport is a different event and reads as twitchy at that speed.
    expect(motion.duration.slower).toBeGreaterThan(motion.duration.slow);
    expect(motion.duration.deliberate).toBeGreaterThan(motion.duration.slower);
  });

  it('keeps a staggered grid inside the ~1s choreography budget at the default reveal speed', () => {
    // The rule from the design language: duration + stagger x (count - 1) <= ~1000ms. `slower`
    // is the house default precisely because it survives this and `deliberate` does not, which is
    // why `deliberate` is documented as single-element-only.
    const houseStagger = 80;
    const sixUpGrid = motion.duration.slower + houseStagger * 5;
    expect(sixUpGrid).toBeLessThanOrEqual(1000);

    expect(motion.duration.deliberate + houseStagger * 5).toBeGreaterThan(1000);
  });

  it('gives the reveal curves the shapes they are named for', () => {
    const points = (css: string) => css.match(/-?[\d.]+/g)!.map(Number);

    // `expressive` overshoots: it must cross 1 on the way so the entrance reads as arriving
    // rather than sliding to a stop. A curve that never exceeds 1 is just another ease-out.
    expect(Math.max(...points(motion.ease.expressive))).toBeGreaterThan(1);

    // `soft` is a long tail: most of the distance is covered early, so a large element settles
    // instead of arriving abruptly. y1 close to 1 at a small x1 is what produces that.
    const [x1, y1] = points(motion.ease.soft);
    expect(y1).toBeGreaterThan(0.9);
    expect(x1).toBeLessThan(0.3);

    // Neither reveal curve overshoots *below* zero — an undershoot reads as a stutter, not weight.
    for (const curve of [motion.ease.expressive, motion.ease.soft]) {
      expect(Math.min(...points(curve))).toBeGreaterThanOrEqual(0);
    }
  });
});
