import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/* -------------------------------------------------------------------------- */
/*  Variant axes                                                               */
/* -------------------------------------------------------------------------- */

export type CalendarVariant = 'solid' | 'outline' | 'soft' | 'minimal';
export type CalendarSize = 'sm' | 'md' | 'lg';
export type CalendarColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** Selection mode. `single` = one date or null. `multiple` = discrete days. `range` = `{ start, end }`. */
export type CalendarMode = 'single' | 'multiple' | 'range';

/** Inclusive date range. `start` and `end` are local-midnight Dates; either may be `null` while
 *  the user is mid-selection (range mode picks `start` first, then `end` on second click). */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/** Selection payload shape — narrows on `mode` at the type level via discriminated overloads. */
export type CalendarValue<M extends CalendarMode = CalendarMode> = M extends 'single'
  ? Date | null
  : M extends 'multiple'
  ? Date[]
  : DateRange;

/* -------------------------------------------------------------------------- */
/*  Per-cell descriptors                                                       */
/* -------------------------------------------------------------------------- */

/** State each day cell can be in. Drives the recipe's `state` variant. */
export type CalendarDayState =
  | 'default'
  | 'today'
  | 'selected'
  | 'rangeStart'
  | 'rangeMiddle'
  | 'rangeEnd'
  | 'rangePreview'
  | 'outside'
  | 'disabled';

/** Fully-resolved descriptor for a single day cell — what the renderer needs to draw it. */
export interface CalendarDay {
  /** The local-midnight Date this cell represents. */
  date: Date;
  /** True when `date` falls outside the month being rendered (the spillover days). */
  isOutside: boolean;
  /** True when `date` matches the user's local-clock "today". */
  isToday: boolean;
  /** True when `date` is part of the active selection (mode-aware). */
  isSelected: boolean;
  /** True when `date` is inside the active range (range mode only). */
  isInRange: boolean;
  /** True when `date` is the range start (range mode only). */
  isRangeStart: boolean;
  /** True when `date` is the range end (range mode only). */
  isRangeEnd: boolean;
  /** True when hovering over a candidate end-date would extend the range across `date`. */
  isInPreview: boolean;
  /** True when `date` fails `min`/`max`/`isDateDisabled`. */
  isDisabled: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Render-slot contexts                                                       */
/* -------------------------------------------------------------------------- */

export interface RenderCalendarDayContext extends CalendarDay {
  /** Locale-formatted day-of-month number (1-31). */
  label: string;
  /** Locale-formatted long date for ARIA. */
  ariaLabel: string;
}

export interface RenderCalendarHeaderContext {
  /** The leading visible month (anchor of the first rendered month grid). */
  month: Date;
  /** Number of months rendered (1 for single, 2 for two-month range picker). */
  numberOfMonths: number;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToPrevYear: () => void;
  goToNextYear: () => void;
  jumpToMonth: (month: number) => void;
  jumpToYear: (year: number) => void;
}

export interface RenderCalendarWeekdayContext {
  short: string;
  long: string;
  narrow: string;
  /** 0 = Sunday … 6 = Saturday, in the rotated order driven by `weekStartsOn`. */
  weekday: number;
}

/* -------------------------------------------------------------------------- */
/*  i18n surface                                                               */
/* -------------------------------------------------------------------------- */

export interface CalendarTranslations {
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  jumpToMonth: string;
  jumpToYear: string;
  today: string;
  openCalendar: string;
  calendarDialog: string;
  clear: string;
  apply: string;
  startDate: string;
  endDate: string;
  rangePresetsLabel: string;
  selectedDayAnnouncement: (formatted: string) => string;
  rangeStartAnnouncement: (formatted: string) => string;
  rangeEndAnnouncement: (start: string, end: string) => string;
  weekNumberHeader: string;
  invalidDate: string;
  outOfRange: string;
}

/* -------------------------------------------------------------------------- */
/*  Public component props                                                     */
/* -------------------------------------------------------------------------- */

export interface CalendarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'onChange' | 'defaultValue'> {
  /* value */
  /** Selection mode. @default 'single' */
  mode?: CalendarMode | undefined;
  /** Controlled value. Pair with `onChange`. */
  value?: Date | Date[] | DateRange | null | undefined;
  /** Uncontrolled initial value. */
  defaultValue?: Date | Date[] | DateRange | null | undefined;
  /** Fires on any selection mutation. Payload shape mirrors `mode`. */
  onChange?: ((value: Date | Date[] | DateRange | null) => void) | undefined;

  /* navigation */
  /** Controlled visible month anchor. */
  month?: Date | undefined;
  /** Uncontrolled initial visible month. @default `new Date()` */
  defaultMonth?: Date | undefined;
  /** Fires whenever the visible month changes (nav buttons, year jump, keyboard). */
  onMonthChange?: ((d: Date) => void) | undefined;
  /** How many months to render side-by-side. @default 1 (DatePicker: 1, DateRangePicker: 2) */
  numberOfMonths?: number | undefined;

