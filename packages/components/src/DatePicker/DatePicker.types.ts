import type { CSSProperties, ReactNode } from 'react';

import type {
  CalendarColor,
  CalendarMode,
  CalendarSize,
  CalendarTranslations,
  CalendarVariant,
  DateRange,
} from '../Calendar/Calendar.types';
import type { InputProps } from '../Input/Input.types';

/* -------------------------------------------------------------------------- */
/*  Shared overlay options                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Re-used by both `<DatePicker>` and `<DateRangePicker>`. Mirrors the subset of `<Popover>`
 * props each picker forwards down to the overlay.
 */
export interface PickerPopoverOptions {
  /** Controlled open state. */
  open?: boolean | undefined;
  /** Uncontrolled initial open state. @default false */
  defaultOpen?: boolean | undefined;
  /** Fires whenever the popover opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** @default 'bottom-start' */
  placement?:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | undefined;
  /** Close the popover after the user commits a selection. @default true */
  closeOnSelect?: boolean | undefined;
}

/* -------------------------------------------------------------------------- */
/*  DatePicker                                                                 */
/* -------------------------------------------------------------------------- */

export interface DatePickerPreset {
  /** Unique id; also used as `key` and as a discriminator in `onPresetApply` callbacks. */
  id: string;
  /** Human-readable label rendered in the side rail. */
  label: string;
  /** Computed lazily so "today" stays fresh between renders. */
  date: () => Date;
}

export interface DatePickerProps extends PickerPopoverOptions {
  /* value */
  /** Controlled value. Pair with `onChange`. */
  value?: Date | null | undefined;
  /** Uncontrolled initial value. */
  defaultValue?: Date | null | undefined;
  /** Fires when the selection changes (calendar click or typed input commit). */
  onChange?: ((value: Date | null) => void) | undefined;

  /* input */
  /** Display + parse pattern. @default `'MM/dd/yyyy'` */
  format?: string | undefined;
  /** Custom parser. Defaults to `parseDateFormat(input, format, locale)`. */
  parse?: ((input: string) => Date | null) | undefined;
  /** Placeholder shown in the `<Input>`. Defaults to the `format` itself. */
  placeholder?: string | undefined;
  /** Props passed through to the underlying `<Input>` (e.g. `leftAddon`, `name`). */
  inputProps?: Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'type'> | undefined;
  /** Show the calendar-icon trigger inside the input. @default true */
  showTriggerIcon?: boolean | undefined;
  /** Show a clear button when there's a value. @default true */
  clearable?: boolean | undefined;

  /* calendar pass-through */
  /** Lower bound (inclusive). */
  min?: Date | undefined;
  /** Upper bound (inclusive). */
  max?: Date | undefined;
  /** Arbitrary disabled-day predicate. */
  isDateDisabled?: ((d: Date) => boolean) | undefined;
  /** Locale — drives weekday/month names + first-day-of-week. */
  locale?: string | undefined;
  /** Override the locale-driven first day of week. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  /** How many months to render side-by-side. @default 1 */
  numberOfMonths?: number | undefined;
  /** Show the ISO week-number gutter. @default false */
  showWeekNumbers?: boolean | undefined;

  /* presets (single-date variant of range presets) */
  /** Optional preset rail (e.g. "Today", "Tomorrow"). Hidden when empty. */
  presets?: DatePickerPreset[] | undefined;

  /* visual */
  variant?: CalendarVariant | undefined;
  size?: CalendarSize | undefined;
  color?: CalendarColor | undefined;

  /* form */
  /** When set, an `<input type="hidden">` with the ISO-8601 value rides along for form posts. */
  name?: string | undefined;
  required?: boolean | undefined;

  /* state */
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
  readOnly?: boolean | undefined;

  /* i18n */
  translations?: Partial<CalendarTranslations> | undefined;

  /* a11y */
  'aria-label'?: string | undefined;
  'aria-labelledby'?: string | undefined;
  'aria-describedby'?: string | undefined;

  /* misc */
  className?: string | undefined;
  style?: CSSProperties | undefined;
  /** Render below the calendar (e.g. extra actions or hints). */
  footer?: ReactNode | undefined;
}

/* -------------------------------------------------------------------------- */
/*  DateRangePicker                                                            */
/* -------------------------------------------------------------------------- */

export interface DateRangePickerPreset {
  id: string;
  label: string;
  range: () => DateRange;
}

export interface DateRangePickerProps
  extends Omit<DatePickerProps, 'value' | 'defaultValue' | 'onChange' | 'presets' | 'format'> {
  /** Controlled value. Pair with `onChange`. */
  value?: DateRange | undefined;
  /** Uncontrolled initial value. */
  defaultValue?: DateRange | undefined;
  /** Fires when the range changes (end-date click or typed input commit). */
  onChange?: ((value: DateRange) => void) | undefined;
  /** Display + parse pattern (same token set as `<DatePicker>`). @default `'MM/dd/yyyy'` */
  format?: string | undefined;
  /** Separator drawn between the two date inputs in the trigger. @default `'–'` */
  separator?: string | undefined;
  /** Preset rail (e.g. "Last 7 days"). */
  presets?: DateRangePickerPreset[] | undefined;
}

/** Discriminator for the popover-internal selection mode. */
export type PickerMode = Extract<CalendarMode, 'single' | 'range'>;
