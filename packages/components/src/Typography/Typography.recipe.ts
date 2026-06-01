import { cv } from '@apx-ui/engine';

/**
 * `<Typography />` recipe — variant axis only. Every variant emits a literal Tailwind class
 * string so the JIT scanner picks them up at build time (no `safelist` needed) and the variant
 * machinery shares the same `cv` / `useThemedClasses` pipeline every other DS component uses.
 *
 * The 13 variants split into four groups:
 *
 *   - **Display** — oversize visual heading. Still semantically `<h1>` (see `variantElement.ts`).
 *   - **Headings (`h1`…`h6`)** — semantic heading levels, sized + weighted appropriately.
 *   - **Body (`body`, `bodyLarge`, `bodySmall`)** — paragraph copy at three densities.
 *   - **Supporting (`caption`, `overline`, `code`)** — small accent text styles for metadata,
 *     section labels, and inline code spans.
 *
 * Color choices live inside the variant strings only where it's an intrinsic part of the style
 * (e.g. `caption` is muted by default; `code` carries a subtle background). For palette overrides
 * consumers pass `color="primary.main"` which flows through Div's `sxToStyle` resolver.
 */
export const typographyRecipe = cv({
  base: 'min-w-0',
  variants: {
    variant: {
      display: 'text-5xl font-bold leading-tight tracking-tight',
      h1: 'text-4xl font-semibold leading-tight tracking-tight',
      h2: 'text-3xl font-semibold leading-tight tracking-tight',
      h3: 'text-2xl font-semibold leading-snug',
      h4: 'text-xl font-semibold leading-snug',
      h5: 'text-lg font-semibold leading-snug',
      h6: 'text-base font-semibold leading-normal',
      body: 'text-base font-normal leading-normal',
      bodyLarge: 'text-lg font-normal leading-relaxed',
      bodySmall: 'text-sm font-normal leading-normal',
      caption: 'text-xs font-normal leading-normal text-fg-muted',
      overline: 'text-xs font-medium uppercase tracking-wider text-fg-muted',
      code: 'font-mono text-sm bg-bg-subtle px-1 py-0.5 rounded-sm',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});