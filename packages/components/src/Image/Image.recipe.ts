import { cv } from '@apx-ui/engine';

/**
 * Single-slot recipe for `<Image />`. Every axis maps 1:1 onto token-backed utilities so a
 * theme swap re-skins imagery (radius scale, shadow scale) with zero component changes.
 *
 * `aspectRatio` is deliberately NOT a recipe axis: it's a continuous value ('4/3', '16/9',
 * '1/1', …) that comes straight from content, so the component sets it via the style engine
 * instead of enumerating a class per ratio (which the JIT scanner could never see).
 */
export const imageRecipe = cv({
  base: 'block max-w-full object-center select-none',
  variants: {
    fit: {
      cover: 'object-cover',
      contain: 'object-contain',
    },
    radius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
    shadow: {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    },
    fullWidth: {
      true: 'w-full',
    },
  },
});
