import { cv } from '@apx-ui/engine';

/**
 * Recipe family for `<TagsInput />`. Five slots:
 *
 *   wrapper      — the outer label + field + helper column.
 *   label        — the visible label row.
 *   field        — the bordered chip-row container (Input-shell-style).
 *   input        — the inner `<input>` (chrome-free, grows to fill remaining row width).
 *   listbox      — the inline suggestions panel below the field.
 *
 * The shell uses the shipped Tailwind utilities (`border-border-default`, `bg-surface-default`,
 * `text-fg-muted`, …) — same palette adapter the other form controls land on (Skeleton /
 * Spinner / EmptyState / Rating). The plan's `(--sds-color-…)` syntax pre-dates the preset.
 */

const tagsInputWrapper = cv({
  base: 'flex flex-col gap-1 w-full',
});

const tagsInputLabel = cv({
  base: 'text-sm font-medium text-fg-default',
  variants: {
    hidden: {
      true: 'sr-only',
      false: '',
    },
    disabled: {
      true: 'opacity-60',
      false: '',
    },
  },
  defaultVariants: { hidden: false, disabled: false },
});

const tagsInputDescription = cv({
  base: 'text-xs text-fg-muted -mt-0.5',
});

const tagsInputField = cv({
  base:
    'group/tagsinput relative flex flex-wrap items-center gap-1 rounded-md border cursor-text ' +
    'transition-[border-color,background-color,box-shadow,color] duration-fast ease-standard outline-none ' +
    'focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-focus',
  variants: {
    variant: {
      filled: 'border-border-default bg-bg-subtle',
      outline: 'border-border-default bg-surface-default',
      ghost: 'border-transparent bg-transparent focus-within:bg-bg-subtle',
    },
    size: {
      sm: 'min-h-7 px-1.5 py-0.5 text-xs',
      md: 'min-h-9 px-2 py-1 text-sm',
      lg: 'min-h-11 px-3 py-1.5 text-base',
    },
    invalid: {
      true: 'border-danger focus-within:ring-danger',
      false: '',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: '',
    },
  },
  defaultVariants: { variant: 'outline', size: 'md', invalid: false, disabled: false },
});

const tagsInputInput = cv({
  base:
    'flex-1 min-w-[80px] bg-transparent outline-none border-0 p-0 placeholder:text-fg-muted ' +
    'disabled:cursor-not-allowed',
});

const tagsInputCount = cv({
  base: 'ms-auto text-xs text-fg-muted tabular-nums shrink-0',
});

const tagsInputEmptyHint = cv({
  base: 'text-fg-muted pointer-events-none select-none',
});

const tagsInputListbox = cv({
  base:
    'mt-1 max-h-60 overflow-auto rounded-md border border-border-default bg-surface-default ' +
    'shadow-sm p-1 text-sm focus:outline-none',
});

const tagsInputItem = cv({
  base:
    'flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer outline-none ' +
    'text-fg-default',
  variants: {
    active: {
      true: 'bg-bg-subtle text-fg-default',
      false: 'hover:bg-bg-subtle/60',
    },
  },
  defaultVariants: { active: false },
});

const tagsInputEmpty = cv({
  base: 'px-2 py-1.5 text-xs text-fg-muted',
});

const tagsInputHelperText = cv({
  base: 'text-xs',
  variants: {
    invalid: {
      true: 'text-danger',
      false: 'text-fg-muted',
    },
  },
  defaultVariants: { invalid: false },
});

export const tagsInputRecipes = {
  wrapper: tagsInputWrapper,
  label: tagsInputLabel,
  description: tagsInputDescription,
  field: tagsInputField,
  input: tagsInputInput,
  count: tagsInputCount,
  emptyHint: tagsInputEmptyHint,
  listbox: tagsInputListbox,
  item: tagsInputItem,
  empty: tagsInputEmpty,
  helperText: tagsInputHelperText,
};