  /* constraints */
  /** Hard lower bound (inclusive). */
  min?: Date | undefined;
  /** Hard upper bound (inclusive). */
  max?: Date | undefined;
  /** Arbitrary predicate — return `true` to disable the day. Combined OR with `min`/`max`. */
  isDateDisabled?: ((d: Date) => boolean) | undefined;

  /* locale */
  /** BCP-47 locale — drives weekday/month names + first-day-of-week. */
  locale?: string | undefined;
  /** Override the locale-driven first day of week (0 = Sun … 6 = Sat). */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined;

  /* visual */
  variant?: ResponsiveValue<CalendarVariant> | undefined;
  size?: ResponsiveValue<CalendarSize> | undefined;
  color?: ResponsiveValue<CalendarColor> | undefined;

  /* features */
  /** Show the ISO week number column on the leading side. @default false */
  showWeekNumbers?: boolean | undefined;
  /** Dim days that spill over from prev/next month. @default true */
  showOutsideDays?: boolean | undefined;
  /** Always render 6 rows (prevents layout shift across months). @default false */
  fixedWeeks?: boolean | undefined;

  /* render slots */
  /** Replace the inner contents of every day cell. The default renders the day number. */
  renderDay?: ((ctx: RenderCalendarDayContext) => ReactNode) | undefined;
  /** Replace the weekday label cell (Mon / Tue / …). */
  renderWeekday?: ((ctx: RenderCalendarWeekdayContext) => ReactNode) | undefined;
  /** Replace the entire header row (title + nav buttons). */
  renderHeader?: ((ctx: RenderCalendarHeaderContext) => ReactNode) | undefined;

  /* events */
  /** Per-day hover — critical for the range preview UX. */
  onDayHover?: ((d: Date) => void) | undefined;
  /** Per-day pointer-leave — clears hover preview. */
  onDayLeave?: (() => void) | undefined;

  /* i18n */
  /** Replace any subset of the default English strings. Merged with `<I18nProvider>`. */
  translations?: Partial<CalendarTranslations> | undefined;

  /* a11y */
  'aria-label'?: string | undefined;
  'aria-labelledby'?: string | undefined;

  /* misc */
  className?: string | undefined;
  style?: CSSProperties | undefined;
  sx?: Sx | undefined;
}

/* -------------------------------------------------------------------------- */
/*  Headless hook surface                                                      */
/* -------------------------------------------------------------------------- */

export interface UseCalendarOptions {
  mode?: CalendarMode | undefined;
  value?: Date | Date[] | DateRange | null | undefined;
  defaultValue?: Date | Date[] | DateRange | null | undefined;
  onChange?: ((value: Date | Date[] | DateRange | null) => void) | undefined;
  month?: Date | undefined;
  defaultMonth?: Date | undefined;
  onMonthChange?: ((d: Date) => void) | undefined;
  numberOfMonths?: number | undefined;
  min?: Date | undefined;
  max?: Date | undefined;
  isDateDisabled?: ((d: Date) => boolean) | undefined;
  locale?: string | undefined;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  fixedWeeks?: boolean | undefined;
  showOutsideDays?: boolean | undefined;
  /** Used by `<DatePicker>` to close the popover after a `single`-mode selection. */
  closeOnSelect?: boolean | undefined;
  /** Optional translation overrides — merged on top of `DEFAULT_CALENDAR_TRANSLATIONS`. */
  translations?: Partial<CalendarTranslations> | undefined;
}

export interface UseCalendarReturn {
  /* resolved state */
  mode: CalendarMode;
  value: Date | Date[] | DateRange | null;
  /** Each entry is the first-of-month anchor for one rendered month. */
  visibleMonths: Date[];
  /** Rotated weekday labels — `weekStartsOn` aware. */
  weekdays: ReadonlyArray<{ short: string; long: string; narrow: string; weekday: number }>;
  /** Pre-computed day descriptors. Outer = per month, middle = per week (6 rows), inner = per day (7 cols). */
  monthGrids: CalendarDay[][][];
  /** Hover-target for range preview; `null` when no candidate end-date is hovered. */
  hoverPreview: Date | null;
  /** The day currently holding the roving `tabIndex={0}` — driven by keyboard nav + selection. */
  focusedDay: Date;
  /* actions */
  setValue: (v: Date | Date[] | DateRange | null) => void;
  /** Mode-aware: extends the range / toggles the date / sets the single value. */
  selectDay: (d: Date) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToPrevYear: () => void;
  goToNextYear: () => void;
  jumpToMonth: (month: number) => void;
  jumpToYear: (year: number) => void;
  setHoverPreview: (d: Date | null) => void;
  setFocusedDay: (d: Date) => void;
  /* derived predicates — useful for consumers building custom renderers */
  isDateInRange: (d: Date) => boolean;
  isDateRangeStart: (d: Date) => boolean;
  isDateRangeEnd: (d: Date) => boolean;
  isDateSelected: (d: Date) => boolean;
  isDateDisabledFn: (d: Date) => boolean;
  isDateInPreview: (d: Date) => boolean;
  /* i18n */
  t: CalendarTranslations;
  locale: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /* settings */
  numberOfMonths: number;
  showOutsideDays: boolean;
  fixedWeeks: boolean;
}
