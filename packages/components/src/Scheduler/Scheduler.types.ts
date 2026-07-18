import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';

import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                 */
/* -------------------------------------------------------------------------- */

export type EventId = string;

/**
 * The eight scheduler views. Month / Week / WorkWeek / Day / MultiDay / Agenda / Year /
 * Resource — covers the Google-Calendar parity surface. PR 1 ships Month / Week / WorkWeek /
 * Day / MultiDay / Agenda; Year + Resource are stubbed and marked "coming-soon" in V1.
 */
export type SchedulerView =
  | 'month'
  | 'week'
  | 'workWeek'
  | 'day'
  | 'multiDay'
  | 'agenda'
  | 'year'
  | 'resource';

/**
 * The seven canonical accent roles. Mirrors the DS-wide color vocabulary so per-event
 * and per-calendar accent overrides slot into the variant matrix without per-component
 * widening.
 */
export type SchedulerColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export type SchedulerVariant = 'solid' | 'outline' | 'soft' | 'minimal';

export type SchedulerSize = 'sm' | 'md' | 'lg';

/**
 * Density axis — drives hour-row height + event-card padding + cell padding. Distinct from
 * `size` so a consumer can run a dense (`compact`) layout at a larger font (`size="lg"`)
 * when projected on a TV / kiosk display.
 */
export type SchedulerDensity = 'compact' | 'standard' | 'comfortable';

export type SchedulerRoundedCorners = 'none' | 'sm' | 'md' | 'lg';
export type SchedulerElevation = 'none' | 'sm' | 'md' | 'lg';

export type SchedulerEventShape = 'rect' | 'pill' | 'cardSlim';

export type SchedulerNowIndicatorStyle = 'line' | 'lineAndLabel' | 'none';

export type SchedulerTimeFormat = '12h' | '24h';

/* -------------------------------------------------------------------------- */
/*  Recurrence (RRULE-lite)                                                    */
/* -------------------------------------------------------------------------- */

export type Weekday = 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA';

export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * RRULE-lite. We intentionally implement the 6 fields that cover ~95 % of consumer
 * recurrences (daily / weekly w/ byDay / monthly w/ byMonthDay or bySetPos / yearly), with
 * `interval`, `until`, `count`, and `exceptions`. Full iCal RRULE features (`byWeekNo`,
 * `byYearDay`, `bySecond`, multi-month `byMonth`) are documented as deferred to V2.
 */
export interface RecurrenceRule {
  freq: RecurrenceFreq;
  interval?: number;
  byDay?: Weekday[];
  byMonthDay?: number[];
  bySetPos?: number;
  count?: number;
  until?: Date;
  exceptions?: Date[];
}

/* -------------------------------------------------------------------------- */
/*  Attendees, reminders, calendars, resources, holidays                       */
/* -------------------------------------------------------------------------- */

export interface Attendee {
  email: string;
  name?: string;
  response?: 'accepted' | 'tentative' | 'declined' | 'needsAction';
  optional?: boolean;
  organizer?: boolean;
}

export interface Reminder {
  minutesBefore: number;
  method?: 'popup' | 'email';
}

export interface CalendarSource {
  id: string;
  name: string;
  color: SchedulerColor | string;
  visible?: boolean;
  editable?: boolean;
  description?: string;
}

export interface Resource {
  id: string;
  name: string;
  group?: string;
  color?: SchedulerColor | string;
  description?: string;
}

export interface ResourceGroup {
  group: string;
  resources: Resource[];
}

/**
 * Holidays are a separate data type from events — they render differently (badge in cell,
 * banner in week/day), they're toggleable as a whole, and they carry a `region` field for
 * multi-region calendars (a US-only holiday should be hidden when the user's region is set
 * to "IL").
 */
export interface Holiday {
  id: string;
  /** ISO `YYYY-MM-DD` date-only. Multi-day holidays use `endDate` for the inclusive last day. */
  date: string;
  endDate?: string;
  name: string;
  region?: string;
  type?: 'public' | 'religious' | 'observance' | 'custom';
  color?: SchedulerColor | string;
  description?: string;
}

/* -------------------------------------------------------------------------- */
/*  Events                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Public event shape. Consumers pass `events: SchedulerEvent[]` and the Scheduler projects
 * them across whichever view is active. Recurring events are expanded per visible range by
 * `expandRecurrence` — consumers store rules, not instances.
 */
