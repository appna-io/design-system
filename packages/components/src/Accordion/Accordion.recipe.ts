import { cv } from '@apx-ui/engine';

/**
 * Recipes covering the entire visual surface of `<Accordion>` + its three subparts:
 *
 *  - `root`            — wrapper that groups the items (border / spacing depends on variant).
 *  - `item`            — per-item chrome (border, rounded corners, soft tint, etc).
 *  - `trigger`         — the clickable header button (padding, hover, focus ring).
 *  - `content`         — the animated wrapper using the CSS `grid-rows: 0fr → 1fr` trick.
 *  - `contentClip`     — the unpadded grid item (`min-h-0 overflow-hidden`) the track collapses.
 *  - `contentInner`    — the padded `role="region"` inside the clip.
 *  - `chevron`         — caret rotation + size + logical-side ordering.
 *
 * The 4 variants × 7 colors compound matrix lives in `item` only — the trigger/content stay
 * color-neutral so consumers can opt in to bold-color chrome (Accordion + outline + primary)
 * without forcing every label into a brand color. Same DRY logic Badge / Alert use: rows are
 * written out flat for Tailwind's content scanner.
 *
 * The grid-rows trick (`grid grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]` on `content`,
 * paired with an unpadded `min-h-0` grid item) is the modern "auto-height transition" pattern. It
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
 * The animated wrapper. `grid-template-rows: 0fr → 1fr` is the modern CSS-only auto-height
 * pattern: the single row track transitions between zero and the content's intrinsic height —
 * no JS measurement, and content that grows asynchronously (image loads, async data) just works.
 *
 * The track can only reach zero if its grid item has no padding or border: a box can't be
 * shorter than its own padding, so a padded item leaves a `pb-{size}` band showing when closed
 * (plans/bugs/accordion-collapse-content-visible.md). That's why the grid item is the unpadded
 * `contentClip` and the padding lives one level further in, on `contentInner`.
 *
 * An earlier fix clipped that band with `max-h-0 → max-h-screen` instead. It hid the band but
 * made the toggle lag: `max-height` animated over the full viewport height, so on close the
 * panel stopped at the padding band for roughly half the transition before collapsing, and on
 * open it did nothing for the first frames and then jumped
 * (plans/bugs/accordion-toggle-lag.md). Don't reintroduce a `max-height` cap.
 *
 * `motion-reduce:duration-[120ms]` keeps a brief signal of state change for reduced-motion
 * users (zero-duration snaps are jarring on long lists), per Apple HIG / WAI guidance.
 */
export const accordionContentRecipe = cv({
  base: [
    'grid grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]',
    'transition-[grid-template-rows] duration-normal ease-standard',
    'motion-reduce:duration-[120ms]',
    'overflow-hidden',
  ].join(' '),
});

/**
 * The grid **item**. It must stay free of padding and border (see `accordionContentRecipe`):
 *
 *  - `min-h-0` overrides the `min-height: auto` grid items get by default, so the track can
 *    shrink below the content's min-content height.
 *  - `overflow-hidden` clips the padded region to the shrinking cell while it closes.
 */
export const accordionContentClipRecipe = cv({
  base: 'min-h-0 overflow-hidden',
});

/**
 * The padded `role="region"` inside the clip. It takes the consumer's `className` / `sx` /
 * `style`, so padding overrides land here without affecting the collapse.
 */
export const accordionContentInnerRecipe = cv({
  base: 'text-fg',
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