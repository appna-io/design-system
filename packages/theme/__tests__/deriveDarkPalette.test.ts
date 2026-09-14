import { describe, expect, it } from 'vitest';
import { defaultTheme } from '@apx-ui/tokens';

import { contrastRatio, deriveDarkPalette, hexToHsl } from '../src/deriveDarkPalette';
import { mergeTheme } from '../src/mergeTheme';

/**
 * A template theme is a deep-partial override, so `palette.light` without `palette.dark` used to
 * mean "keep the design system's indigo in dark mode" — a brand that simply vanished on half the
 * sessions, with no error and nothing for a grep to find.
 */
describe('deriveDarkPalette', () => {
  const greenBrand = {
    palette: {
      light: {
        primary: { main: '#14523C', contrast: '#F4F8F5' },
        secondary: { main: '#8B5E3C', contrast: '#FFFFFF' },
        background: { default: '#F7FAF8', paper: '#FFFFFF' },
      },
    },
  };

  it('keeps a light-only brand in dark mode instead of falling back to the DS default', () => {
    const theme = mergeTheme(defaultTheme, greenBrand);
    expect(theme.palette.dark.primary.main).not.toBe(defaultTheme.palette.dark.primary.main);
  });

  it('holds the hue — the accent gets lighter, not different', () => {
    const theme = mergeTheme(defaultTheme, greenBrand);
    const light = hexToHsl('#14523C')!;
    const dark = hexToHsl(theme.palette.dark.primary.main)!;

    expect(Math.abs(dark.h - light.h)).toBeLessThan(0.03);
    // And it is genuinely lighter, which is the whole point on a dark ground.
    expect(dark.l).toBeGreaterThan(light.l);
  });

  it('lifts the accent until it is actually readable on the dark ground', () => {
    const theme = mergeTheme(defaultTheme, greenBrand);
    const { primary, background } = theme.palette.dark;
    // #14523C on a near-black ground measures ~1.6:1 — invisible. Derivation has to fix that.
    expect(contrastRatio('#14523C', background.default)).toBeLessThan(4.5);
    expect(contrastRatio(primary.main, background.default)).toBeGreaterThanOrEqual(4.5);
  });

  it('carries the brand temperature into the ground', () => {
    const theme = mergeTheme(defaultTheme, greenBrand);
    const ground = hexToHsl(theme.palette.dark.background.default)!;
    // A warm brand should get a warm near-black, not a neutral grey one — that is most of what
    // makes a derived dark mode feel like the same brand.
    expect(ground.s).toBeGreaterThan(0);
    expect(ground.l).toBeLessThan(0.12);
  });

  it('flips `subtle` from a pale tint to a dark one', () => {
    const theme = mergeTheme(defaultTheme, greenBrand);
    const subtle = hexToHsl(theme.palette.dark.primary.subtle)!;
    // In light mode `subtle` is a pale wash; on dark the same idea is a glaring panel.
    expect(subtle.l).toBeLessThan(0.25);
  });

  it('keeps body copy readable on the derived ground', () => {
    const theme = mergeTheme(defaultTheme, greenBrand);
    const { foreground, background } = theme.palette.dark;
    expect(contrastRatio(foreground.default, background.default)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(foreground.muted, background.default)).toBeGreaterThanOrEqual(4.5);
  });

  it('never overrides a brand that authored its own dark palette', () => {
    const authored = {
      palette: {
        light: { primary: { main: '#14523C' } },
        dark: { primary: { main: '#ABCDEF' } },
      },
    };
    expect(mergeTheme(defaultTheme, authored).palette.dark.primary.main).toBe('#ABCDEF');
  });

  it('fills the gaps around a partial dark override', () => {
    const partial = {
      palette: {
        light: { primary: { main: '#14523C' }, background: { default: '#F7FAF8' } },
        dark: { primary: { main: '#ABCDEF' } },
      },
    };
    const dark = mergeTheme(defaultTheme, partial).palette.dark;
    // The hand-tuned role wins...
    expect(dark.primary.main).toBe('#ABCDEF');
    // ...and the ground it sits on is still the brand's, not the DS default.
    expect(dark.background.default).not.toBe(defaultTheme.palette.dark.background.default);
  });

  it('leaves status colours to the DS — they carry no brand identity', () => {
    const theme = mergeTheme(defaultTheme, greenBrand);
    expect(theme.palette.dark.danger.main).toBe(defaultTheme.palette.dark.danger.main);
    expect(theme.palette.dark.success.main).toBe(defaultTheme.palette.dark.success.main);
  });

  it('does nothing when there is no brand role to derive from', () => {
    expect(deriveDarkPalette({ background: { default: '#fff' } })).toBeUndefined();
  });
});

