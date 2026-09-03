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

  /**
   * The palette-value bugs (#14). Both halves failed *silently*: an unresolved value became an
   * invalid CSS declaration that the browser drops, so text simply inherited its colour and no
   * error appeared anywhere. 502 declarations in this repo were dead this way, `PricingCard`'s
   * cadence and blurb among them.
   */
  describe('palette values', () => {
    it('accepts the fg./bg. spellings the DS teaches everywhere else', () => {
      // `fg` and `bg` are already `sx` KEY aliases and the Tailwind preset's own vocabulary
      // (`text-fg-muted`, `bg-bg-paper`) — they were just rejected as VALUE prefixes.
      expect(sxToStyle({ color: 'fg.muted' }).color).toBe('var(--sds-palette-foreground-muted)');
      expect(sxToStyle({ color: 'fg.default' }).color).toBe(
        'var(--sds-palette-foreground-default)',
      );
      expect(sxToStyle({ bg: 'bg.paper' }).backgroundColor).toBe(
        'var(--sds-palette-background-paper)',
      );
    });

    it('still accepts the long spellings — this is additive', () => {
      expect(sxToStyle({ color: 'foreground.muted' }).color).toBe(
        'var(--sds-palette-foreground-muted)',
      );
      expect(sxToStyle({ bg: 'background.paper' }).backgroundColor).toBe(
        'var(--sds-palette-background-paper)',
      );
      expect(sxToStyle({ color: 'primary.main' }).color).toBe('var(--sds-palette-primary-main)');
    });

    it('resolves a bare role to its main slot', () => {
      // `themeToCssVars` flattens one variable per SLOT and never emits a bare
      // `--sds-palette-primary`, so this used to build a reference to nothing — the same defect
      // that made the renderer's <Inspectable> outline invisible, reachable from a prop.
      expect(sxToStyle({ color: 'primary' }).color).toBe('var(--sds-palette-primary-main)');
      expect(sxToStyle({ color: 'danger' }).color).toBe('var(--sds-palette-danger-main)');
      expect(sxToStyle({ bg: 'neutral' }).backgroundColor).toBe('var(--sds-palette-neutral-main)');
    });

    it('resolves a bare surface group to its default slot', () => {
      // Surfaces have no `main`; their default slot is `default`.
      expect(sxToStyle({ borderColor: 'border' }).borderColor).toBe(
        'var(--sds-palette-border-default)',
      );
      expect(sxToStyle({ color: 'foreground' }).color).toBe(
        'var(--sds-palette-foreground-default)',
      );
      expect(sxToStyle({ bg: 'bg' }).backgroundColor).toBe(
        'var(--sds-palette-background-default)',
      );
    });

    it('leaves literal colours and var() references alone', () => {
      expect(sxToStyle({ color: '#ff5722' }).color).toBe('#ff5722');
      expect(sxToStyle({ color: 'rgb(1 2 3)' }).color).toBe('rgb(1 2 3)');
      expect(sxToStyle({ color: 'var(--custom)' }).color).toBe('var(--custom)');
    });

    it('passes CSS colour keywords through rather than inventing a token', () => {
      // `inherit` / `currentColor` / `transparent` are real CSS values, not palette groups.
      expect(sxToStyle({ color: 'inherit' }).color).toBe('inherit');
      expect(sxToStyle({ color: 'currentColor' }).color).toBe('currentColor');
      expect(sxToStyle({ bg: 'transparent' }).backgroundColor).toBe('transparent');
    });
  });
});
