import { cv } from '@apx-ui/engine';

/* -------------------------------------------------------------------------- */
/*  Calendar — recipe surface                                                  */
/* -------------------------------------------------------------------------- */
/* Slot layout follows the Scheduler precedent: one `cv()` per recipe, each
 * one targeting a single DOM element. State-based variants (selected /
 * rangeStart / rangeEnd / hover-preview) live on the day recipe via boolean
 * variants so consumers can theme any cell state without forking the recipe.
 */

export const calendarRootRecipe = cv({
  base: 'inline-flex flex-col gap-2 text-fg-default select-none',
  variants: {
    size: {
      sm: 'p-1.5 text-xs',
      md: 'p-2 text-sm',
      lg: 'p-3 text-base',
    },
    variant: {
      solid: 'bg-bg-paper',
      outline: 'border border-border bg-bg-paper rounded-lg',
      soft: 'bg-bg-subtle/60 rounded-lg',
      minimal: 'bg-transparent',
    },
  },
  defaultVariants: { size: 'md', variant: 'solid' },
});

export const calendarHeaderRecipe = cv({
  base: 'flex items-center justify-between gap-2',
});

export const calendarHeaderTitleRecipe = cv({
  base: 'flex items-center gap-1 font-semibold tabular-nums',
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: { size: 'md' },
});

export const calendarNavButtonRecipe = cv({
  base:
    'inline-flex items-center justify-center rounded-md text-fg-muted ' +
    'hover:bg-bg-subtle hover:text-fg-default ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
    'disabled:opacity-40 disabled:pointer-events-none',
  variants: {
    size: {
      sm: 'size-6',
      md: 'size-7',
      lg: 'size-8',
    },
  },
  defaultVariants: { size: 'md' },
});

export const calendarMonthsRowRecipe = cv({
  base: 'flex gap-4',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

export const calendarMonthRecipe = cv({
  base: 'flex flex-col gap-1',
});

export const calendarWeekdaysRowRecipe = cv({
  base: 'grid grid-cols-7 text-fg-muted',
  variants: {
    showWeekNumbers: {
      true: 'grid-cols-[auto_repeat(7,minmax(0,1fr))]',
      false: '',
    },
  },
  defaultVariants: { showWeekNumbers: false },
});

export const calendarWeekdayRecipe = cv({
  base: 'flex items-center justify-center font-medium',
  variants: {
    size: {
      sm: 'h-7 text-[10px]',
      md: 'h-8 text-xs',
      lg: 'h-10 text-sm',
    },
  },
  defaultVariants: { size: 'md' },
});

export const calendarWeeksGridRecipe = cv({
  base: 'grid grid-cols-7',
  variants: {
    showWeekNumbers: {
      true: 'grid-cols-[auto_repeat(7,minmax(0,1fr))]',
      false: '',
    },
  },
  defaultVariants: { showWeekNumbers: false },
});

export const calendarWeekNumberCellRecipe = cv({
  base: 'flex items-center justify-center px-1 text-xs text-fg-muted',
});

/**
 * Day cell. Boolean variants drive the look-up. The compound rule order matters:
 * `disabled` wins over `selected`, which wins over `today`, which wins over `rangeMiddle`
 * / `rangePreview`. We encode this as compound variants rather than ternary chains so
 * theme overrides target a single, named, themable slot per state.
 */
export const calendarDayRecipe = cv({
  base:
    'relative flex items-center justify-center font-medium tabular-nums ' +
    'transition-colors duration-150 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
  variants: {
    size: {
      sm: 'h-7 w-7 text-xs',
      md: 'h-8 w-8 text-sm',
      lg: 'h-10 w-10 text-base',
    },
    isOutside: {
      true: 'text-fg-muted/40',
      false: 'text-fg-default',
    },
    isSelected: {
      true: 'bg-primary text-fg-onPrimary hover:bg-primary-emphasis',
      false: 'hover:bg-bg-subtle',
    },
    isToday: {
      true: 'ring-1 ring-primary ring-inset',
      false: '',
    },
    isRangeStart: { true: 'rounded-s-md rounded-e-none', false: '' },
    isRangeEnd: { true: 'rounded-e-md rounded-s-none', false: '' },
    isRangeMiddle: { true: 'bg-primary-subtle text-primary rounded-none', false: '' },
    isRangePreview: { true: 'bg-primary-subtle/60 text-primary rounded-none', false: '' },
    isDisabled: {
      true: 'opacity-30 line-through pointer-events-none',
      false: 'cursor-pointer rounded-md',
    },
  },
  compoundVariants: [
    /* Range middle wins over hover-preview if both true (rare — only on the candidate end
     * day during a click). */
    {
      isRangeMiddle: true,
      isSelected: false,
      class: 'hover:bg-primary-subtle',
    },
    /* When both endpoints are the same day the cell should look like a normal selected
     * single date — drop the half-rounded edges. */
    {
      isRangeStart: true,
      isRangeEnd: true,
      class: 'rounded-md',
    },
  ],
  defaultVariants: {
    size: 'md',
    isOutside: false,
    isSelected: false,
    isToday: false,
    isRangeStart: false,
    isRangeEnd: false,
    isRangeMiddle: false,
    isRangePreview: false,
    isDisabled: false,
  },
});

/* -------------------------------------------------------------------------- */
/*  DatePicker / DateRangePicker — recipe surface                              */
/* -------------------------------------------------------------------------- */

export const datePickerTriggerRecipe = cv({
  base:
    'inline-flex items-center justify-center rounded-md text-fg-muted ' +
    'hover:bg-bg-subtle hover:text-fg-default ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
    'disabled:opacity-40 disabled:pointer-events-none',
  variants: {
    size: {
      sm: 'size-6',
      md: 'size-7',
      lg: 'size-8',
    },
  },
  defaultVariants: { size: 'md' },
});

export const datePickerPresetListRecipe = cv({
  base: 'flex flex-col gap-0.5 border-e border-border p-2 min-w-[140px]',
});

export const datePickerPresetItemRecipe = cv({
  base:
    'px-3 py-1.5 rounded-md text-start text-sm text-fg-default ' +
    'hover:bg-bg-subtle ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
});

export const datePickerApplyBarRecipe = cv({
  base: 'flex justify-between items-center gap-2 px-2 pt-2 border-t border-border',
});

export const datePickerPopoverContentRecipe = cv({
  base: 'flex',
  variants: {
    withPresets: {
      true: 'flex-row',
      false: 'flex-col',
    },
  },
  defaultVariants: { withPresets: false },
});
