import { cv } from '@apx-ui/engine';

/**
 * Toolbar's recipe — structural chrome only. Toolbar deliberately does **not** style its
 * children (Buttons and Toggles look exactly like they would standalone). The recipe contributes
 * three things:
 *
 *   1. Flex layout in the requested orientation, with a min-w-0 floor so descendant flex
 *      shrinking works correctly inside narrow ancestors.
 *   2. Visual chrome via the `variant` axis — `default` is transparent, `bordered` adds a card
 *      shell, `floating` adds a raised pill shell.
 *   3. Spacing rhythm via the `size` axis — gap-* between children plus a child-height hint
 *      (`[&_button]:h-*`) that only fires when consumers haven't sized their own buttons.
 *
 * Roving tabindex, overflow detection, and per-child cloning all live in the component — none of
 * it surfaces in the recipe.
 */
export const toolbarRecipe = cv({
  base: 'flex min-w-0 outline-none',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
    variant: {
      default: '',
      bordered:
        'rounded-lg border border-(--sds-color-border-default) bg-(--sds-color-surface-default) p-1',
      floating:
        'rounded-full border border-(--sds-color-border-subtle) bg-(--sds-color-surface-raised) shadow-md p-1',
    },
    size: {
      sm: 'gap-0.5',
      md: 'gap-1',
      lg: 'gap-1.5',
    },
    align: {
      start: '',
      center: '',
      end: '',
    },
  },
  compoundVariants: [
    // Cross-axis alignment depends on orientation. In horizontal mode `align` maps to `items-*`
    // (vertical alignment of inline-row children); in vertical mode it maps to `items-*` too
    // (Tailwind's `items-*` is the cross-axis property regardless of flex-direction). Keeping
    // them in compound rows preserves predictability if we ever add `justify` overrides.
    { orientation: 'horizontal', align: 'start', className: 'items-start' },
    { orientation: 'horizontal', align: 'center', className: 'items-center' },
    { orientation: 'horizontal', align: 'end', className: 'items-end' },
    { orientation: 'vertical', align: 'start', className: 'items-start' },
    { orientation: 'vertical', align: 'center', className: 'items-center' },
    { orientation: 'vertical', align: 'end', className: 'items-end' },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'default',
    size: 'md',
    align: 'center',
  },
});

/**
 * Toolbar.Group's recipe. Pure structural inline-flex with optional gap override. The group
 * defaults to inheriting the toolbar's gap (no extra spacing class); `gap` overrides apply
 * via `TOOLBAR_GROUP_GAP_CLASSES` below so the JIT scanner picks them up literally.
 */
export const toolbarGroupRecipe = cv({
  base: 'flex min-w-0 items-center',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

/**
 * Toolbar.Separator's recipe. The visible rule itself is a 1px (or 2px) line in the
 * cross-axis direction of the toolbar. `border-inline-start` / `border-block-start` are
 * logical so RTL flips cleanly. Vertical toolbar → horizontal separator (a row divider);
 * horizontal toolbar → vertical separator (a column divider).
 */
export const toolbarSeparatorRecipe = cv({
  base: 'shrink-0',
  variants: {
    orientation: {
      // Vertical separator: 1px wide column, full toolbar height (self-stretch).
      vertical: 'self-stretch w-px mx-1',
      // Horizontal separator: 1px tall row, full toolbar width (self-stretch).
      horizontal: 'self-stretch h-px my-1',
    },
    thickness: {
      '1': '',
      '2': '',
    },
    color: {
      subtle: 'bg-(--sds-color-border-subtle)',
      default: 'bg-(--sds-color-border-default)',
      strong: 'bg-(--sds-color-border-strong)',
    },
  },
  compoundVariants: [
    { orientation: 'vertical', thickness: '2', className: 'w-0.5' },
    { orientation: 'horizontal', thickness: '2', className: 'h-0.5' },
  ],
  defaultVariants: { orientation: 'vertical', thickness: '1', color: 'subtle' },
});

/**
 * Optional per-group gap overrides. Mirrors Stack's `GAP_CLASSES` table so the JIT scanner
 * discovers literal utilities at build time without us touching `safelist`. Tiny by design —
 * Toolbar.Group is a niche escape hatch and we only need the lower spacing scale (toolbars
 * with `gap-12` would look broken).
 */
export const TOOLBAR_GROUP_GAP_CLASSES = {
  '0': 'gap-0',
  px: 'gap-px',
  '0.5': 'gap-0.5',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
} as const satisfies Record<string, string>;
