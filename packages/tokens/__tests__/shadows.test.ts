import { describe, expect, it } from 'vitest';
import { shadows } from '../src/shadows';

/**
 * The marketing elevation steps exist because the Tailwind-default scale greys on a warm ground
 * and vanishes entirely on a dark band. These assert the properties that make them work, not the
 * pixel values.
 */
describe('shadow tokens', () => {
  it('keeps the neutral product scale untinted', () => {
    for (const key of ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'inner'] as const) {
      expect(shadows[key]).not.toContain('color-mix');
    }
  });

  it('tints `ambient` from a role every Surface tone remaps', () => {
    // This is the whole mechanism: `foreground-default` is remapped by inverted/primary/secondary
    // tones, so the shadow becomes a light halo on a dark band without a tone-specific override.
    expect(shadows.ambient).toContain('var(--sds-palette-foreground-default)');
    expect(shadows.ambient).not.toContain('rgb(0 0 0');
  });

  it('tints `glow` from the brand accent', () => {
    expect(shadows.glow).toContain('var(--sds-palette-primary-main)');
  });

  it('gives both marketing steps a contact layer and a diffuse layer', () => {
    // One layer reads as a sticker. The tight contact shadow is what makes an element look like
    // it is resting on the page rather than floating above a picture of one.
    for (const key of ['ambient', 'glow'] as const) {
      expect(shadows[key]!.split('),').length).toBeGreaterThanOrEqual(2);
    }
  });

  it('composites toward transparent, so a shadow never paints a solid edge', () => {
    for (const key of ['ambient', 'glow'] as const) {
      const value = shadows[key]!;
      const mixes = value.split('color-mix').length - 1;
      const transparents = value.split('transparent').length - 1;
      expect(mixes).toBeGreaterThan(0);
      // Every mix must land on `transparent`, or the shadow paints an opaque band at its edge.
      expect(transparents).toBe(mixes);
    }
  });
});
