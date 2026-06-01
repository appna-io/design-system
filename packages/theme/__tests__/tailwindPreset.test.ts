import { describe, expect, it } from 'vitest';
import { apxTailwindPreset } from '../src/tailwind-preset';

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
      expect(scale.DEFAULT).toBe(`var(--sds-palette-${role}-main)`);
      expect(scale.contrast).toBe(`var(--sds-palette-${role}-contrast)`);
      expect(scale.hover).toBe(`var(--sds-palette-${role}-hover)`);
    }
  });

  it('exposes bg/fg/border surface scales', () => {
    expect(colors.bg!.DEFAULT).toBe('var(--sds-palette-background-default)');
    expect(colors.fg!.muted).toBe('var(--sds-palette-foreground-muted)');
    expect(colors.border!.strong).toBe('var(--sds-palette-border-strong)');
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
    expect(ring.DEFAULT).toBe('var(--sds-focus-ring)');
  });
});