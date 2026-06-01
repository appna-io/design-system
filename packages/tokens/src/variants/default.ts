import type { ThemeVariantDefinition } from './types';

/**
 * `default` — the **adaptive** variant. It ships no top-level token overrides (so the apx
 * base wins on every browser) plus a Cupertino-leaning overlay that activates on Apple-WebKit
 * runtimes via `data-platform='apple'`.
 *
 * On non-Safari browsers the overlay is inert and consumers see the canonical apx-base look.
 * On Safari (macOS / iOS / iPadOS) the overlay swaps radii, shadows, typography, and motion
 * timings to match what users already expect from native Apple UIs.
 *
 * One variant name, two faces — selected at paint time, with no FOUC.
 */
export const defaultVariant: ThemeVariantDefinition = {
  name: 'default',
  tokens: {},
  platformOverrides: {
    apple: {
      radius: {
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1.125rem',
        '2xl': '1.375rem',
      },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 1px rgba(0, 0, 0, 0.03)',
        md: '0 2px 6px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        lg: '0 6px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        xl: '0 12px 28px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.04)',
        focus: '0 0 0 4px rgba(0, 122, 255, 0.30)',
      },
      typography: {
        fontFamily: {
          sans: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
          mono: 'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        },
      },
      motion: {
        duration: {
          fast: 120,
          normal: 200,
          slow: 280,
        },
      },
    },
    other: {},
  },
};