/**
 * The derived palette is measured, not assumed.
 *
 * A fixed mix ratio cannot serve a variable ground, and this file deliberately produces a variable
 * one — it tints the dark ground to carry the brand's temperature. Before these clamps,
 * `foreground.subtle` measured 4.37:1 on fernwood's warm-black and 4.35:1 on lyli-coffee's, both
 * under 4.5, for the token those templates use for footnotes and captions.
 *
 * These cases are the real light palettes of the two shipped templates that had no authored dark
 * mode — i.e. the exact inputs the feature exists to serve — plus two synthetic extremes to make
 * sure the clamp is not tuned to them.
 */
describe('deriveDarkPalette — every derived value clears its own threshold', () => {
  const CASES: [string, Record<string, unknown>][] = [
    [
      'fernwood (deep green on warm paper)',
      {
        primary: { main: '#14523C', contrast: '#F4F8F5' },
        background: { default: '#FBFAF7' },
        foreground: { default: '#1A1A17' },
      },
    ],
    [
      'lyli-coffee (espresso on cream)',
      {
        primary: { main: '#2A1810', contrast: '#FDF8F3' },
        secondary: { main: '#8B5E3C', contrast: '#FDF8F3' },
        background: { default: '#FDF8F3' },
      },
    ],
    [
      'saturated cyan on a neutral ground',
      { primary: { main: '#0891b2' }, background: { default: '#ffffff' } },
    ],
    [
      'strongly tinted ground (the case the constants were wrong for)',
      { primary: { main: '#7c3aed' }, background: { default: '#FFF1E6' } },
    ],
  ];

  it.each(CASES)('%s', (_name, light) => {
    const dark = deriveDarkPalette(light) as Record<string, Record<string, string>>;
    const ground = dark['background']!['default']!;

    // Body text (WCAG 1.4.3). `subtle` is the one that used to fail.
    for (const step of ['default', 'muted', 'subtle'] as const) {
      expect(contrastRatio(dark['foreground']![step]!, ground)).toBeGreaterThanOrEqual(4.5);
    }

    // Meaningful borders (WCAG 1.4.11). `subtle` is a decorative hairline and is exempt by design.
    for (const step of ['default', 'strong'] as const) {
      expect(contrastRatio(dark['border']![step]!, ground)).toBeGreaterThanOrEqual(3);
    }

    // The accents were already clamped; asserted here so the two paths cannot drift apart.
    for (const role of ['primary', 'secondary', 'neutral'] as const) {
      const main = dark[role]?.['main'];
      if (main) expect(contrastRatio(main, ground)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps the hierarchy — muted is dimmer than default, subtle dimmer than muted', () => {
    const dark = deriveDarkPalette({
      primary: { main: '#14523C' },
      background: { default: '#FBFAF7' },
    }) as Record<string, Record<string, string>>;
    const ground = dark['background']!['default']!;
    const ratio = (step: string) => contrastRatio(dark['foreground']![step]!, ground);

    // Clamping a step must not flatten the scale into three identical greys.
    expect(ratio('default')).toBeGreaterThan(ratio('muted'));
    expect(ratio('muted')).toBeGreaterThan(ratio('subtle'));
  });

  it.each(CASES)('%s — the border scale stays three distinct steps', (_name, light) => {
    const dark = deriveDarkPalette(light) as Record<string, Record<string, string>>;
    const ground = dark['background']!['default']!;
    const ratio = (step: string) => contrastRatio(dark['border']![step]!, ground);

    // The first version of this clamp collapsed `default` and `strong` onto the same value: on a
    // tinted ground `default` had to lift to roughly where `strong`'s constant already was, so a
    // theme got two identical borders and no strong step at all.
    expect(ratio('strong')).toBeGreaterThan(ratio('default'));
    expect(ratio('default')).toBeGreaterThan(ratio('subtle'));
  });
});