export interface SchedulerEvent {
  id: EventId;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean | undefined;
  calendarId?: string | undefined;
  resourceId?: string | null | undefined;
  color?: SchedulerColor | string | undefined;
  description?: string | undefined;
  location?: string | undefined;
  attendees?: Attendee[] | undefined;
  status?: 'confirmed' | 'tentative' | 'cancelled' | undefined;
  visibility?: 'default' | 'public' | 'private' | undefined;
  recurrence?: RecurrenceRule | undefined;
  reminders?: Reminder[] | undefined;
  /** Per-event override of the global `readOnly` / `editable` predicate. */
  editable?: boolean | undefined;
  meta?: Record<string, unknown> | undefined;
}

/**
 * Draft used by `onEventCreate` and the QuickPopover before the consumer assigns an `id`.
 * Same shape as `SchedulerEvent` minus `id` + with a few fields optional.
 */
export interface NewEventDraft {
  start: Date;
  end: Date;
  allDay?: boolean | undefined;
  calendarId?: string | undefined;
  resourceId?: string | null | undefined;
  title?: string | undefined;
  description?: string | undefined;
  location?: string | undefined;
  color?: SchedulerColor | string | undefined;
  attendees?: Attendee[] | undefined;
  reminders?: Reminder[] | undefined;
  recurrence?: RecurrenceRule | undefined;
  meta?: Record<string, unknown> | undefined;
}

export interface EventMoveChange {
  start: Date;
  end: Date;
  resourceId?: string | null | undefined;
}

export interface EventResizeChange {
  start: Date;
  end: Date;
}

export interface ConflictInfo {
  changedEvent: SchedulerEvent;
  conflicts: SchedulerEvent[];
  reason: 'move' | 'resize' | 'create';
}

/* -------------------------------------------------------------------------- */
/*  Layout-time computed types                                                 */
/* -------------------------------------------------------------------------- */

/**
 * A single event after the overlap-packing pass. View components render N of these per day
 * (or per resource row) — `column` / `columnSpan` drive the `left` / `width` percentages so
 * overlapping events split the available width evenly.
 */
export interface PositionedEvent {
  event: SchedulerEvent;
  startMinute: number;
  endMinute: number;
  column: number;
  columnSpan: number;
  resourceId?: string | null;
  continuesFrom?: boolean;
  continuesTo?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Filters + selection + drag state                                           */
/* -------------------------------------------------------------------------- */

export interface SchedulerFilters {
  /** Visible-calendar ids. `undefined` = all calendars visible. */
  calendarIds?: string[] | undefined;
  /** Visible-resource ids. `undefined` = all resources visible. */
  resourceIds?: string[] | undefined;
  /** Text search predicate. `undefined` or empty = no search filter. */
  search?: string | undefined;
  /** Hard date-range filter (Agenda view). `undefined` = no range filter. */
  dateRange?: { start: Date; end: Date } | undefined;
  /** Holiday visibility + region scoping. `undefined` = show all (renderer default). */
  holidays?: { show?: boolean | undefined; regions?: string[] | undefined } | undefined;
  /**
   * Custom client-side predicate. NOTE: not serialized through `storage` because functions
   * can't be JSON-encoded. Use the other filter keys for persisted filter UX.
   */
  custom?: ((event: SchedulerEvent) => boolean) | undefined;
}

export interface SchedulerSelectionState {
  eventId: EventId | null;
  slotRange: { start: Date; end: Date; resourceId?: string | null } | null;
}

export interface SchedulerPopoverState {
  open: boolean;
  mode: 'create' | 'view';
  draft: NewEventDraft | null;
  eventId: EventId | null;
  /**
   * DOM rect of the slot or event the popover should anchor to. View components compute
   * this and pass it via `openQuickPopover` so the Popover positioning engine has an anchor.
   */
  anchorRect: DOMRect | null;
}

export interface SchedulerModalState {
  open: boolean;
  mode: 'create' | 'edit';
  draft: NewEventDraft | null;
  eventId: EventId | null;
}

export interface SchedulerDragState {
  active: boolean;
  type: 'create' | 'move' | 'resize' | null;
  eventId: EventId | null;
  previewStart: Date | null;
  previewEnd: Date | null;
  previewResourceId: string | null;
}

export interface SchedulerError {
  /** Stable opcode so consumers can match on it; the message is for display. */
  code: 'create' | 'update' | 'delete' | 'move' | 'resize';
  message: string;
  eventId?: EventId | undefined;
  cause?: unknown;
}

/* -------------------------------------------------------------------------- */
/*  Persisted state                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Storage adapter — symmetric with DataGrid's. Consumers can pass `'local'` / `'session'`
 * for the obvious targets, or a custom adapter for URL-query / IndexedDB / etc. See
 * `headless/storage.ts` for the resolver.
 */
export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export type StorageKind = 'local' | 'session' | StorageAdapter;

/**
 * Subset of `SchedulerState` that round-trips through `localStorage` / `sessionStorage`.
 * Selection / drag / popover / modal / errors are ephemeral and intentionally omitted.
 */
export interface PersistedSchedulerState {
  view: SchedulerView;
  date: string; // ISO
  density: SchedulerDensity;
  filters: Omit<SchedulerFilters, 'custom' | 'dateRange'> & {
    dateRange?: { start: string; end: string } | undefined;
  };
  workingHours?: { start: string; end: string } | undefined;
  workingDays?: number[] | undefined;
  timeFormat?: SchedulerTimeFormat | undefined;
}

/* -------------------------------------------------------------------------- */
/*  Full state                                                                 */
/* -------------------------------------------------------------------------- */

export interface SchedulerState {
  view: SchedulerView;
  date: Date;
  visibleRange: { start: Date; end: Date };
  filters: SchedulerFilters;
  selection: SchedulerSelectionState;
  density: SchedulerDensity;
  popover: SchedulerPopoverState;
  modal: SchedulerModalState;
  drag: SchedulerDragState;
  errors: SchedulerError[];
}

/* -------------------------------------------------------------------------- */
/*  i18n surface                                                               */
/* -------------------------------------------------------------------------- */

export interface SchedulerTranslations {
  // ARIA roles / labels
  calendarApplication: string;
  toolbar: string;
  eventRole: string;
  allDayRow: string;
  slotLabel: (date: string, time: string) => string;
  eventAriaLabel: (event: SchedulerEvent) => string;
  holidayLabel: (date: string, name: string) => string;

