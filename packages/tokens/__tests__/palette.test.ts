import { describe, expect, it } from 'vitest';
import { darkPalette, lightPalette } from '../src/palette';

const ROLES = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const ROLE_KEYS = ['main', 'contrast', 'hover', 'active', 'subtle', 'border'] as const;
const SURFACE_KEYS = ['default', 'paper', 'subtle'] as const;
const FG_KEYS = ['default', 'muted', 'subtle'] as const;
const BORDER_KEYS = ['default', 'subtle', 'strong'] as const;

describe.each([
  ['lightPalette', lightPalette],
  ['darkPalette', darkPalette],
])('%s contract', (_name, palette) => {
  it.each(ROLES)('role %s defines every required key', (role) => {
    const roleObj = palette[role];
    expect(roleObj).toBeTruthy();
    for (const key of ROLE_KEYS) {
      expect(roleObj[key], `${role}.${key} missing`).toMatch(/^#|^rgb/);
    }
  });

  it.each(SURFACE_KEYS)('background.%s is defined', (key) => {
    expect(palette.background[key]).toMatch(/^#|^rgb/);
  });

  it.each(FG_KEYS)('foreground.%s is defined', (key) => {
    expect(palette.foreground[key]).toMatch(/^#|^rgb/);
  });

  it.each(BORDER_KEYS)('border.%s is defined', (key) => {
    expect(palette.border[key]).toMatch(/^#|^rgb/);
  });

  it('overlay and focusRing are defined', () => {
    expect(palette.overlay).toBeTruthy();
    expect(palette.focusRing).toBeTruthy();
  });
});