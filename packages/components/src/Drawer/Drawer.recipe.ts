import { cv } from '@apx-ui/engine';

/**
 * Six recipes — same slot inventory as Modal (`backdrop`, `content`, `header`, `body`, `footer`,
 * `close`). Drawer differs from Modal in two places:
 *
 *  - **Backdrop alignment**: `side` controls flex axis + justify direction so Content anchors at
 *    the requested edge.
 *  - **Content sizing**: `side` × `size` is a 4 × 5 = 20-row compound matrix because the size
 *    axis flips between width (horizontal sides) and height (vertical sides). The plan called
 *    this out explicitly — it's the price of physical sides + a single `size` axis.
 *
 * Header / Body / Footer / Close are visually identical to Modal — same border story, same
 * size-driven padding. They could in principle share a `padBySize()` helper with Modal, but
 * we're at exactly two consumers and the helper would obscure the recipe's intent. The next
 * overlay (Toast / Menu) will trigger the extraction if the helper is still earning its keep.
 */

/**
 * Fixed-position backdrop. `flex` axis + alignment is what anchors Content at the requested edge:
 *
 *  - `left`   → row, items-stretch, justify-start  (Content sits flush left)
 *  - `right`  → row, items-stretch, justify-end    (Content sits flush right)
 *  - `top`    → column, justify-stretch, items-start (Content stretches across the top)
 *  - `bottom` → column, justify-stretch, items-end   (Content stretches across the bottom)
 *
 * No padding (`px-4` etc.) — Drawer is edge-to-edge by design.
 */
export const drawerBackdropRecipe = cv({
  base: 'fixed inset-0 z-modal flex transition-opacity duration-fast',
  variants: {
    overlay: {
      // Uses `bg-overlay` (the `--sds-overlay` token) instead of `bg-fg-default/N`. The Tailwind
      // `/N` opacity modifier can't decompose CSS variables that hold hex strings, so the old
      // class compiled to invalid CSS and rendered transparent — the page behind a Drawer didn't
      // read as blocked at all. The overlay token resolves to `rgba(0,0,0,.5)` light /
      // `rgba(0,0,0,.7)` dark and is always a real dim.
      dimmed: 'bg-overlay',
      blur: 'bg-overlay backdrop-blur-sm',
      transparent: 'bg-transparent',
    },
    side: {
      left: 'flex-row items-stretch justify-start',
      right: 'flex-row items-stretch justify-end',
      top: 'flex-col items-stretch justify-start',
      bottom: 'flex-col items-stretch justify-end',
    },
  },
  defaultVariants: {
    overlay: 'dimmed',
    side: 'left',
  },
});

/**
 * The dialog surface itself. `flex flex-col` always — even bottom/top drawers stack their
 * Header / Body / Footer vertically inside the panel. The `side` variant adds the inner border
 * (logical `border-s` / `border-e` so RTL flips correctly). The `size` axis is direction-aware
 * via compound variants below.
 *
 * Tailwind ships `max-w-{xs|sm|md|xl}` but not `max-h-{xs|sm|md|xl}`, so vertical drawers use
 * arbitrary `max-h-[Xrem]` values that mirror the rem-equivalents of the horizontal `max-w-*`
 * tokens. Keeping the rem values in lockstep means a `lg` left-drawer and a `lg` top-drawer
 * occupy the same visual budget along their respective axes.
 */
export const drawerContentRecipe = cv({
  base: [
    'relative outline-none',
    'bg-bg-paper text-fg-default shadow-2xl',
    'flex flex-col',
    'min-h-0 min-w-0',
    'transition-[opacity,transform] duration-normal ease-standard',
    'focus-visible:outline-none',
  ].join(' '),
  variants: {
    side: {
      left: 'h-full border-e border-border-default',
      right: 'h-full border-s border-border-default',
      top: 'w-full border-b border-border-default',
      bottom: 'w-full border-t border-border-default',
    },
    size: {
      // Placeholder — actual width/height applied via compound rules below. We still keep the
      // base `size` axis so theme `defaultProps.size` works the same way as everywhere else.
      sm: '',
      md: '',
      lg: '',
      xl: '',
      full: 'rounded-none',
    },
  },
  compoundVariants: [
    // Horizontal sides → width axis (max-w-*)
    { side: 'left', size: 'sm', class: 'w-full max-w-xs' },
    { side: 'left', size: 'md', class: 'w-full max-w-sm' },
    { side: 'left', size: 'lg', class: 'w-full max-w-md' },
    { side: 'left', size: 'xl', class: 'w-full max-w-xl' },
    { side: 'left', size: 'full', class: 'w-full max-w-none' },
    { side: 'right', size: 'sm', class: 'w-full max-w-xs' },
    { side: 'right', size: 'md', class: 'w-full max-w-sm' },
    { side: 'right', size: 'lg', class: 'w-full max-w-md' },
    { side: 'right', size: 'xl', class: 'w-full max-w-xl' },
    { side: 'right', size: 'full', class: 'w-full max-w-none' },
    // Vertical sides → height axis. rems mirror the max-w-* tokens (xs=20rem, sm=24rem,
    // md=28rem, xl=36rem) so a `lg` top-drawer = a `lg` left-drawer on its own axis.
    { side: 'top', size: 'sm', class: 'h-full max-h-[20rem]' },
    { side: 'top', size: 'md', class: 'h-full max-h-[24rem]' },
    { side: 'top', size: 'lg', class: 'h-full max-h-[28rem]' },
    { side: 'top', size: 'xl', class: 'h-full max-h-[36rem]' },
    { side: 'top', size: 'full', class: 'h-full max-h-none' },
    { side: 'bottom', size: 'sm', class: 'h-full max-h-[20rem]' },
    { side: 'bottom', size: 'md', class: 'h-full max-h-[24rem]' },
    { side: 'bottom', size: 'lg', class: 'h-full max-h-[28rem]' },
    { side: 'bottom', size: 'xl', class: 'h-full max-h-[36rem]' },
    { side: 'bottom', size: 'full', class: 'h-full max-h-none' },
  ],
  defaultVariants: {
    side: 'left',
    size: 'md',
  },
});

/**
 * Header — same shape as Modal's. Title + description + avatar + action slots, separated from
 * Body by a bottom border.
 */
export const drawerHeaderRecipe = cv({
  base: 'flex items-start gap-3 border-b border-border-subtle',
  variants: {
    size: {
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-6',
      full: 'p-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/**
 * Body — `flex-1 min-h-0 overflow-y-auto`. The `min-h-0` is the key: without it, `flex-1` won't
 * actually shrink below its content height, breaking the scroll bound for Drawers anchored to
 * `top` / `bottom` whose Content is height-constrained.
 */
export const drawerBodyRecipe = cv({
  base: 'flex-1 min-h-0 overflow-y-auto text-fg-default',
  variants: {
    size: {
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-6',
      full: 'p-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/** Footer — button row with `align` variant. */
export const drawerFooterRecipe = cv({
  base: 'flex items-center gap-2 border-t border-border-subtle',
  variants: {
    size: {
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-6',
      full: 'p-6',
    },
    align: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
  },
  defaultVariants: {
    size: 'md',
    align: 'end',
  },
});

/**
 * Built-in × button rendered in the corner of `<Drawer.Content>`. Logical end / top so RTL flips.
 */
export const drawerCloseRecipe = cv({
  base: [
    'absolute end-3 top-3 z-[1]',
    'inline-flex items-center justify-center',
    'size-7 rounded',
    'text-fg-muted',
    'hover:text-fg-default hover:bg-bg-subtle',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    'transition-colors duration-fast ease-standard',
  ].join(' '),
});