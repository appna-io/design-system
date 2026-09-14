/**
 * WCAG contrast floor for the **default** palettes.
 *
 * These are the values every consumer of `apx-ds` gets before theming anything, so a failure here
 * ships an unreadable control to everyone rather than to one template. When this was written,
 * three of the seven solid buttons were failing in light and three in dark — worst case **1.80:1**,
 * where the label is effectively gone.
 *
 * It runs through `auditPaletteContrast` rather than measuring anything itself. That matters: an
 * earlier version of this file carried its own copy of the luminance maths, which meant two
 * checkers that could disagree — and the one that mattered would be whichever a given palette
 * happened to be run through. One checker, many callers.
 *
 * Lives in `theme` rather than `tokens` because the checker does: `tokens` sits below `theme`, so
 * importing it there would invert the dependency.
 */
import { darkPalette, lightPalette } from '@apx-ui/tokens';
import { describe, expect, it } from 'vitest';

import { auditPaletteContrast, formatContrastFailures } from '../src/auditPaletteContrast';

describe.each([
  ['light', lightPalette],
  ['dark', darkPalette],
])('%s default palette — solid button labels', (mode, palette) => {
  /**
   * Scoped to labels on fills and to ramp direction — the roles this file was written to fix.
   *
   * It deliberately does NOT assert the palette is failure-free overall. `foreground.subtle` and
   * the two border roles are still below their floors, and that is recorded as a known baseline in
   * `auditPaletteContrast.test.ts` pending a separate decision: raising `border.default` to 3:1
   * would darken every card outline in the DS, which is a much larger visual change than a button
   * label and is not one to slip in under an unrelated fix.
   *
   * Asserting zero here would have forced that decision by the back door, or forced this test to
   * be relaxed later — and a threshold that gets relaxed is a threshold that stops meaning
   * anything.
   */
  it('has no unreadable label on any fill, in any interaction state', () => {
    const failures = auditPaletteContrast(palette).filter((f) => f.role.includes('.contrast on '));
    expect(
      failures,
      failures.length
        ? `${mode} default palette has ${failures.length} unreadable label(s):\n` +
            formatContrastFailures(failures)
        : '',
    ).toEqual([]);
  });

  it('has no role whose label fights its ramp', () => {
    const failures = auditPaletteContrast(palette).filter((f) => f.role.endsWith('.ramp'));
    expect(failures, failures.length ? formatContrastFailures(failures) : '').toEqual([]);
  });
});

describe('the regressions this file exists to prevent', () => {
  /**
   * Guards the specific shape of the original bug rather than only its symptom. A future palette
   * edit that reintroduces a white label on a brightening dark ramp fails here with the cause
   * named, not with three unexplained ratio failures.
   */
  it('reports a label that fades as a dark ramp brightens', () => {
    const broken = {
      background: { default: '#0b0b0d' },
      foreground: { default: '#ffffff', muted: '#c8c8cc', subtle: '#9a9aa0' },
      // The dark `primary` exactly as it shipped: white ink on a ramp that lightens.
      primary: {
        main: '#6366f1',
        contrast: '#ffffff',
        hover: '#818cf8',
        active: '#a5b4fc',
      },
    };
    const failures = auditPaletteContrast(broken);
    const reasons = failures.map((f) => f.reason).join(' ');

    expect(failures.length).toBeGreaterThan(0);
    expect(reasons).toContain('ramp direction');
    expect(failures.some((f) => f.role === 'primary.ramp')).toBe(true);
    // And the plain ratio checks catch the individual states too, so the cause and the symptom
    // are both reported rather than one standing in for the other.
    expect(failures.some((f) => f.role === 'primary.contrast on primary.active')).toBe(true);
  });

  it('accepts the same fill once the ink agrees with the ramp direction', () => {
    const fixed = {
      background: { default: '#0b0b0d' },
      foreground: { default: '#ffffff', muted: '#c8c8cc', subtle: '#9a9aa0' },
      primary: {
        main: '#818cf8',
        contrast: '#0b0f2e',
        hover: '#a5b4fc',
        active: '#c7d2fe',
      },
    };
    expect(auditPaletteContrast(fixed)).toEqual([]);
  });
});