  // Toolbar
  prev: string;
  next: string;
  today: string;
  views: {
    month: string;
    week: string;
    workWeek: string;
    day: string;
    multiDay: string;
    agenda: string;
    year: string;
    resource: string;
  };
  search: string;
  searchPlaceholder: string;
  filters: string;
  density: string;
  densityCompact: string;
  densityStandard: string;
  densityComfortable: string;
  settings: string;

  // Quick popover
  addTitle: string;
  event: string;
  task: string;
  appointmentSchedule: string;
  doesNotRepeat: string;
  timeZone: string;
  addGuests: string;
  addLocation: string;
  addDescription: string;
  addVideoConferencing: string;
  busy: string;
  defaultVisibility: string;
  notificationsCount: (n: number) => string;
  moreOptions: string;
  save: string;
  cancel: string;

  // Event modal
  editEvent: string;
  newEvent: string;
  delete: string;
  deleteConfirm: string;

  // Recurrence
  recurrenceNone: string;
  recurrenceDaily: string;
  recurrenceWeekly: string;
  recurrenceMonthly: string;
  recurrenceYearly: string;
  recurrenceCustom: string;

  // Holidays / filters
  holidayShow: string;
  holidayRegions: string;
  filterCalendars: string;
  filterResources: string;
  filterClearAll: string;
  filterActiveCount: (n: number) => string;

  // States
  loading: string;
  empty: string;
  emptyDescription: string;
  error: string;
  errorRetry: string;
  noEventsInRange: string;

  // Now / time
  now: string;
  currentTime: (time: string) => string;
  allDay: string;

  // Drag / conflict
  dragModeEnter: (event: string) => string;
  dragModeMove: (time: string) => string;
  dragModeCommit: (start: string, end: string) => string;
  dragModeCancel: string;
  conflictWarning: (count: number) => string;

  // Announcements
  viewChangedTo: (view: string, date: string) => string;
  eventsLoaded: (count: number) => string;
  eventCreatedAnnouncement: (title: string) => string;
  eventUpdatedAnnouncement: (title: string) => string;
  eventDeletedAnnouncement: (title: string) => string;
  filterAppliedAnnouncement: (filters: string) => string;

