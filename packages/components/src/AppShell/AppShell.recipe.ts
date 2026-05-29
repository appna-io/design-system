import { cv } from '@apx-ui/engine';

/**
 * Root recipe. Structural shell — Grid container with full-viewport height and the surface
 * tokens that match the rest of the design system. The actual `grid-template-areas` and
 * `grid-template-columns` are computed inline in `AppShell.tsx` because they depend on which
 * slots are present (a 1-slot layout differs from a 4-slot layout in shape, not just chrome).
 */
export const appShellRecipe = cv({
  base: 'relative grid min-h-screen w-full bg-(--sds-color-surface-default) text-(--sds-color-text-default)',
  variants: {
    layout: {
      default: '',
      inset: '',
    },
  },
  defaultVariants: { layout: 'default' },
});

/**
 * Header recipe. Sits in the `header` grid area. The `sticky` variant pins the header to the
 * top of the viewport; the `variant` axis swaps between three visual treatments.
 */
export const appShellHeaderRecipe = cv({
  base: '[grid-area:header] flex items-center min-w-0 bg-(--sds-color-surface-default) z-30',
  variants: {
    variant: {
      default: 'border-b border-(--sds-color-border-subtle) px-4',
      bordered: 'border-b border-(--sds-color-border-default) px-4',
      floating:
        'm-3 rounded-xl border border-(--sds-color-border-subtle) bg-(--sds-color-surface-raised) px-4 shadow-md',
    },
    sticky: {
      true: 'sticky top-0',
      false: '',
    },
  },
  defaultVariants: { variant: 'default', sticky: true },
});

/**
 * Sidebar recipe. The width itself is set inline (it can be any number); the recipe only
 * contributes structural classes + the border on the inner edge. `border-inline-end` is RTL-
 * aware so the visible separation always falls between sidebar and main.
 */
export const appShellSidebarRecipe = cv({
  base: '[grid-area:sidebar] flex flex-col min-w-0 bg-(--sds-color-surface-default) overflow-y-auto transition-[width] duration-200 ease-out',
  variants: {
    position: {
      // When the sidebar is on the logical-start side, draw the inner edge on the end side
      // (the side facing main).
      start: 'border-e border-(--sds-color-border-subtle)',
      end: 'border-s border-(--sds-color-border-subtle)',
    },
    collapsed: {
      true: 'sds-sidebar-collapsed',
      false: '',
    },
  },
  defaultVariants: { position: 'start', collapsed: false },
});

/**
 * Aside recipe. Mirrors the sidebar but for the detail / inspector panel. Defaults to the
 * opposite logical side from the sidebar (handled by the consumer's prop default at the root).
 */
export const appShellAsideRecipe = cv({
  base: '[grid-area:aside] flex flex-col min-w-0 bg-(--sds-color-surface-default) overflow-y-auto',
  variants: {
    position: {
      start: 'border-e border-(--sds-color-border-subtle)',
      end: 'border-s border-(--sds-color-border-subtle)',
    },
  },
  defaultVariants: { position: 'end' },
});

/**
 * Main recipe. The `<main>` landmark — the only slot that's a real semantic landmark (the
 * others are aria-labelled regions). Padding / max-width / centering are theme-spacing scale
 * literal classes so Tailwind's JIT scanner picks every cell up at build time.
 */
export const appShellMainRecipe = cv({
  base: '[grid-area:main] min-w-0 min-h-0 outline-none',
  variants: {
    padding: {
      '0': 'p-0',
      '2': 'p-2',
      '4': 'p-4',
      '6': 'p-6',
      '8': 'p-8',
      '10': 'p-10',
      '12': 'p-12',
    },
    maxWidth: {
      full: 'max-w-full',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '7xl': 'max-w-7xl',
    },
    centered: {
      true: 'mx-auto w-full',
      false: '',
    },
  },
  defaultVariants: { padding: '6', maxWidth: 'full', centered: true },
});

/**
 * Footer recipe. Sits in the `footer` grid area. No internal styling beyond a top border so
 * consumers can drop arbitrary content (links / copyright / status text) and pick their own
 * layout via `<HStack>` etc.
 */
export const appShellFooterRecipe = cv({
  base: '[grid-area:footer] flex items-center min-w-0 border-t border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) px-4 py-3 text-sm text-(--sds-color-text-muted)',
  variants: {},
  defaultVariants: {},
});

/**
 * Skip-to-content link recipe. Visually hidden by default; becomes visible (and focusable
 * styling) when focused via Tab. Pure utility classes — no logical-property tricks since the
 * link is positioned at the top of the document, not the leading edge.
 */
export const appShellSkipLinkRecipe = cv({
  base: 'sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-(--sds-color-surface-default) focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-(--sds-color-text-default) focus:shadow-lg focus:ring-2 focus:ring-(--sds-color-border-default) focus:outline-none',
});
