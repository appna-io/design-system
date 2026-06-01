import { cv } from '@apx-ui/engine';

/**
 * Root recipe. The NavigationMenu root is a flex container — horizontal by
 * default, vertical when consumers pass `orientation="vertical"`. We deliberately
 * keep the root's chrome minimal (no border / no background) because the menu
 * almost always lives inside an AppShell header that already paints the chrome.
 */
export const navMenuRootRecipe = cv({
  base: 'relative isolate flex outline-none',
  variants: {
    orientation: {
      horizontal: 'flex-row items-center gap-1',
      vertical: 'flex-col items-stretch gap-1',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
  },
});

/**
 * Item wrapper recipe. Items are `<li role="none">` — purely structural, no own
 * styling beyond `position: relative` so the Indicator can be absolutely
 * positioned relative to the menu and items still snap to the layout grid.
 */
export const navMenuItemRecipe = cv({
  base: 'relative inline-flex items-stretch list-none',
  variants: {
    orientation: {
      horizontal: '',
      vertical: 'w-full',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

/**
 * Trigger / Link recipe. The two share visuals — a Trigger is "Link-with-chevron"
 * and the keyboard story differs (Trigger opens a panel; Link navigates) but the
 * resting / hover / focus / active visuals are the same.
 *
 *   - `[&_svg]:shrink-0` keeps icons stable when the label takes the remaining width.
 *   - `focus-visible:ring-2` matches the Sidebar / Button / Input focus story.
 *   - The `state="active"` axis is read from `data-active="true"` set by the Item's
 *     active-state resolution; we apply it at the recipe level so consumers can
 *     override via `theme.components.NavigationMenu.styleOverrides.trigger`.
 */
export const navMenuTriggerRecipe = cv({
  base: 'group/nav-trigger relative inline-flex items-center gap-1.5 rounded-md font-medium text-(--sds-color-text-default) no-underline outline-none transition-colors focus-visible:ring-2 focus-visible:ring-(--sds-color-border-default) [&_svg]:shrink-0',
  variants: {
    variant: {
      default:
        'hover:bg-(--sds-color-surface-subtle) data-[active=true]:text-(--sds-color-text-default) data-[state=open]:bg-(--sds-color-surface-subtle)',
      ghost:
        'hover:bg-(--sds-color-surface-subtle)/60 data-[state=open]:bg-(--sds-color-surface-subtle)/60',
      pill:
        'hover:bg-(--sds-color-surface-subtle) data-[active=true]:bg-(--sds-color-surface-subtle) data-[state=open]:bg-(--sds-color-surface-subtle)',
    },
    size: {
      sm: 'px-2 py-1 text-xs [&_svg]:h-3.5 [&_svg]:w-3.5',
      md: 'px-3 py-1.5 text-sm [&_svg]:h-4 [&_svg]:w-4',
      lg: 'px-4 py-2 text-base [&_svg]:h-5 [&_svg]:w-5',
    },
    state: {
      active: 'font-semibold text-(--sds-color-text-default)',
      inactive: '',
    },
    disabled: {
      true: 'pointer-events-none opacity-50',
      false: 'cursor-pointer',
    },
    orientation: {
      horizontal: '',
      vertical: 'w-full justify-start',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    state: 'inactive',
    disabled: false,
    orientation: 'horizontal',
  },
});

/**
 * Chevron recipe. Auto-rendered inside `<NavigationMenu.Trigger>` (consumers can
 * hide it with `hideChevron`). Rotates 180° on the open state — the data-state
 * selector on the trigger (`data-state="open"`) is the source of truth; the
 * chevron is purely visual.
 */
export const navMenuChevronRecipe = cv({
  base: 'inline-flex h-3 w-3 shrink-0 items-center justify-center text-current transition-transform duration-150 motion-reduce:transition-none group-data-[state=open]/nav-trigger:rotate-180',
});

/**
 * Content recipe. The portalled dropdown panel.
 *
 *   - `default` — narrow single-column dropdown (~ 14rem min); Stripe / Notion / GitHub.
 *   - `mega`    — wide multi-column panel (~ 36rem min) with extra padding.
 *
 * The actual width is content-driven; we just set `min-width` so the panel never
 * collapses to a sliver around a single short label.
 */
export const navMenuContentRecipe = cv({
  base: 'z-50 rounded-lg border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) text-(--sds-color-text-default) shadow-lg outline-none',
  variants: {
    variant: {
      default: 'min-w-[14rem] p-2',
      mega: 'min-w-[36rem] p-6',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

/**
 * Mega-menu grid recipe. Used inside the Content panel when `variant="mega"`.
 * Pure layout — columns + gap — so the Group / Featured children can compose
 * freely.
 */
export const navMenuMegaRecipe = cv({
  base: 'grid gap-6',
  variants: {
    columns: {
      '1': 'grid-cols-1',
      '2': 'grid-cols-2',
      '3': 'grid-cols-3',
      '4': 'grid-cols-4',
    },
  },
  defaultVariants: {
    columns: '2',
  },
});

/**
 * Mega-menu Group recipe. Each Group is a column inside the mega-menu grid — a
 * label + a stack of links. Same vertical rhythm as the rest of the panel.
 */
export const navMenuGroupRecipe = cv({
  base: 'flex flex-col gap-1',
});

/** Group label — small, uppercase, muted. Mirrors Sidebar.Section's label conventions. */
export const navMenuGroupLabelRecipe = cv({
  base: 'mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-(--sds-color-text-muted)',
});

/**
 * Mega-menu Featured slot recipe. Consumer drops anything here (a `<Card>`, an
 * image, a marketing snippet) — we just provide a soft container.
 */
export const navMenuFeaturedRecipe = cv({
  base: 'relative flex flex-col gap-2 rounded-md bg-(--sds-color-surface-subtle)/60 p-4',
});

/**
 * Link-inside-Content recipe. Same family as the top-level Trigger but optimised
 * for inside-a-panel rendering (left-aligned label, optional description below,
 * full-width row).
 */
export const navMenuPanelLinkRecipe = cv({
  base: 'group/nav-link relative flex items-start gap-3 rounded-md px-2 py-2 text-(--sds-color-text-default) no-underline outline-none transition-colors focus-visible:ring-2 focus-visible:ring-(--sds-color-border-default) hover:bg-(--sds-color-surface-subtle) data-[active=true]:bg-(--sds-color-surface-subtle)',
  variants: {
    size: {
      sm: 'text-xs [&_svg]:h-3.5 [&_svg]:w-3.5',
      md: 'text-sm [&_svg]:h-4 [&_svg]:w-4',
      lg: 'text-base [&_svg]:h-5 [&_svg]:w-5',
    },
    disabled: {
      true: 'pointer-events-none opacity-50',
      false: 'cursor-pointer',
    },
  },
  defaultVariants: {
    size: 'md',
    disabled: false,
  },
});

/**
 * Indicator recipe. A single absolutely-positioned `<div>` that animates between
 * items via CSS transforms — no layout thrash because transform + width are
 * GPU-composited.
 *
 * The `pill` variant is a special case: it sits BEHIND the focused item (the
 * recipe sets a negative z-index + slightly inset padding); the `underline` /
 * `bar` variants sit BELOW the items (typical chrome).
 */
export const navMenuIndicatorRecipe = cv({
  base: 'pointer-events-none absolute transition-[transform,width,height,opacity] duration-200 ease-out motion-reduce:transition-none',
  variants: {
    variant: {
      underline: 'bottom-0 h-0.5 bg-(--sds-color-text-default)',
      bar: 'bottom-0 h-1 rounded-t-md bg-(--sds-color-text-default)',
      // The pill sits behind the trigger via a negative z-index + the root's
      // `isolate` rule so the trigger label still renders on top.
      pill: 'top-0 h-full -z-10 rounded-md bg-(--sds-color-surface-subtle)',
    },
    orientation: {
      horizontal: '',
      // For vertical menus the "underline" indicator becomes a left-edge bar;
      // we re-locate the `bottom-0 h-0.5` chrome to `start-0 w-0.5 h-full`.
      vertical: '',
    },
    visible: {
      true: 'opacity-100',
      false: 'opacity-0',
    },
  },
  compoundVariants: [
    {
      variant: 'underline',
      orientation: 'vertical',
      class: 'start-0 top-0 h-full w-0.5 bottom-auto',
    },
    {
      variant: 'bar',
      orientation: 'vertical',
      class: 'start-0 top-0 h-full w-1 rounded-s-md rounded-t-none bottom-auto',
    },
  ],
  defaultVariants: {
    variant: 'underline',
    orientation: 'horizontal',
    visible: false,
  },
});