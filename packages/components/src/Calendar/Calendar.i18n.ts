import type { CalendarTranslations } from './Calendar.types';

/**
 * Default English translations for `<Calendar>` / `<DatePicker>` / `<DateRangePicker>`.
 *
 * The standard 3-layer merge applies (defaults ← `<I18nProvider>` namespace `Calendar` ←
 * `translations` prop). Same precedence DataGrid / Pagination / Combobox / Scheduler use.
 */
export const DEFAULT_CALENDAR_TRANSLATIONS: CalendarTranslations = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  jumpToMonth: 'Jump to month',
  jumpToYear: 'Jump to year',
  today: 'Today',
  openCalendar: 'Open calendar',
  calendarDialog: 'Calendar',
  clear: 'Clear',
  apply: 'Apply',
  startDate: 'Start date',
  endDate: 'End date',
  rangePresetsLabel: 'Presets',
  selectedDayAnnouncement: (formatted) => `Selected ${formatted}`,
  rangeStartAnnouncement: (formatted) => `Range start ${formatted}; choose end date`,
  rangeEndAnnouncement: (start, end) => `Range selected from ${start} to ${end}`,
  weekNumberHeader: 'Wk',
  invalidDate: 'Invalid date',
  outOfRange: 'Date out of allowed range',
};

/**
 * Shallow merge per-key, last-write-wins. Function keys (announcements) follow the same rule —
 * a consumer who passes `selectedDayAnnouncement` overrides the default entirely.
 */
export function mergeCalendarTranslations(
  base: CalendarTranslations,
  fromProvider?: Partial<CalendarTranslations>,
  fromProp?: Partial<CalendarTranslations>,
): CalendarTranslations {
  return {
    ...base,
    ...(fromProvider ?? {}),
    ...(fromProp ?? {}),
  };
}