import { describe, expect, it } from 'vitest';
import { apxTailwindPreset } from '../src/tailwind-preset';

/**
 * Every DS color must carry Tailwind's `<alpha-value>` placeholder. Without it the `/opacity`
 * modifier compiles to an invalid declaration and the element renders fully transparent — the
 * silent failure that broke nine surfaces across two templates before anyone spotted it.
 */
function alphaAwareOf(varName: string): string {
  return `color-mix(in srgb, var(${varName}) calc(<alpha-value> * 100%), transparent)`;
}

describe('apxTailwindPreset', () => {
  const colors = apxTailwindPreset.theme.extend.colors as unknown as Record<
    string,
    Record<string, string>
  >;

  it('exposes every semantic color role with the DS var', () => {
    for (const role of [
      'primary',
      'secondary',
      'success',
      'warning',
      'danger',
      'info',
      'neutral',
    ]) {
      const scale = colors[role]!;
      expect(scale.DEFAULT).toBe(alphaAwareOf(`--sds-palette-${role}-main`));
      expect(scale.contrast).toBe(alphaAwareOf(`--sds-palette-${role}-contrast`));
      expect(scale.hover).toBe(alphaAwareOf(`--sds-palette-${role}-hover`));
    }
  });

  it('exposes bg/fg/border surface scales', () => {
    expect(colors.bg!.DEFAULT).toBe(alphaAwareOf('--sds-palette-background-default'));
    expect(colors.fg!.muted).toBe(alphaAwareOf('--sds-palette-foreground-muted'));
    expect(colors.border!.strong).toBe(alphaAwareOf('--sds-palette-border-strong'));
  });

  it('exposes radius, shadow, duration, ring scales', () => {
    const radii = apxTailwindPreset.theme.extend.borderRadius as Record<string, string>;
    expect(radii.md).toBe('var(--sds-radius-md)');
    expect(radii.full).toBe('var(--sds-radius-full)');

    const shadows = apxTailwindPreset.theme.extend.boxShadow as Record<string, string>;
    expect(shadows.md).toBe('var(--sds-shadows-md)');

    const durations = apxTailwindPreset.theme.extend.transitionDuration as Record<
      string,
      string
    >;
    expect(durations.normal).toBe('var(--sds-duration-normal)');

    const ring = apxTailwindPreset.theme.extend.ringColor as Record<string, string>;
    expect(ring.DEFAULT).toBe(alphaAwareOf('--sds-focus-ring'));
  });

  it('EVERY color in the preset carries the <alpha-value> placeholder', () => {
    // The regression guard for #8. A color added later without it would break `/opacity` on that
    // one token only — silently, and invisibly, exactly like the original bug.
    const flat: Array<[string, string]> = [];
    for (const [name, value] of Object.entries(colors)) {
      if (typeof value === 'string') flat.push([name, value]);
      else for (const [slot, v] of Object.entries(value)) flat.push([`${name}.${slot}`, v]);
    }
    const ring = apxTailwindPreset.theme.extend.ringColor as Record<string, string>;
    for (const [slot, v] of Object.entries(ring)) flat.push([`ringColor.${slot}`, v]);

    const missing = flat
      // `overlay` is a scalar token that already carries its own alpha; stacking a second
      // opacity on it is never what a caller means, so it stays a bare var by design.
      .filter(([name]) => name !== 'overlay')
      .filter(([, v]) => !v.includes('<alpha-value>'))
      .map(([name]) => name);

    expect(missing).toEqual([]);
    expect(flat.length).toBeGreaterThan(50);
  });

  it('wires the font utilities to the theme stacks', () => {
    const fonts = apxTailwindPreset.theme.extend.fontFamily as Record<string, string>;
    // Without these, `font-sans` / `font-mono` resolve to Tailwind's built-in stacks and the
    // theme's `typography.fontFamily` is inert for anything using those utilities.
    expect(fonts.sans).toBe('var(--sds-font-sans)');
    expect(fonts.mono).toBe('var(--sds-font-mono)');
  });

  it('font-display falls back to the sans stack so an unset display token is a no-op', () => {
    const fonts = apxTailwindPreset.theme.extend.fontFamily as Record<string, string>;
    expect(fonts.display).toBe('var(--sds-font-display, var(--sds-font-sans))');
  });
});