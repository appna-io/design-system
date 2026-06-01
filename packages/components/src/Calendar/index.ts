export { Calendar } from './Calendar';
export type {
  CalendarProps,
  CalendarMode,
  CalendarValue,
  CalendarVariant,
  CalendarSize,
  CalendarColor,
  CalendarDay,
  CalendarDayState,
  CalendarTranslations,
  DateRange,
  RenderCalendarDayContext,
  RenderCalendarHeaderContext,
  RenderCalendarWeekdayContext,
  UseCalendarOptions,
  UseCalendarReturn,
} from './Calendar.types';

export { useCalendar } from './headless/useCalendar';
export { useCalendarKeyboard } from './headless/useCalendarKeyboard';

export {
  CalendarContext,
  useCalendarContext,
  useOptionalCalendarContext,
  type CalendarContextValue,
} from './CalendarContext';

export {
  calendarRootRecipe,
  calendarHeaderRecipe,
  calendarHeaderTitleRecipe,
  calendarNavButtonRecipe,
  calendarMonthsRowRecipe,
  calendarMonthRecipe,
  calendarWeekdaysRowRecipe,
  calendarWeekdayRecipe,
  calendarWeeksGridRecipe,
  calendarWeekNumberCellRecipe,
  calendarDayRecipe,
  datePickerTriggerRecipe,
  datePickerPresetListRecipe,
  datePickerPresetItemRecipe,
  datePickerApplyBarRecipe,
  datePickerPopoverContentRecipe,
} from './Calendar.recipe';

export {
  DEFAULT_CALENDAR_TRANSLATIONS,
  mergeCalendarTranslations,
} from './Calendar.i18n';

/* Re-export the date helpers as a public surface — DatePicker / DateRangePicker / Scheduler
 * all consume them. This is the canonical home; the Scheduler's local copy will be replaced
 * with a re-export in a follow-up. */
export {
  MS_PER_DAY,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addYears,
  clampDate,
  computeMonthGrid,
  differenceInDays,
  eachDayInRange,
  eachDayKeyInRange,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  formatIsoDate,
  fromDayKey,
  intervalsOverlap,
  isoWeekNumber,
  isSameDay,
  isSameMonth,
  isSameYear,
  isValidDate,
  isWithin,
  max as maxDate,
  min as minDate,
  pad2,
  parseIsoDate,
  rangeOfDays,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toDayKey,
} from './helpers/dateMath';

export {
  getFirstDayOfWeek,
  getMonthName,
  getMonthYearTitle,
  getLongDayLabel,
  getWeekdayNames,
  type Weekday,
} from './helpers/locale';

export { parseDateFormat, formatDate } from './helpers/parseDateFormat';

export { meta } from './meta';