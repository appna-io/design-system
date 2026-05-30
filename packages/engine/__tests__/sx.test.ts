import { describe, expect, it } from 'vitest';
import { sxToStyle } from '../src/sx';

describe('sxToStyle', () => {
  it('returns empty object for undefined input', () => {
    expect(sxToStyle()).toEqual({});
    expect(sxToStyle(undefined)).toEqual({});
  });

  it('expands short aliases', () => {
    const style = sxToStyle({ p: 16, m: 8, w: '100%' });
    expect(style).toMatchObject({ padding: 16, margin: 8, width: '100%' });
  });

  it('resolves palette role strings on color properties', () => {
    const style = sxToStyle({ bg: 'primary.main', color: 'danger.contrast' });
    expect(style.backgroundColor).toBe('var(--sds-palette-primary-main)');
    expect(style.color).toBe('var(--sds-palette-danger-contrast)');
  });

  it('resolves radius tokens', () => {
    const style = sxToStyle({ radius: 'md' });
    expect(style.borderRadius).toBe('var(--sds-radius-md)');
  });

  it('preserves raw CSS values', () => {
    const style = sxToStyle({ bg: '#ff0000', radius: 8 });
    expect(style.backgroundColor).toBe('#ff0000');
    expect(style.borderRadius).toBe(8);
  });

  it('does not double-wrap existing var()', () => {
    const style = sxToStyle({ bg: 'var(--my-custom-bg)' });
    expect(style.backgroundColor).toBe('var(--my-custom-bg)');
  });

  it('passes through unknown property names', () => {
    const style = sxToStyle({ '--custom-var': '123', opacity: 0.5 });
    expect((style as Record<string, unknown>)['--custom-var']).toBe('123');
    expect(style.opacity).toBe(0.5);
  });

  it('skips undefined values', () => {
    const style = sxToStyle({ p: 16, m: undefined });
    expect(style.padding).toBe(16);
    expect('margin' in style).toBe(false);
  });

  it('does not treat non-palette strings as tokens', () => {
    const style = sxToStyle({ bg: 'transparent' });
    expect(style.backgroundColor).toBe('transparent');
  });

  describe('spacing scale resolution', () => {
    it('resolves numeric scale keys on gap', () => {
      const style = sxToStyle({ gap: '6' });
      expect(style.gap).toBe('var(--sds-spacing-6)');
    });

    it('resolves fractional scale keys (e.g. "1.5")', () => {
      const style = sxToStyle({ gap: '1.5' });
      expect(style.gap).toBe('var(--sds-spacing-1-5)');
    });

    it('resolves "px" keyword on the spacing scale', () => {
      const style = sxToStyle({ p: 'px' });
      expect(style.padding).toBe('var(--sds-spacing-px)');
    });

    it('resolves spacing on margin / padding aliases', () => {
      const style = sxToStyle({ m: '4', p: '8', mx: '2', py: '1' });
      expect(style.margin).toBe('var(--sds-spacing-4)');
      expect(style.padding).toBe('var(--sds-spacing-8)');
      expect(style.marginInline).toBe('var(--sds-spacing-2)');
      expect(style.paddingBlock).toBe('var(--sds-spacing-1)');
    });

    it('passes raw CSS unit values through untouched on spacing props', () => {
      const style = sxToStyle({ gap: '24px', p: '1rem', w: '100%' });
      expect(style.gap).toBe('24px');
      expect(style.padding).toBe('1rem');
      expect(style.width).toBe('100%');
    });

    it('passes numeric values through untouched (consumer opted out of scale)', () => {
      const style = sxToStyle({ gap: 6 });
      expect(style.gap).toBe(6);
    });

    it('passes CSS keywords (e.g. "auto") through untouched', () => {
      const style = sxToStyle({ m: 'auto', w: 'auto' });
      expect(style.margin).toBe('auto');
      expect(style.width).toBe('auto');
    });
  });
});
