import type { ThemeVariantDefinition } from './types';

/**
 * `tetsu` (鉄, "iron / steel") — brutalist. Zero radii on every surface, tighter shadows, and a
 * harder press feel. Pair with monochrome palettes for the most authentic look. `radius.full`
 * is preserved so components that explicitly opt into pill / avatar shapes still work.
 *
 * Think: command-line tools made tactile. The "no-bullshit" look.
 */
export const tetsuVariant: ThemeVariantDefinition = {
  name: 'tetsu',
  tokens: {
    radius: {
      none: '0px',
      xs: '0px',
      sm: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '9999px',
    },
    shadows: {
      xs: '0 1px 0 rgba(0, 0, 0, 0.10)',
      sm: '0 1px 0 rgba(0, 0, 0, 0.14)',
      md: '0 2px 0 rgba(0, 0, 0, 0.18)',
      lg: '0 3px 0 rgba(0, 0, 0, 0.20)',
      xl: '0 4px 0 rgba(0, 0, 0, 0.22)',
      '2xl': '0 6px 0 rgba(0, 0, 0, 0.24)',
      inner: 'inset 0 1px 0 rgba(0, 0, 0, 0.18)',
      focus: '0 0 0 3px rgba(0, 0, 0, 0.65)',
      none: 'none',
    },
    motion: {
      duration: {
        fast: 80,
        normal: 140,
        slow: 220,
      },
    },
  },
};
