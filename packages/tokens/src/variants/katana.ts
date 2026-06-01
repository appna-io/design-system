import type { ThemeVariantDefinition } from './types';

/**
 * `katana` (刀, "sword") — diagonal radii. Every surface rounds top-left + bottom-right while
 * keeping top-right + bottom-left sharp, the canonical shape being `border-radius: 8px 0px`
 * (the user-requested design that gave this variant its name).
 *
 * The shape reads like a katana's edge geometry — one diagonal honed, the other left blunt —
 * which gives the DS a tactile, single-stroke identity nothing else owns.
 *
 * The radii are encoded as two-value CSS shorthands (`"<radius> 0px"`). Component recipes that
 * use `border-radius` directly — including Tailwind's shorthand utility `rounded-md` (which
 * expands to `border-radius: var(--sds-radius-md)`) — pick this up correctly. Recipes using the
 * **corner-specific longhand utilities** (`rounded-tl-md`, `rounded-tr-md`, `rounded-bl-md`,
 * `rounded-br-md`) would misinterpret `"8px 0px"` as an elliptical corner and render a
 * flattened oval instead of the diagonal. Prefer `rounded-<size>` shorthand for variant
 * compatibility; reach for the longhand only when you've intentionally opted out of variant
 * inheritance.
 *
 * `radius.full` is preserved so components that explicitly opt into pills / avatars still work
 * (pills inside a katana surface stay pills).
 */
export const katanaVariant: ThemeVariantDefinition = {
  name: 'katana',
  tokens: {
    radius: {
      none: '0px',
      xs: '2px 0px',
      sm: '4px 0px',
      md: '8px 0px',
      lg: '12px 0px',
      xl: '16px 0px',
      '2xl': '20px 0px',
      '3xl': '28px 0px',
      full: '9999px',
    },
  },
};