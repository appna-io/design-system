import { cv } from '@apx-ui/engine';

/**
 * Five recipes covering the entire visual surface of `<Accordion>` + its three subparts:
 *
 *  - `root`            — wrapper that groups the items (border / spacing depends on variant).
 *  - `item`            — per-item chrome (border, rounded corners, soft tint, etc).
 *  - `trigger`         — the clickable header button (padding, hover, focus ring).
 *  - `content`         — the animated wrapper using the CSS `grid-rows: 0fr → 1fr` trick.
 *  - `contentInner`    — inner padding container ( `min-h-0` is required for the grid trick).
 *  - `chevron`         — caret rotation + size + logical-side ordering.
 *
 * The 4 variants × 7 colors compound matrix lives in `item` only — the trigger/content stay
 * color-neutral so consumers can opt in to bold-color chrome (Accordion + outline + primary)
 * without forcing every label into a brand color. Same DRY logic Badge / Alert use: rows are
 * written out flat for Tailwind's content scanner.
 *
 * The grid-rows trick (`grid grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]` on `content`,
 * paired with `min-h-0` on the inner) is the modern "auto-height transition" pattern. It
 * doesn't require JS height measurement, supports content that grows asynchronously (image
 * loads, async data), and respects `prefers-reduced-motion` via Tailwind's `motion-reduce`
 * variant on the transition duration.
 */
export const accordionRootRecipe = cv({
  base: 'w-full text-fg',
  variants: {
    variant: {
      // `solid` wraps every item in a single border + rounded corners; items are separated by
      // a horizontal divider so the group reads as one continuous list.
      solid: 'border border-border rounded-md overflow-hidden bg-bg-paper',
      // `outline` keeps each item as its own card (border + rounding lives on the item recipe).
      outline: 'space-y-2',
      // `soft` is the tinted-card variant — same gap rhythm as outline but no border.
      soft: 'space-y-2',
      // `ghost` is chrome-less: no wrapper border or spacing; only the trigger row carries
      // visual weight. Useful inline inside cards or settings sections.
      ghost: '',
    },
  },
  defaultVariants: { variant: 'solid' },
});

export const accordionItemRecipe = cv({
  base: 'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
  variants: {
    variant: {
      // Separator between items inside the solid wrapper. `last:border-b-0` removes the bottom
      // rule so the last item flushes against the wrapper edge.
      solid: 'border-b border-border last:border-b-0',
      outline: 'border border-border rounded-md overflow-hidden',
      soft: 'rounded-md overflow-hidden',
      ghost: '',
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
      neutral: '',
    },
  },
  // Compound rows: soft variants pick up the color-subtle background; outline variants pick
  // up the colored border. Solid + ghost stay color-neutral by design — bold-color chrome on
  // a continuous list (solid) or chrome-less context (ghost) reads as noise.
  compoundVariants: [
    // ── soft × color (7) ─────────────────────────────────────────────────────────────────────
    { variant: 'soft', color: 'primary', class: 'bg-primary-subtle' },
    { variant: 'soft', color: 'secondary', class: 'bg-secondary-subtle' },
    { variant: 'soft', color: 'success', class: 'bg-success-subtle' },
    { variant: 'soft', color: 'warning', class: 'bg-warning-subtle' },
    { variant: 'soft', color: 'danger', class: 'bg-danger-subtle' },
    { variant: 'soft', color: 'info', class: 'bg-info-subtle' },
    { variant: 'soft', color: 'neutral', class: 'bg-bg-subtle' },
    // ── outline × color (7) ──────────────────────────────────────────────────────────────────
    { variant: 'outline', color: 'primary', class: 'border-primary-border' },
    { variant: 'outline', color: 'secondary', class: 'border-secondary-border' },
    { variant: 'outline', color: 'success', class: 'border-success-border' },
    { variant: 'outline', color: 'warning', class: 'border-warning-border' },
    { variant: 'outline', color: 'danger', class: 'border-danger-border' },
    { variant: 'outline', color: 'info', class: 'border-info-border' },
    { variant: 'outline', color: 'neutral', class: 'border-border' },
  ],
  defaultVariants: { variant: 'solid', color: 'neutral' },
});

export const accordionTriggerRecipe = cv({
  base: [
    'group/trigger',
    'flex w-full items-center gap-3',
    'font-medium text-fg cursor-pointer',
    'transition-colors duration-fast ease-standard',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
    'hover:bg-bg-subtle',
    'data-[state=open]:font-semibold',
    'disabled:cursor-not-allowed disabled:hover:bg-transparent',
  ].join(' '),
  variants: {
    size: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    },
  },
  defaultVariants: { size: 'md' },
});