  // Misc
  newEventTitle: string;
  untitledEvent: string;
}

/* -------------------------------------------------------------------------- */
/*  Render-slot context shapes                                                 */
/* -------------------------------------------------------------------------- */

export interface RenderEventContext {
  event: SchedulerEvent;
  view: SchedulerView;
  isSelected: boolean;
  isGhost: boolean;
  positioned: PositionedEvent;
}

export interface RenderQuickPopoverContext {
  draft: NewEventDraft;
  update: (patch: Partial<NewEventDraft>) => void;
  save: () => Promise<void>;
  more: () => void;
  cancel: () => void;
  isDirty: boolean;
  isReadOnly: boolean;
}

export interface RenderEventModalContext {
  event: SchedulerEvent | NewEventDraft;
  mode: 'create' | 'edit';
  update: (patch: Partial<SchedulerEvent>) => void;
  save: () => Promise<void>;
  remove: () => Promise<void>;
  cancel: () => void;
  isDirty: boolean;
  isReadOnly: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Top-level props                                                            */
/* -------------------------------------------------------------------------- */

export interface SchedulerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'color'> {
  /* data */
  events: readonly SchedulerEvent[];
  holidays?: readonly Holiday[] | 'auto';
  holidaysProvider?: (
    year: number,
    locale: string,
  ) => readonly Holiday[] | Promise<readonly Holiday[]>;
  calendars?: readonly CalendarSource[];
  resources?: readonly Resource[];

  /* view (controlled or uncontrolled) */
  view?: SchedulerView;
  defaultView?: SchedulerView;
  onViewChange?: (view: SchedulerView) => void;
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  onRangeChange?: (range: { start: Date; end: Date }) => void;

  /* editability */
  readOnly?: boolean;
  isEventEditable?: (event: SchedulerEvent) => boolean;

  /* CRUD */
  onEventCreate?: (
    draft: NewEventDraft,
  ) => Promise<SchedulerEvent | void> | SchedulerEvent | void;
  onEventUpdate?: (
    event: SchedulerEvent,
    patch: Partial<SchedulerEvent>,
  ) => Promise<SchedulerEvent | void> | SchedulerEvent | void;
  onEventDelete?: (id: EventId) => Promise<void> | void;
  onEventMove?: (
    event: SchedulerEvent,
    change: EventMoveChange,
  ) => Promise<SchedulerEvent | void> | SchedulerEvent | void;
  onEventResize?: (
    event: SchedulerEvent,
    change: EventResizeChange,
  ) => Promise<SchedulerEvent | void> | SchedulerEvent | void;
  onConflict?: (info: ConflictInfo) => boolean | void;
  onEventClick?: (event: SchedulerEvent, e: React.MouseEvent) => void;
  onEventDoubleClick?: (event: SchedulerEvent, e: React.MouseEvent) => void;
  onSlotClick?: (
    range: { start: Date; end: Date; resourceId?: string | null },
    e: React.MouseEvent,
  ) => void;

  /* selection (controlled) */
  selectedEventId?: EventId | null;
  onSelectedEventChange?: (id: EventId | null) => void;

  /* state (controlled / uncontrolled) */
  state?: Partial<SchedulerState>;
  onStateChange?: (state: SchedulerState) => void;
  defaultFilters?: SchedulerFilters;
  defaultDensity?: SchedulerDensity;

  /* visual */
  variant?: ResponsiveValue<SchedulerVariant>;
  size?: ResponsiveValue<SchedulerSize>;
  color?: ResponsiveValue<SchedulerColor>;
  density?: ResponsiveValue<SchedulerDensity>;
  stickyHeader?: boolean;
  bordered?: boolean;
  roundedCorners?: SchedulerRoundedCorners;
  elevation?: SchedulerElevation;
  eventShape?: SchedulerEventShape;
  nowIndicator?: SchedulerNowIndicatorStyle;

  /* time grid */
  hourHeight?: number;
  snapMinutes?: 5 | 15 | 30 | 60;
  workingHours?: { start: string; end: string };
  workingDays?: number[];
  timeFormat?: SchedulerTimeFormat;
  showBusinessHours?: boolean;
  dimOffHours?: boolean;

  /* locale */
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  showWeekNumbers?: boolean;

  /* features */
  multiDayCount?: number;
  resourceGranularity?: 'hour' | 'day' | 'week';
  showNowIndicator?: boolean;
  showHolidays?: boolean;
  enableDragCreate?: boolean;
  enableDragMove?: boolean;
  enableDragResize?: boolean;
  enableRightClickMenu?: boolean;
  mobileBreakpoint?: 'sm' | 'md' | 'lg';

  /* slots */
  renderEvent?: (ctx: RenderEventContext) => ReactNode;
  renderQuickPopover?: (ctx: RenderQuickPopoverContext) => ReactNode;
  renderEventModal?: (ctx: RenderEventModalContext) => ReactNode;
  renderHolidayCell?: (ctx: { holiday: Holiday }) => ReactNode;

  /* layout toggles */
  toolbar?: boolean | 'minimal';
  filters?: boolean;
  miniMonth?: boolean;
  sidebar?: boolean;

