import { cv } from '@apx-ui/engine';

/**
 * The Icon recipe. `inline-block` + `shrink-0` is the canonical "atom that doesn't disturb
 * flex layouts" combo. `[&_svg]:h-full [&_svg]:w-full` makes a child `<svg>` adopt the
 * wrapper's box dimensions so consumers don't have to size SVGs themselves. `fill-current` /
 * `stroke-current` lets `currentColor` cascade through both lucide-style (stroke-only) and
 * heroicons-style (fill-only) glyphs in one go.
 *
 * The `size` token classes set both width/height AND fontSize — the latter so a child SVG
 * defined in `1em` units (lucide does this by default) scales correctly.
 */
export const iconRecipe = cv({
  base: [
    'inline-block shrink-0',
    '[&_svg]:h-full [&_svg]:w-full',
    '[&_svg]:fill-current [&_svg]:stroke-current',
  ].join(' '),
  variants: {
    size: {
      xs: 'h-3 w-3 text-[12px]',
      sm: 'h-3.5 w-3.5 text-[14px]',
      md: 'h-4 w-4 text-[16px]',
      lg: 'h-5 w-5 text-[20px]',
      xl: 'h-6 w-6 text-[24px]',
    },
    color: {
      current: 'text-current',
      inherit: 'text-inherit',
      default: 'text-fg-default',
      muted: 'text-fg-muted',
      subtle: 'text-fg-subtle',
      // Palette tokens — `*-emphasis` would be the high-contrast variant on most palette
      // systems; we use the bare role name which most theme implementations map to the
      // "main" color stop. Falls back gracefully if a theme overrides.
      accent: 'text-secondary',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      info: 'text-info',
    },
    rotate: {
      '0': '',
      '90': 'rotate-90',
      '180': 'rotate-180',
      '270': '-rotate-90',
    },
    flip: {
      none: '',
      horizontal: 'scale-x-[-1]',
      vertical: 'scale-y-[-1]',
      both: 'scale-x-[-1] scale-y-[-1]',
    },
    spin: {
      true: 'animate-spin motion-reduce:animate-none',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'current',
    rotate: '0',
    flip: 'none',
    spin: false,
  },
});