/**
 * The animated wrapper. The `grid-template-rows` transition between `0fr` (collapsed) and `1fr`
 * (expanded) is the modern auto-height pattern — no JS measurement, no flicker, supports
 * dynamically-resizing content. The inner element must declare `min-h-0` so the grid track can
 * shrink below the inner's intrinsic min-content height.
 *
 * `motion-reduce:duration-[0.12s]` keeps a brief signal of state change for reduced-motion
 * users (zero-duration snaps are jarring on long lists), per Apple HIG / WAI guidance.
 */
/**
 * The animated wrapper. We hide collapsed content with a hard `display: grid` + zero-sized
 * row track AND a zero `max-block-size` belt-and-suspenders.
 *
 * Why both:
 *
 * 1. `grid-template-rows: 0fr → 1fr` is the modern CSS-only auto-height pattern. The track
 *    transitions between zero and the inner's intrinsic height; no JS measurement, supports
 *    asynchronously growing children. This is what carries the smooth open/close animation.
 * 2. The grid-rows trick on its own is **not enough** to clip closed content in the wild —
 *    the row track resolves to its grid item's `min-content` floor, which (for an item with
 *    block-level padding like `pb-{size}`) is ~16 px, not zero. Even with `min-h-0` and
 *    `overflow-hidden` on the inner, browsers leak the padding band under the trigger
 *    (reproduced by Ahmad against `<Accordion>` Basic example, 2026-05-21).
 * 3. Layering `max-h-0 data-[state=open]:max-h-screen` provides the hard clip: when closed
 *    the wrapper's `max-height: 0` plus `overflow-hidden` guarantees zero visible chrome,
 *    regardless of what the grid layout decides about the row floor. When open the cap is
 *    `100vh` (well above any realistic disclosure content) so the grid-rows transition
 *    drives the animation freely under it.
 *
 * `motion-reduce:duration-[120ms]` keeps a brief signal of state change for reduced-motion
 * users (zero-duration snaps are jarring on long lists), per Apple HIG / WAI guidance.
 */
export const accordionContentRecipe = cv({
  base: [
    'grid grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]',
    'max-h-0 data-[state=open]:max-h-screen',
    'transition-[grid-template-rows,max-height] duration-normal ease-standard',
    'motion-reduce:duration-[120ms]',
    'overflow-hidden',
  ].join(' '),
});

/**
 * The inner element is the grid **item**:
 *
 *  - `min-h-0` overrides the default `min-height: auto` that grid items carry, so the grid
 *    track is allowed to shrink past the inner's intrinsic min-content height. Without it,
 *    the grid-rows transition would never reach zero even with the `max-h` cap above —
 *    the row would stay anchored to the inner's `pb-{size}` floor and snap to it on close.
 *  - `overflow-hidden` clips the inner's own children to the (zero-sized) grid cell during
 *    the closing transition. Belt-and-suspenders with the outer's `overflow-hidden`.
 *
 * Treat `min-h-0 overflow-hidden` here, and `max-h-0 …` + `overflow-hidden` on the outer,
 * as a single contract — removing any one re-introduces the `accordion-collapse-content-visible`
 * regression. Reported by Ahmad, 2026-05-21.
 */
export const accordionContentInnerRecipe = cv({
  base: 'min-h-0 overflow-hidden text-fg',
  variants: {
    size: {
      sm: 'px-3 pb-3 text-sm',
      md: 'px-4 pb-4 text-base',
      lg: 'px-5 pb-5 text-base',
    },
  },
  defaultVariants: { size: 'md' },
});

/**
 * Chevron caret. Rotates 180° on open. `ms-auto` (logical-end margin) pushes it to the end of
 * the trigger row when `iconPosition="end"`; the `start` order puts it at the logical start.
 * Both flip correctly in RTL via the logical properties.
 */
export const accordionChevronRecipe = cv({
  base: [
    'shrink-0 transition-transform duration-fast ease-standard',
    'text-fg-muted',
    'data-[state=open]:rotate-180',
    'motion-reduce:transition-none',
    'group-hover/trigger:text-fg',
  ].join(' '),
  variants: {
    size: {
      sm: 'size-3.5',
      md: 'size-4',
      lg: 'size-5',
    },
    iconPosition: {
      start: 'order-first',
      end: 'order-last ms-auto',
    },
  },
  defaultVariants: { size: 'md', iconPosition: 'end' },
});