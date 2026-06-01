import { cv } from '@apx-ui/engine';

/**
 * Six recipes — Modal is the most slot-heavy compound in the DS so far. Each subpart owns its
 * own recipe so theme `styleOverrides.{ backdrop, content, header, body, footer, close }` plays
 * nicely without a god-recipe.
 *
 * Sizes drive padding **per slot** (Header, Body, Footer, Close) so `<Modal.Content size="lg">`
 * automatically scales every region without per-slot consumer wiring. The DRY trade-off: same
 * size token appears in 4 recipes. Cheaper than a god-recipe full of compound rules.
 *
 * Pattern note: when Drawer ships next phase, lift the per-slot size axis into a tiny shared
 * `padBySize()` helper. Two consumers is the threshold; we're at one.
 */

/**
 * The fixed-position backdrop layer. `flex` lets `placement` (`center` / `top`) align Content
 * vertically without per-Content positioning.
 */
export const modalBackdropRecipe = cv({
  base: 'fixed inset-0 z-modal flex justify-center px-4 transition-opacity duration-fast',
  variants: {
    overlay: {
      // Uses the dedicated `bg-overlay` token (`--sds-overlay`: `rgba(0,0,0,.5)` light /
      // `rgba(0,0,0,.7)` dark) instead of `bg-fg-default/60`. The Tailwind `/N` opacity
      // modifier requires the underlying color to be decomposable into RGB triplets — our
      // palette vars are hex strings, so `rgb(var(--sds-palette-foreground-default) / 0.6)`
      // evaluated to invalid CSS and the browser silently fell back to transparent (= no
      // dim at all, which read as "the modal isn't blocking the page"). The overlay token
      // sidesteps the issue and is always actually-dark across modes.
      dimmed: 'bg-overlay',
      blur: 'bg-overlay backdrop-blur-sm',
      transparent: 'bg-transparent',
    },
    placement: {
      center: 'items-center',
      // `mt-[10vh]` keeps the dialog comfortably below the top edge while still reachable on
      // tall screens. `items-start` makes Content stack against the offset.
      top: 'items-start pt-[10vh]',
    },
  },
  defaultVariants: {
    overlay: 'dimmed',
    placement: 'center',
  },
});

/**
 * The dialog surface itself. `flex flex-col max-h-[calc(100vh-4rem)]` lets `<Modal.Body>`'s
 * `overflow-y-auto` bound itself against the viewport without each consumer doing the math.
 */
export const modalContentRecipe = cv({
  base: [
    'relative outline-none',
    'w-full',
    'rounded-lg',
    'bg-bg-paper text-fg-default',
    'flex flex-col',
    'max-h-[calc(100vh-4rem)]',
    'transition-[opacity,transform] duration-normal ease-standard',
    'focus-visible:outline-none',
  ].join(' '),
  variants: {
    variant: {
      solid: 'shadow-2xl border border-transparent',
      outline: 'shadow-xl border border-border-default',
    },
    size: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-2xl',
      // `full` clears the rounded corners + the viewport gutter and stretches to viewport edges.
      // The backdrop's `px-4` is overridden by `mx-0` here so Content actually reaches the edge.
      full: 'max-w-none w-full h-[100vh] max-h-none rounded-none -mx-4',
      fit: 'max-w-fit',
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});

/**
 * Header — title + description + avatar + action slots. The bottom border separates from Body;
 * `gap-3` spaces the avatar from the title block.
 */
export const modalHeaderRecipe = cv({
  base: 'flex items-start gap-3 border-b border-border-subtle',
  variants: {
    size: {
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-6',
      full: 'p-6',
      fit: 'p-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/**
 * Body — `flex-1` so it fills the space between Header and Footer; `overflow-y-auto` lets long
 * content scroll while Header / Footer stay pinned.
 */
export const modalBodyRecipe = cv({
  base: 'flex-1 overflow-y-auto text-fg-default',
  variants: {
    size: {
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-6',
      full: 'p-6',
      fit: 'p-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/** Footer — button row. The top border separates from Body; `gap-2` spaces the buttons. */
export const modalFooterRecipe = cv({
  base: 'flex items-center gap-2 border-t border-border-subtle',
  variants: {
    size: {
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-6',
      full: 'p-6',
      fit: 'p-5',
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
 * The built-in × button rendered in the corner of `<Modal.Content>`. Sits at logical end / top
 * (`end-3 top-3`) so RTL flips it automatically.
 */
export const modalCloseRecipe = cv({
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