import type { SchedulerTranslations } from './Scheduler.types';

import { formatHHMM } from './helpers/dateMath';

/**
 * Default English-locale translations. The Scheduler is i18n-routable end-to-end through
 * `<I18nProvider>` — consumers can override any subset by passing `translations={…}` at
 * the root, or by registering a `Scheduler` namespace at the provider:
 *
 * ```tsx
 * <I18nProvider locale="he-IL" messages={{ Scheduler: { today: 'היום', … } }}>
 *   <Scheduler … />
 * </I18nProvider>
 * ```
 *
 * Strings that contain dynamic substitutions are typed as functions so consumers can
 * provide their own locale-aware grammar (English's "1 notification" / "2 notifications"
 * is trivial; Russian / Arabic plurals need proper logic).
 */
export const DEFAULT_SCHEDULER_TRANSLATIONS: SchedulerTranslations = {
  calendarApplication: 'Calendar',
  toolbar: 'Calendar toolbar',
  eventRole: 'Event',
  allDayRow: 'All-day events',
  slotLabel: (date, time) => `${date} at ${time}`,
  eventAriaLabel: (event) => {
    const base = event.title || 'Untitled event';
    if (event.allDay) return `${base}, all day`;
    const start = formatHHMM(event.start.getHours() * 60 + event.start.getMinutes());
    const end = formatHHMM(event.end.getHours() * 60 + event.end.getMinutes());
    return `${base}, ${start} to ${end}`;
  },
  holidayLabel: (date, name) => `${name} on ${date}`,

  prev: 'Previous',
  next: 'Next',
  today: 'Today',
  views: {
    month: 'Month',
    week: 'Week',
    workWeek: 'Work week',
    day: 'Day',
    multiDay: 'Multi-day',
    agenda: 'Schedule',
    year: 'Year',
    resource: 'Resources',
  },
  search: 'Search',
  searchPlaceholder: 'Search events…',
  filters: 'Filters',
  density: 'Density',
  densityCompact: 'Compact',
  densityStandard: 'Standard',
  densityComfortable: 'Comfortable',
  settings: 'Settings',

  addTitle: 'Add title',
  event: 'Event',
  task: 'Task',
  appointmentSchedule: 'Appointment schedule',
  doesNotRepeat: 'Does not repeat',
  timeZone: 'Time zone',
  addGuests: 'Add guests',
  addLocation: 'Add location or video conferencing',
  addDescription: 'Add description',
  addVideoConferencing: 'Add video conferencing',
  busy: 'Busy',
  defaultVisibility: 'Default visibility',
  notificationsCount: (n) => (n === 1 ? '1 notification' : `${n} notifications`),
  moreOptions: 'More options',
  save: 'Save',
  cancel: 'Cancel',

  editEvent: 'Edit event',
  newEvent: 'New event',
  delete: 'Delete',
  deleteConfirm: 'Delete this event?',

  recurrenceNone: 'Does not repeat',
  recurrenceDaily: 'Daily',
  recurrenceWeekly: 'Weekly',
  recurrenceMonthly: 'Monthly',
  recurrenceYearly: 'Annually',
  recurrenceCustom: 'Custom',

  holidayShow: 'Show holidays',
  holidayRegions: 'Holiday regions',
  filterCalendars: 'Calendars',
  filterResources: 'Resources',
  filterClearAll: 'Clear all',
  filterActiveCount: (n) => (n === 1 ? '1 filter active' : `${n} filters active`),

  loading: 'Loading…',
  empty: 'No events',
  emptyDescription: 'Click a slot to create your first event.',
  error: 'Something went wrong.',
  errorRetry: 'Try again',
  noEventsInRange: 'No events in this range',

  now: 'Now',
  currentTime: (time) => `Now ${time}`,
  allDay: 'All day',

  dragModeEnter: (event) => `Editing ${event}`,
  dragModeMove: (time) => `Moving to ${time}`,
  dragModeCommit: (start, end) => `Set to ${start} – ${end}`,
  dragModeCancel: 'Edit cancelled',
  conflictWarning: (count) =>
    count === 1 ? '1 conflicting event' : `${count} conflicting events`,

  viewChangedTo: (view, date) => `${view} view, showing ${date}`,
  eventsLoaded: (count) =>
    count === 0
      ? 'No events loaded'
      : count === 1
      ? '1 event loaded'
      : `${count} events loaded`,
  eventCreatedAnnouncement: (title) => `Created event ${title}`,
  eventUpdatedAnnouncement: (title) => `Updated event ${title}`,
  eventDeletedAnnouncement: (title) => `Deleted event ${title}`,
  filterAppliedAnnouncement: (filters) => `Filters applied: ${filters}`,

  newEventTitle: '(New event)',
  untitledEvent: '(No title)',
};

/**
 * Shallow-merge translations: `base` (defaults) ← provider (from `<I18nProvider>`) ←
 * `componentProp` (the `translations` prop on `<Scheduler>`). Last write wins per key.
 */
export function mergeSchedulerTranslations(
  base: SchedulerTranslations,
  fromProvider?: Partial<SchedulerTranslations>,
  fromProp?: Partial<SchedulerTranslations>,
): SchedulerTranslations {
  return {
    ...base,
    ...(fromProvider ?? {}),
    ...(fromProp ?? {}),
    views: { ...base.views, ...(fromProvider?.views ?? {}), ...(fromProp?.views ?? {}) },
  };
}