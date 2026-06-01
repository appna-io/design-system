import type { ThemeVariantDefinition } from './types';

/**
 * `origami` (折り紙, "folded paper") — playful. Generous radii on every surface, softer layered
 * shadows that read like sheets of paper resting on each other, and slightly slower transitions
 * for a "settling-into-place" feel. The "delight" look.
 */
export const origamiVariant: ThemeVariantDefinition = {
  name: 'origami',
  tokens: {
    radius: {
      none: '0px',
      xs: '0.5rem',
      sm: '0.75rem',
      md: '0.875rem',
      lg: '1.25rem',
      xl: '1.75rem',
      '2xl': '2rem',
      '3xl': '2.5rem',
      full: '9999px',
    },
    shadows: {
      xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
      sm: '0 2px 4px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)',
      md: '0 6px 12px rgba(15, 23, 42, 0.07), 0 2px 4px rgba(15, 23, 42, 0.04)',
      lg: '0 14px 24px rgba(15, 23, 42, 0.09), 0 4px 8px rgba(15, 23, 42, 0.05)',
      xl: '0 24px 48px rgba(15, 23, 42, 0.11), 0 8px 16px rgba(15, 23, 42, 0.06)',
      '2xl': '0 40px 80px rgba(15, 23, 42, 0.14), 0 12px 24px rgba(15, 23, 42, 0.06)',
      inner: 'inset 0 2px 4px rgba(15, 23, 42, 0.04)',
      focus: '0 0 0 4px rgba(99, 102, 241, 0.30)',
      none: 'none',
    },
    motion: {
      duration: {
        fast: 180,
        normal: 280,
        slow: 420,
      },
    },
  },
};