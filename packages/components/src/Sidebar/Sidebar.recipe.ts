import { cv } from '@apx-ui/engine';

/**
 * Root recipe. Sidebar is a vertical flex column inside whatever container its parent layout
 * (typically `<AppShell sidebar={…}>`) provides. We don't set explicit width here — AppShell or
 * the consumer controls width via the grid template; Sidebar fills its column.
 *
 * The `collapsed` axis triggers two structural changes: items center-align (icon-only rail) and
 * the root tightens its horizontal padding so the icons stay centered without ugly indentation.
 */
export const sidebarRecipe = cv({
  base: 'flex flex-col gap-1 h-full min-h-0 w-full overflow-y-auto bg-(--sds-color-surface-default) text-(--sds-color-text-default)',
  variants: {
    variant: {
      default: '',
      bordered: 'border-(--sds-color-border-subtle)',
      floating:
        'm-3 rounded-xl border border-(--sds-color-border-subtle) bg-(--sds-color-surface-raised) shadow-md',
      ghost: 'bg-transparent',
    },
    position: {
      start: '',
      end: '',
    },
    collapsed: {
      true: 'items-stretch px-1.5',
      false: '',
    },
    size: {
      sm: 'gap-0.5 p-2 text-xs',
      md: 'gap-1 p-3 text-sm',
      lg: 'gap-1.5 p-4 text-base',
    },
  },
  compoundVariants: [
    // Only the `bordered` variant draws an edge border. Direction-aware via `border-inline-{start|end}`.
    { variant: 'bordered', position: 'start', class: 'border-e' },
    { variant: 'bordered', position: 'end', class: 'border-s' },
  ],
  defaultVariants: {
    variant: 'default',
    position: 'start',
    collapsed: false,
    size: 'md',
  },
});

/**
 * Item recipe. Items are the workhorse — they render as `<a>` / `<button>` / consumer slot, and
 * pick up active/inactive/disabled state inline. The `state` axis is the truthy axis we toggle
 * per render; `variant` is the styling family the consumer picks.
 *
 * Notes:
 *   - `[&_svg]:shrink-0` keeps the icon size stable when the label takes the remaining width.
 *   - `focus-visible:ring-2` matches the Button / Input focus story.
 *   - `collapsed` flips justification + tightens horizontal padding so icon stays centered.
 */
export const sidebarItemRecipe = cv({
  base: 'group/sidebar-item relative inline-flex items-center gap-2 w-full rounded-md text-(--sds-color-text-default) no-underline outline-none transition-colors focus-visible:ring-2 focus-visible:ring-(--sds-color-border-default) [&_svg]:shrink-0',
  variants: {
    variant: {
      default: 'hover:bg-(--sds-color-surface-subtle)',
      ghost: 'hover:bg-(--sds-color-surface-subtle)/60',
      primary: 'hover:bg-(--sds-color-surface-subtle)',
    },
    size: {
      sm: 'px-2 py-1 text-xs [&_svg]:h-3.5 [&_svg]:w-3.5',
      md: 'px-2.5 py-1.5 text-sm [&_svg]:h-4 [&_svg]:w-4',
      lg: 'px-3 py-2 text-base [&_svg]:h-5 [&_svg]:w-5',
    },
    state: {
      active:
        'bg-(--sds-color-surface-subtle) text-(--sds-color-text-default) font-medium',
      inactive: '',
    },
    collapsed: {
      true: 'justify-center px-1.5',
      false: 'justify-start',
    },
    disabled: {
      true: 'pointer-events-none opacity-50',
      false: 'cursor-pointer',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    state: 'inactive',
    collapsed: false,
    disabled: false,
  },
});

/**
 * Section label recipe. Visually small, uppercase, muted — same convention as the GitHub /
 * Linear / Notion sidebars. In rail mode the label becomes `sr-only` so the section still has
 * an accessible name but no visual real estate is wasted.
 */
export const sidebarSectionLabelRecipe = cv({
  base: 'inline-flex w-full items-center justify-between gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-(--sds-color-text-muted)',
  variants: {
    collapsed: {
      true: 'sr-only',
      false: '',
    },
    collapsible: {
      true: 'cursor-pointer select-none rounded-md hover:bg-(--sds-color-surface-subtle) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--sds-color-border-default)',
      false: '',
    },
  },
  defaultVariants: {
    collapsed: false,
    collapsible: false,
  },
});

/**
 * Section body recipe. A flex column of items; in collapsible mode the disclosure animation is
 * applied externally via `grid-template-rows` on a wrapper, so we keep this recipe simple.
 */
export const sidebarSectionBodyRecipe = cv({
  base: 'flex flex-col gap-0.5',
  variants: {
    collapsed: { true: 'items-stretch', false: '' },
  },
  defaultVariants: { collapsed: false },
});

/**
 * Disclosure wrapper recipe. We use the classic `grid-template-rows: 0fr ↔ 1fr` trick (same
 * mechanism Accordion uses internally) for a smooth collapse animation without measuring
 * heights in JS. The inner `min-h-0 overflow-hidden` element holds the actual content so the
 * animation can clip it cleanly.
 */
export const sidebarDisclosureRecipe = cv({
  base: 'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
  variants: {
    open: {
      true: 'grid-rows-[1fr]',
      false: 'grid-rows-[0fr]',
    },
  },
  defaultVariants: { open: false },
});

/** Header / Footer chrome — same vertical rhythm as the main item rows. */
export const sidebarHeaderRecipe = cv({
  base: 'flex w-full items-center gap-2 px-2 py-2',
});

export const sidebarFooterRecipe = cv({
  base: 'flex w-full items-center gap-2 px-2 py-2 mt-auto border-t border-(--sds-color-border-subtle)/40',
  variants: {
    collapsed: {
      true: 'justify-center px-1',
      false: '',
    },
  },
  defaultVariants: { collapsed: false },
});

/** SubItems list recipe — indented by ~1 step so the hierarchy reads visually. */
export const sidebarSubItemsRecipe = cv({
  base: 'mt-0.5 flex flex-col gap-0.5 ps-5',
  variants: {
    collapsed: {
      // In rail mode, sub-items can't render readably; we still mount them (for SR) but visually
      // hide the indented children — consumers should generally avoid expandable items in rail
      // mode, but we don't blow up if they do.
      true: 'sr-only',
      false: '',
    },
  },
  defaultVariants: { collapsed: false },
});