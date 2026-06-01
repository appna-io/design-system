import { cv } from '@apx-ui/engine';

/**
 * Stack's recipe is **purely structural** — there are no visual variants (no `variant`, no
 * `color`, no `shape`). The flex axes (`direction` / `align` / `justify` / `wrap` / `inline` /
 * `fullWidth`) live as `cv` variants so they get free responsive support via the engine's
 * `prefixClasses` helper. The `gap` family is computed separately by `gapClasses` below because
 * it splits into `gap-x-*` / `gap-y-*` when overrides are present and `cv` only supports a single
 * value per axis.
 *
 * Every class in this file is a **literal** Tailwind utility so the JIT scanner picks it up at
 * build time — no `gap-[${n}]` arbitrary values, no string interpolation, no surprises.
 */
export const stackRecipe = cv({
  base: 'min-w-0',
  variants: {
    direction: {
      column: 'flex-col',
      'column-reverse': 'flex-col-reverse',
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
      reverse: 'flex-wrap-reverse',
    },
    inline: { true: 'inline-flex', false: 'flex' },
    fullWidth: { true: 'w-full', false: '' },
  },
  defaultVariants: {
    direction: 'column',
    align: 'stretch',
    justify: 'start',
    wrap: false,
    inline: false,
    fullWidth: false,
  },
});

/**
 * Spacer's recipe. The default state is `flex: 1` (the greedy "push siblings apart" mode);
 * a fixed `size` swaps that for an `h-{n}` (block axis) or `w-{n}` (inline axis) so the Spacer
 * occupies exactly that many spacing-scale units instead of growing.
 */
export const spacerRecipe = cv({
  base: 'shrink-0 self-stretch',
  variants: {
    fixed: {
      true: '',
      false: 'flex-1',
    },
  },
  defaultVariants: { fixed: false },
});

/**
 * Tailwind `gap-*` class table. Indexed by the same numeric token as `StackGap`. The full ladder
 * lives inline so Tailwind's literal-text scanner discovers every cell without us having to
 * touch `safelist`. Combined size: 13 entries × 3 prefixes (`gap`, `gap-x`, `gap-y`) = 39 classes
 * — tiny, and shared between Stack + Spacer.
 */
export const GAP_CLASSES = {
  // gap (both axes)
  gap: {
    '0': 'gap-0',
    px: 'gap-px',
    '0.5': 'gap-0.5',
    '1': 'gap-1',
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-4',
    '5': 'gap-5',
    '6': 'gap-6',
    '8': 'gap-8',
    '10': 'gap-10',
    '12': 'gap-12',
  },
  // column-gap only (gap between row items)
  'gap-x': {
    '0': 'gap-x-0',
    px: 'gap-x-px',
    '0.5': 'gap-x-0.5',
    '1': 'gap-x-1',
    '2': 'gap-x-2',
    '3': 'gap-x-3',
    '4': 'gap-x-4',
    '5': 'gap-x-5',
    '6': 'gap-x-6',
    '8': 'gap-x-8',
    '10': 'gap-x-10',
    '12': 'gap-x-12',
  },
  // row-gap only (gap between column items, i.e. wrapped rows)
  'gap-y': {
    '0': 'gap-y-0',
    px: 'gap-y-px',
    '0.5': 'gap-y-0.5',
    '1': 'gap-y-1',
    '2': 'gap-y-2',
    '3': 'gap-y-3',
    '4': 'gap-y-4',
    '5': 'gap-y-5',
    '6': 'gap-y-6',
    '8': 'gap-y-8',
    '10': 'gap-y-10',
    '12': 'gap-y-12',
  },
} as const satisfies Record<'gap' | 'gap-x' | 'gap-y', Record<string, string>>;

/**
 * Fixed-axis sizing classes for Spacer. Maps the same spacing token to the height/width utility
 * that anchors a Spacer to a fixed span. `block` → `h-*` (vertical span); `inline` → `w-*`.
 */
export const SPACER_FIXED_CLASSES = {
  block: {
    '0': 'h-0',
    px: 'h-px',
    '0.5': 'h-0.5',
    '1': 'h-1',
    '2': 'h-2',
    '3': 'h-3',
    '4': 'h-4',
    '5': 'h-5',
    '6': 'h-6',
    '8': 'h-8',
    '10': 'h-10',
    '12': 'h-12',
  },
  inline: {
    '0': 'w-0',
    px: 'w-px',
    '0.5': 'w-0.5',
    '1': 'w-1',
    '2': 'w-2',
    '3': 'w-3',
    '4': 'w-4',
    '5': 'w-5',
    '6': 'w-6',
    '8': 'w-8',
    '10': 'w-10',
    '12': 'w-12',
  },
} as const satisfies Record<'block' | 'inline', Record<string, string>>;