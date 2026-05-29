import { cv } from '@apx-ui/engine';

/**
 * `<Div />` is a styling primitive — its recipe is intentionally **minimal**. The whole
 * style-shorthand surface (display / flex / margin / padding / color / ...) is resolved into a
 * single inline `style` object via `extractStyleProps` + the engine's `sxToStyle`, so the recipe
 * only carries the **class-based** features that can't be expressed inline:
 *
 *   - `hideOn` — Tailwind "from breakpoint upward" hide (`md:hidden`, `lg:hidden`, ...).
 *   - `displayOn` — start hidden, reveal at breakpoint and above (`hidden md:block`, ...).
 *
 * Every class is a literal Tailwind utility so the JIT scanner discovers them at build time
 * (no `safelist` required, no arbitrary variants).
 */
export const divRecipe = cv({
  base: '',
  variants: {
    hideOn: {
      sm: 'sm:hidden',
      md: 'md:hidden',
      lg: 'lg:hidden',
      xl: 'xl:hidden',
      '2xl': '2xl:hidden',
    },
    displayOn: {
      sm: 'hidden sm:block',
      md: 'hidden md:block',
      lg: 'hidden lg:block',
      xl: 'hidden xl:block',
      '2xl': 'hidden 2xl:block',
    },
  },
});
