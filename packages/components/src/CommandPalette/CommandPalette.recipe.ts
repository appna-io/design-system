import { cv } from '@apx-ui/engine';

/**
 * Recipe slots for CommandPalette. We deliberately do **not** extend `controlBase` /
 * `variantColorMatrix` here — the palette is a Modal-styled overlay, not a form control. The
 * accent color drives the active-row highlight only (background + border-inline-start), so the
 * compound-variant matrix lives on `commandPaletteRowRecipe` and weighs in at 7 rows (one per
 * color), not 28 (no `variant × color` explosion).
 *
 * Slot map (7 slots):
 *  1. `commandPaletteContentRecipe` — overrides the Modal Content max-width per palette size.
 *  2. `commandPaletteSearchRecipe`  — search input wrapper (icon + input + spinner).
 *  3. `commandPaletteSearchInputRecipe` — the bare `<input>` element.
 *  4. `commandPaletteListRecipe`    — scrolling listbox container.
 *  5. `commandPaletteRowRecipe`     — individual command rows (`role="option"`).
 *  6. `commandPaletteCategoryRecipe`— section headers above grouped rows.
 *  7. `commandPaletteFooterRecipe`  — hint strip at the bottom.
 *
 * Plus three smaller utility recipes (`empty`, `pageHeader`, `shortcut`) that don't need
 * variants — exported as `cv({ base: '…' })` so theme `styleOverrides` can still target them.
 */

/** Max-width override on top of Modal Content (Modal's own size axis is `sm/md/lg/xl/full`). */
export const commandPaletteContentRecipe = cv({
  base: 'flex flex-col p-0 overflow-hidden',
  variants: {
    size: {
      sm: 'max-w-[480px]',
      md: 'max-w-[640px]',
      lg: 'max-w-[800px]',
    },
    variant: {
      solid: 'bg-bg-paper',
      soft: 'bg-bg-subtle',
      minimal: 'bg-bg-paper shadow-none',
    },
  },
  defaultVariants: { size: 'md', variant: 'solid' },
});

export const commandPaletteSearchRecipe = cv({
  base: 'flex items-center gap-3 px-4 py-3 border-b border-border-subtle',
  variants: {
    size: {
      sm: 'px-3 py-2 gap-2',
      md: 'px-4 py-3 gap-3',
      lg: 'px-5 py-4 gap-3',
    },
  },
  defaultVariants: { size: 'md' },
});

export const commandPaletteSearchInputRecipe = cv({
  base: [
    'flex-1 min-w-0 bg-transparent border-0 outline-none',
    'text-fg-default placeholder:text-fg-muted',
    'focus:outline-none focus:ring-0',
  ].join(' '),
  variants: {
    size: {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
    },
  },
  defaultVariants: { size: 'md' },
});

export const commandPaletteListRecipe = cv({
  base: 'overflow-y-auto outline-none',
  variants: {
    size: {
      sm: 'max-h-[320px]',
      md: 'max-h-[480px]',
      lg: 'max-h-[640px]',
    },
  },
  defaultVariants: { size: 'md' },
});

/**
 * Row recipe. `state` drives the highlight (idle / active / disabled), and the
 * compoundVariants `active × color` matrix paints the accent bar + tinted background.
 *
 * `cursor-pointer` is intentional — even though the row is keyboard-driven via the parent
 * input, mouse users expect the affordance.
 */
export const commandPaletteRowRecipe = cv({
  base: [
    'flex items-center gap-3 px-4 cursor-pointer select-none',
    'transition-colors duration-fast',
    'border-inline-start-2 border-transparent',
  ].join(' '),
  variants: {
    size: {
      sm: 'h-9 text-sm',
      md: 'h-11 text-base',
      lg: 'h-14 text-lg',
    },
    state: {
      idle: 'hover:bg-bg-subtle',
      active: 'bg-bg-subtle',
      disabled: 'opacity-50 pointer-events-none',
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
    {
      state: 'active',
      color: 'primary',
      class: 'bg-primary-subtle border-primary',
    },
    {
      state: 'active',
      color: 'secondary',
      class: 'bg-secondary-subtle border-secondary',
    },
    {
      state: 'active',
      color: 'success',
      class: 'bg-success-subtle border-success',
    },
    {
      state: 'active',
      color: 'warning',
      class: 'bg-warning-subtle border-warning',
    },
    {
      state: 'active',
      color: 'danger',
      class: 'bg-danger-subtle border-danger',
    },
    {
      state: 'active',
      color: 'info',
      class: 'bg-info-subtle border-info',
    },
    {
      state: 'active',
      color: 'neutral',
      class: 'bg-neutral-subtle border-neutral',
    },
  ],
  defaultVariants: { size: 'md', state: 'idle', color: 'primary' },
});

export const commandPaletteCategoryRecipe = cv({
  base: [
    'sticky top-0 z-10 px-4 py-1.5',
    'text-xs font-semibold uppercase tracking-wider text-fg-muted',
    'bg-bg-paper border-t border-border-subtle',
  ].join(' '),
});

export const commandPaletteFooterRecipe = cv({
  base: [
    'flex items-center justify-between gap-4 px-4 py-2',
    'text-xs text-fg-muted',
    'border-t border-border-subtle bg-bg-subtle/50',
  ].join(' '),
});

export const commandPaletteEmptyRecipe = cv({
  base: 'px-4 py-12 text-center text-fg-muted',
});

export const commandPalettePageHeaderRecipe = cv({
  base: [
    'flex items-center gap-2 px-4 py-2',
    'text-sm text-fg-muted',
    'border-b border-border-subtle bg-bg-subtle/50',
  ].join(' '),
});

export const commandPaletteShortcutRecipe = cv({
  base: 'ms-auto flex items-center gap-1 shrink-0',
});

/** `<Kbd>` recipe — own file would be overkill (single tiny visual primitive). */
export const kbdRecipe = cv({
  base: [
    'inline-flex items-center justify-center',
    'font-mono font-medium',
    'border border-border-subtle rounded',
    'text-fg-default',
  ].join(' '),
  variants: {
    size: {
      sm: 'px-1 py-0 text-xs min-w-[1.25rem] h-5',
      md: 'px-1.5 py-0.5 text-sm min-w-[1.5rem] h-6',
      lg: 'px-2 py-1 text-base min-w-[1.75rem] h-7',
    },
    variant: {
      solid: 'bg-bg-subtle',
      outline: 'bg-transparent',
      soft: 'bg-bg-emphasis text-fg-inverted border-bg-emphasis',
    },
  },
  defaultVariants: { size: 'md', variant: 'solid' },
});
