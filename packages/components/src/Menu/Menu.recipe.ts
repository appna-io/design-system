import { cv } from '@apx-ui/engine';

/**
 * 8 recipes for the `<Menu>` family.
 *
 * Recipe naming mirrors the theme `styleOverrides` slots:
 * `content`, `item`, `label`, `group`, `separator`, `checkboxIndicator`, `radioIndicator`,
 * `shortcut`, `subTriggerChevron`. (Yes, 9 slots — but `group` is a single-class stub that
 * mostly exists for theme parity; counted here as one of the eight "design" recipes since the
 * remaining slot — backdrop — isn't needed for a non-modal menu.)
 *
 * Precedence (same chain as Popover):
 * `recipe → theme.styleOverrides.<slot> → variant prop → sx → style → consumer className`.
 *
 * The 3 variants × 7 colors compound matrix on `content` follows Popover verbatim — `solid` is
 * color-neutral (paper bg + neutral border), `outline` paints the border, `soft` tints the bg.
 * 14 compound cells total.
 */
export const menuContentRecipe = cv({
  base: [
    'group/menu',
    'relative outline-none',
    'rounded-md border bg-bg-paper text-fg-default',
    'shadow-lg',
    'z-overlay',
    'min-w-[12rem] max-w-[20rem]',
    'transition-[opacity,transform] duration-fast ease-standard',
    'focus-visible:outline-none',
  ].join(' '),
  variants: {
    variant: {
      solid: 'border-border-default',
      outline: '',
      soft: '',
    },
    size: {
      sm: 'p-1',
      md: 'p-1',
      lg: 'p-1.5',
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
  compoundVariants: [
    // ── outline (7) ──────────────────────────────────────────────────────────────────────────
    { variant: 'outline', color: 'primary', class: 'border-primary' },
    { variant: 'outline', color: 'secondary', class: 'border-secondary' },
    { variant: 'outline', color: 'success', class: 'border-success' },
    { variant: 'outline', color: 'warning', class: 'border-warning' },
    { variant: 'outline', color: 'danger', class: 'border-danger' },
    { variant: 'outline', color: 'info', class: 'border-info' },
    { variant: 'outline', color: 'neutral', class: 'border-neutral' },
    // ── soft (7) ─────────────────────────────────────────────────────────────────────────────
    { variant: 'soft', color: 'primary', class: 'bg-primary-subtle border-primary/30' },
    { variant: 'soft', color: 'secondary', class: 'bg-secondary-subtle border-secondary/30' },
    { variant: 'soft', color: 'success', class: 'bg-success-subtle border-success/30' },
    { variant: 'soft', color: 'warning', class: 'bg-warning-subtle border-warning/30' },
    { variant: 'soft', color: 'danger', class: 'bg-danger-subtle border-danger/30' },
    { variant: 'soft', color: 'info', class: 'bg-info-subtle border-info/30' },
    { variant: 'soft', color: 'neutral', class: 'bg-neutral-subtle border-neutral/30' },
  ],
  defaultVariants: { variant: 'solid', size: 'md', color: 'neutral' },
});

/**
 * Individual row inside the menu. Highlight + disabled state are driven by `data-*` attributes
 * set imperatively by the keyboard hook (cheaper than a re-render of every sibling per arrow
 * keystroke). Two color tones: `neutral` (default) and `danger` (destructive item).
 */
export const menuItemRecipe = cv({
  base: [
    'relative flex items-center gap-2',
    'rounded-sm select-none cursor-default',
    'outline-none',
    // Highlight state — keyboard or pointer hover.
    'data-[highlighted=true]:bg-bg-subtle data-[highlighted=true]:text-fg-default',
    // Disabled state — desaturated + non-interactive.
    'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
    'focus-visible:outline-none',
  ].join(' '),
  variants: {
    size: {
      sm: 'px-2 py-1 text-xs',
      md: 'px-2 py-1.5 text-sm',
      lg: 'px-3 py-2 text-base',
    },
    color: {
      neutral: '',
      // Destructive item: red text by default; on highlight, swap to red-emphasis on red-subtle
      // bg so the destructive intent stays loud even when keyboard-navigated to.
      danger:
        'text-danger data-[highlighted=true]:bg-danger-subtle data-[highlighted=true]:text-danger',
    },
  },
  defaultVariants: { size: 'md', color: 'neutral' },
});

/**
 * Non-interactive section header. Slightly smaller + muted; not focusable. Pair with a wrapping
 * `<Menu.Group>` for ARIA `aria-labelledby` wiring.
 */
export const menuLabelRecipe = cv({
  base: 'px-2 py-1 text-xs font-medium text-fg-muted select-none',
});

/** Visual + ARIA grouping container. No padding of its own; items inside carry their own. */
export const menuGroupRecipe = cv({
  base: 'flex flex-col',
});

/** Horizontal rule between sections. Negative inline margin so it spans Content's padding. */
export const menuSeparatorRecipe = cv({
  base: '-mx-1 my-1 h-px bg-border',
});

/**
 * Checkbox indicator (the slot to the left of the label inside a `<Menu.CheckboxItem>`). Always
 * reserves space so unchecked items line up with checked items + radio items. The icon is
 * conditionally rendered; only the *box* is recipe-styled.
 */
export const menuCheckboxIndicatorRecipe = cv({
  base: 'inline-flex size-4 items-center justify-center text-current shrink-0',
});

/** Radio indicator — same slot reservation as checkbox so icons line up consistently. */
export const menuRadioIndicatorRecipe = cv({
  base: 'inline-flex size-4 items-center justify-center text-current shrink-0',
});

/**
 * Right-aligned (logical-end) shortcut label. `ms-auto` pushes it to the end edge; `tracking-widest`
 * gives the typographic feel of platform shortcut hints (⌘P, ⌃⇧K).
 */
export const menuShortcutRecipe = cv({
  base: 'ms-auto text-xs text-fg-muted tracking-widest',
});

/** Chevron at the logical end of a SubTrigger. RTL flips automatically via the parent's `dir`. */
export const menuSubTriggerChevronRecipe = cv({
  base: 'ms-auto size-4 text-fg-muted rtl:rotate-180',
});