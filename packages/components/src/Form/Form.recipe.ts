import { cv } from '@apx-ui/engine';

/**
 * Visual rhythm for `<Form>`. Forms are mostly invisible — children carry the layout — so the
 * recipe just owns vertical gap between top-level Field rows. Three presets cover the common
 * densities: `compact` for inline filters, `stack` (default) for typical settings pages,
 * `spaced` for marketing sign-up pages.
 */
export const formRecipe = cv({
  base: 'flex flex-col w-full',
  variants: {
    layout: {
      stack: 'gap-4',
      compact: 'gap-2',
      spaced: 'gap-6',
    },
  },
  defaultVariants: { layout: 'stack' },
});