  /* loading / empty / error */
  loading?: boolean;
  emptyState?: ReactNode;
  errorState?: ReactNode;

  /* persistence */
  storage?: StorageKind;
  storageKey?: string;

  /* i18n */
  translations?: Partial<SchedulerTranslations>;

  /* misc */
  sx?: Sx;
  style?: CSSProperties;
}

/* -------------------------------------------------------------------------- */
/*  Headless hook surface                                                      */
/* -------------------------------------------------------------------------- */

export interface BeginDragParams {
  type: 'create' | 'move' | 'resize';
  eventId?: EventId | undefined;
  start: Date;
  end: Date;
  resourceId?: string | null | undefined;
}

export interface UpdateDragParams {
  start?: Date | undefined;
  end?: Date | undefined;
  resourceId?: string | null | undefined;
}

export type UseSchedulerOptions = Omit<
  SchedulerProps,
  | 'renderEvent'
  | 'renderQuickPopover'
  | 'renderEventModal'
  | 'renderHolidayCell'
  | 'toolbar'
  | 'filters'
  | 'miniMonth'
  | 'sidebar'
  | 'loading'
  | 'emptyState'
  | 'errorState'
  | 'sx'
  | 'style'
  | 'className'
  | 'aria-label'
  | 'aria-labelledby'
>;

export interface UseSchedulerReturn {
  state: SchedulerState;
  /* derived (memoized) */
  visibleEvents: readonly SchedulerEvent[];
  eventsByDay: ReadonlyMap<string, readonly SchedulerEvent[]>;
  eventsByResource: ReadonlyMap<string, readonly SchedulerEvent[]>;
  layoutsByDay: ReadonlyMap<string, readonly PositionedEvent[]>;
  allDayLayoutsByDay: ReadonlyMap<string, readonly PositionedEvent[]>;
  visibleHolidays: ReadonlyMap<string, readonly Holiday[]>;
  /** Calendar sources passed in by the consumer, in declaration order. Empty when omitted. */
  calendars: readonly CalendarSource[];
  calendarById: ReadonlyMap<string, CalendarSource>;
  resourceById: ReadonlyMap<string, Resource>;
  resourceGroups: readonly ResourceGroup[];
  /* actions — navigation */
  setView: (view: SchedulerView) => void;
  setDate: (date: Date) => void;
  goPrev: () => void;
  goNext: () => void;
  goToday: () => void;
  jumpTo: (date: Date) => void;
  /* actions — filters */
  setFilters: (
    next:
      | SchedulerFilters
      | ((prev: SchedulerFilters) => SchedulerFilters),
  ) => void;
  clearFilters: () => void;
  /* actions — selection */
  selectEvent: (id: EventId | null) => void;
  selectSlot: (range: SchedulerSelectionState['slotRange']) => void;
  /* actions — density */
  setDensity: (density: SchedulerDensity) => void;
  /* actions — popover / modal */
  openQuickPopover: (
    draft: NewEventDraft,
    anchorRect: DOMRect | null,
    mode?: 'create' | 'view',
    eventId?: EventId | null,
  ) => void;
  closeQuickPopover: () => void;
  openEventModal: (
    event: SchedulerEvent | NewEventDraft,
    mode?: 'create' | 'edit',
  ) => void;
  closeEventModal: () => void;
  /* actions — CRUD */
  createEvent: (draft: NewEventDraft) => Promise<void>;
  updateEvent: (id: EventId, patch: Partial<SchedulerEvent>) => Promise<void>;
  deleteEvent: (id: EventId) => Promise<void>;
  moveEvent: (id: EventId, change: EventMoveChange) => Promise<void>;
  resizeEvent: (id: EventId, change: EventResizeChange) => Promise<void>;
  /* actions — drag */
  beginDrag: (params: BeginDragParams) => void;
  updateDrag: (params: UpdateDragParams) => void;
  commitDrag: () => Promise<void>;
  cancelDrag: () => void;
  /* derived predicates */
  canEditEvent: (event: SchedulerEvent) => boolean;
  /* resolved option flags (with defaults applied) */
  hourHeight: number;
  snapMinutes: 5 | 15 | 30 | 60;
  workingHours: { start: string; end: string };
  workingDays: number[];
  timeFormat: SchedulerTimeFormat;
  locale: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  multiDayCount: number;
  showNowIndicator: boolean;
  showHolidays: boolean;
  enableDragCreate: boolean;
  enableDragMove: boolean;
  enableDragResize: boolean;
  readOnly: boolean;
  /* i18n */
  t: SchedulerTranslations;
  /* misc */
  reset: () => void;
}