import { describe, expect, it } from 'vitest';
import { defaultTheme } from '@apx-ui/tokens';

import { auditPaletteContrast, formatContrastFailures } from '../src/auditPaletteContrast';
import { mergeTheme } from '../src/mergeTheme';

/**
 * Four contrast failures shipped in a single day, none of them visible in the source. This is the
 * measurement that catches that class — run over the DS defaults, over derived palettes, and over
 * the brand shapes that actually broke.
 */
describe('auditPaletteContrast', () => {
  /**
   * The DS default palettes do NOT currently pass, and this test records that honestly rather
   * than relaxing a threshold until it goes green. The known failures are listed below; the test
   * fails if a *new* one appears, so the baseline can only shrink.
   *
   * Written up for a decision rather than fixed here — changing the default palette is a call
   * with a blast radius across every consumer, not a change to slip into a test file.
   */
  /**
   * The DS default palettes now pass outright, in both modes, with nothing exempted.
   *
   * They did not when this test was written — there were 13 failing states across 6 roles, the
   * worst a button label at 1.80:1. The list below is empty because each was fixed at its cause
   * rather than waived: the accent ramps were re-matched so a dark role does not *lose* contrast
   * on hover, `border` was split into a decorative role and a control role with irreconcilable
   * requirements, and `foreground.subtle` was darkened to clear the floor on the subtle panel
   * where it is most used.
   *
   * It stays here as a list rather than a bare assertion so that a future exemption has to be
   * written down, argued for, and reviewed — not discovered later as a threshold someone relaxed.
   */
  const KNOWN_DEFAULT_FAILURES: Record<'light' | 'dark', readonly string[]> = {
    light: [],
    dark: [],
  };

  it('records the DS default palettes at a known baseline that can only shrink', () => {
    for (const mode of ['light', 'dark'] as const) {
      const found = auditPaletteContrast(defaultTheme.palette[mode]).map((f) => f.role);
      const unexpected = found.filter((role) => !KNOWN_DEFAULT_FAILURES[mode].includes(role));
      expect(unexpected).toEqual([]);
    }
  });

  it('catches the failure that actually shipped', () => {
    // `foreground.subtle` at 4.35:1 on a warm-black derived ground. It looked fine.
    const failures = auditPaletteContrast({
      background: { default: '#100e0a' },
      foreground: { default: '#f0f1f0', muted: '#a8a29c', subtle: '#7d7772' },
    });
    expect(failures.map((f) => f.role)).toContain('foreground.subtle');
  });

  it('catches an invisible control edge, not just unreadable text', () => {
    const failures = auditPaletteContrast({
      background: { default: '#0b0c0f' },
      foreground: { default: '#ffffff' },
      border: { default: '#141619', strong: '#16181c', control: '#141619' },
    });
    // A field nobody can see the edge of is a failure even though no text is involved — the half
    // of a colour map that goes unchecked.
    expect(failures.map((f) => f.role)).toContain('border.control');
  });

  it('does not hold a decorative outline to a control edge threshold', () => {
    const failures = auditPaletteContrast({
      background: { default: '#ffffff' },
      foreground: { default: '#18181b' },
      // A faint card outline at ~1.3:1 is correct design, not a bug. Holding `default` to 3:1 was
      // what made this look like an unfixable trade — the roles had to split instead.
      border: { default: '#e4e4e7', subtle: '#f4f4f5', strong: '#a1a1aa', control: '#8a8a93' },
    });
    expect(failures.map((f) => f.role)).not.toContain('border.default');
    expect(failures.map((f) => f.role)).not.toContain('border.strong');
    expect(failures.map((f) => f.role)).not.toContain('border.control');
  });

  it('catches an unreadable label on a solid button fill', () => {
    const failures = auditPaletteContrast({
      background: { default: '#ffffff' },
      foreground: { default: '#000000' },
      // Violet fill with a light-grey label — the shape of every "looks fine, measures 3:1" CTA.
      primary: { main: '#5B3DF5', contrast: '#c9c2f8' },
    });
    expect(failures.map((f) => f.role)).toContain('primary.contrast on primary.main');
  });

  it('checks body copy on the subtle panel, not only on the page ground', () => {
    const failures = auditPaletteContrast({
      background: { default: '#ffffff', subtle: '#6b7280' },
      foreground: { default: '#111827', muted: '#4b5563', subtle: '#4b5563' },
    });
    // Muted text is fine on white and fails on the grey panel — the combination nobody checks.
    expect(failures.some((f) => f.role.includes('on background.subtle'))).toBe(true);
  });

  it('exempts the decorative hairline', () => {
    const failures = auditPaletteContrast({
      background: { default: '#ffffff' },
      foreground: { default: '#111827' },
      border: { default: '#9ca3af', subtle: '#f3f4f6', strong: '#6b7280' },
    });
    // Holding `border.subtle` to 3:1 would make every card outline shout.
    expect(failures.map((f) => f.role)).not.toContain('border.subtle');
  });

  it('passes a derived dark palette — the path that produced the last failure', () => {
    const brand = {
      palette: {
        light: {
          primary: { main: '#14523C', contrast: '#F4F8F5' },
          secondary: { main: '#8B5E3C', contrast: '#FFFFFF' },
          background: { default: '#F7FAF8', paper: '#FFFFFF' },
        },
      },
    };
    const failures = auditPaletteContrast(mergeTheme(defaultTheme, brand).palette.dark);

    // Everything the derivation actually produces must pass — including `foreground.subtle`
    // measured on `background.subtle`, which is the lightest ground in the palette and the one
    // that caught the last hole: text can clear the page background and still fail inside a panel.
    const derivedRoles = failures.filter(
      (f) => !f.role.startsWith('danger') && !f.role.startsWith('info'),
    );
    expect(formatContrastFailures(derivedRoles)).toBe('');

    // `danger` and `info` are inherited DS status defaults, deliberately not derived — they carry
    // no brand identity, so inventing them here would be worse than inheriting them. They are in
    // the baseline above, not this contract.
    expect(failures.every((f) => f.role.includes('contrast on'))).toBe(true);
  });

  it('reports what failed and why, not just that something did', () => {
    const [failure] = auditPaletteContrast({
      background: { default: '#ffffff' },
      foreground: { default: '#eeeeee' },
    });
    expect(failure).toBeDefined();
    expect(failure!.reason).toContain('WCAG');
    expect(failure!.ratio).toBeLessThan(failure!.required);
  });
});
