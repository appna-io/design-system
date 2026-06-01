/**
 * `<Scheduler />` — Tier-3 component, sibling to `<DataGrid />`. See
 * `plans/pending/components/58-scheduler.md` for the full plan + suggested PR split.
 *
 * Compound assembly via `Object.assign` — same pattern Card / Accordion / Popover use.
 * Subparts are reachable through dot syntax (`<Scheduler.Toolbar>`, …) AND are also
 * exported individually as named exports for type-import + tree-shaking.
 */
import { Scheduler as SchedulerRoot } from './Scheduler';
import { SchedulerCalendarList } from './parts/SchedulerCalendarList';
import { SchedulerDensitySelect } from './parts/SchedulerDensitySelect';
import { SchedulerFilterMenu } from './parts/SchedulerFilterMenu';
import { SchedulerHolidayBanner } from './parts/SchedulerHolidayBanner';
import { SchedulerHolidayRegionFilter } from './parts/SchedulerHolidayRegionFilter';
import { SchedulerHolidayToggle } from './parts/SchedulerHolidayToggle';
import { SchedulerMiniMonth } from './parts/SchedulerMiniMonth';
import { SchedulerNowIndicator } from './parts/SchedulerNowIndicator';
import { SchedulerEventCard } from './parts/SchedulerEventCard';
import { SchedulerQuickPopover } from './parts/SchedulerQuickPopover';
import { SchedulerSearchInput } from './parts/SchedulerSearchInput';
import { SchedulerSidebar } from './parts/SchedulerSidebar';
import { SchedulerTimeAxis } from './parts/SchedulerTimeAxis';
import { SchedulerToolbar } from './parts/SchedulerToolbar';
import { AgendaView } from './views/AgendaView';
import { MonthView } from './views/MonthView';
import { ResourceViewStub, YearViewStub } from './views/StubViews';
import { TimeGridView } from './views/TimeGridView';

export const Scheduler = Object.assign(SchedulerRoot, {
  Toolbar: SchedulerToolbar,
  Sidebar: SchedulerSidebar,
  MiniMonth: SchedulerMiniMonth,
  CalendarList: SchedulerCalendarList,
  SearchInput: SchedulerSearchInput,
  FilterMenu: SchedulerFilterMenu,
  DensitySelect: SchedulerDensitySelect,
  HolidayToggle: SchedulerHolidayToggle,
  HolidayRegionFilter: SchedulerHolidayRegionFilter,
  QuickPopover: SchedulerQuickPopover,
  EventCard: SchedulerEventCard,
  NowIndicator: SchedulerNowIndicator,
  TimeAxis: SchedulerTimeAxis,
  HolidayBanner: SchedulerHolidayBanner,
  MonthView,
  TimeGridView,
  AgendaView,
  ResourceView: ResourceViewStub,
  YearView: YearViewStub,
});

/* Headless hook — for consumers rolling bespoke UIs. */
export { useScheduler } from './headless/useScheduler';

/* Context — for consumers building custom subparts. */
export {
  SchedulerContext,
  useSchedulerContext,
  useOptionalSchedulerContext,
  resolveDefaultHourHeight,
  type SchedulerChromeFlags,
  type SchedulerContextValue,
} from './SchedulerContext';

/* i18n defaults + merger */
export {
  DEFAULT_SCHEDULER_TRANSLATIONS,
  mergeSchedulerTranslations,
} from './Scheduler.i18n';

/* Pure helpers — exposed verbatim so consumers building their own views don't
 * re-implement them. Phase 33 (`<Calendar>`) will eventually re-export `dateMath` from
 * its own module; until then, `Scheduler` owns the canonical copy. */
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
  computeMonthGrid,
  differenceInDays,
  eachDayInRange,
  eachDayKeyInRange,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  formatHHMM,
  fromDayKey,
  intervalsOverlap,
  isSameDay,
  isSameMonth,
  isSameYear,
  isValidDate,
  isWithin,
  isWorkingDay,
  isoWeekNumber,
  max as maxDate,
  min as minDate,
  minutesSinceMidnight,
  pad2,
  parseHHMM,
  rangeOfDays,
  snapMinute,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toDayKey,
  withTime,
} from './helpers/dateMath';

export { layoutAllDayEvents, layoutTimedEvents, positionedToStyle, minuteToTop } from './helpers/eventLayout';
export { splitAtMidnight, type EventSegment } from './helpers/splitAtMidnight';
export { shiftAnchor, viewportRange } from './helpers/viewportRange';
export {
  addRecurrenceException,
  describeRecurrence,
  expandRecurrence,
  weekdayFromDate,
} from './helpers/recurrence';
export {
  getBuiltInHolidays,
  indexHolidaysByDay,
  localeToRegions,
} from './helpers/holidays';
export {
  applyMoveDelta,
  applyResizeDelta,
  dragRange,
  pointerToDateTime,
  pointerToDay,
  pointerToTime,
} from './helpers/dragMath';
export { findConflicts } from './helpers/findConflicts';
export { isNamedColor, resolveEventColor } from './helpers/eventColor';
export {
  formatDayMonth,
  formatDayNumber,
  formatLongDayDate,
  formatMonthYear,
  formatRangeTitle,
  formatTime,
  formatTimeRange,
  formatWeekday,
  formatYear,
} from './helpers/formatTime';

/* Recipe surface — exposed so theme overrides can target every slot. */
export {
  schedulerAgendaDayLabelRecipe,
  schedulerAgendaDayRecipe,
  schedulerAgendaEventRecipe,
  schedulerAgendaListRecipe,
  schedulerAllDayBandRecipe,
  schedulerAllDayCellRecipe,
  schedulerAllDayLabelRecipe,
  schedulerBodyRecipe,
  schedulerBodyWithSidebarRecipe,
  schedulerCalendarListItemRecipe,
  schedulerCalendarListRecipe,
  schedulerCalendarListSwatchRecipe,
  schedulerDayColumnRecipe,
  schedulerDragPreviewRecipe,
  schedulerEmptyRecipe,
  schedulerEventRecipe,
  schedulerEventResizeHandleRecipe,
  schedulerEventTimeRecipe,
  schedulerEventTitleRecipe,
  schedulerFilterCountBadgeRecipe,
  schedulerHolidayBadgeRecipe,
  schedulerHolidayBannerRecipe,
  schedulerHourLineRecipe,
  schedulerMiniMonthDayRecipe,
  schedulerMiniMonthDowRecipe,
  schedulerMiniMonthGridRecipe,
  schedulerMiniMonthHeaderRecipe,
  schedulerMiniMonthNavBtnRecipe,
  schedulerMiniMonthRecipe,
  schedulerMonthCellRecipe,
  schedulerMonthDayNumberRecipe,
  schedulerMonthGridRecipe,
  schedulerMonthHeaderCellRecipe,
  schedulerMonthHeaderRecipe,
  schedulerNowDotRecipe,
  schedulerNowIndicatorRecipe,
  schedulerNowLabelRecipe,
  schedulerNowLineRecipe,
  schedulerOffHoursOverlayRecipe,
  schedulerQuickPopoverFieldRowRecipe,
  schedulerQuickPopoverFooterRecipe,
  schedulerQuickPopoverHeaderRecipe,
  schedulerQuickPopoverRecipe,
  schedulerQuickPopoverTabsRecipe,
  schedulerRootRecipe,
  schedulerScrollerRecipe,
  schedulerSidebarRecipe,
  schedulerSidebarSectionRecipe,
  schedulerSlotSelectionRecipe,
  schedulerTimeAxisLabelRecipe,
  schedulerTimeAxisRecipe,
  schedulerTimeGridDayColumnHeaderRecipe,
  schedulerTimeGridDayNumberRecipe,
  schedulerTimeGridHeaderRecipe,
  schedulerTimeGridRecipe,
  schedulerToolbarRecipe,
  schedulerToolbarTitleRecipe,
} from './Scheduler.recipe';

/* Public types — full surface. */
export type {
  Attendee,
  BeginDragParams,
  CalendarSource,
  ConflictInfo,
  EventId,
  EventMoveChange,
  EventResizeChange,
  Holiday,
  NewEventDraft,
  PersistedSchedulerState,
  PositionedEvent,
  RecurrenceFreq,
  RecurrenceRule,
  Reminder,
  RenderEventContext,
  RenderEventModalContext,
  RenderQuickPopoverContext,
  Resource,
  ResourceGroup,
  SchedulerColor,
  SchedulerDensity,
  SchedulerDragState,
  SchedulerElevation,
  SchedulerError,
  SchedulerEvent,
  SchedulerEventShape,
  SchedulerFilters,
  SchedulerModalState,
  SchedulerNowIndicatorStyle,
  SchedulerPopoverState,
  SchedulerProps,
  SchedulerRoundedCorners,
  SchedulerSelectionState,
  SchedulerSize,
  SchedulerState,
  SchedulerTimeFormat,
  SchedulerTranslations,
  SchedulerVariant,
  SchedulerView,
  StorageAdapter as SchedulerStorageAdapter,
  StorageKind as SchedulerStorageKind,
  UpdateDragParams,
  UseSchedulerOptions,
  UseSchedulerReturn,
  Weekday,
} from './Scheduler.types';

/* Subpart prop types — for consumers extending the defaults. */
export type { SchedulerToolbarProps } from './parts/SchedulerToolbar';
export type { SchedulerQuickPopoverProps } from './parts/SchedulerQuickPopover';
export type { SchedulerEventCardProps } from './parts/SchedulerEventCard';
export type { SchedulerNowIndicatorProps } from './parts/SchedulerNowIndicator';
export type { SchedulerHolidayBannerProps } from './parts/SchedulerHolidayBanner';
export type { SchedulerSidebarProps } from './parts/SchedulerSidebar';
export type { SchedulerMiniMonthProps } from './parts/SchedulerMiniMonth';
export type { SchedulerCalendarListProps } from './parts/SchedulerCalendarList';
export type { SchedulerSearchInputProps } from './parts/SchedulerSearchInput';
export type { SchedulerFilterMenuProps } from './parts/SchedulerFilterMenu';
export type { SchedulerDensitySelectProps } from './parts/SchedulerDensitySelect';
export type { SchedulerHolidayToggleProps } from './parts/SchedulerHolidayToggle';
export type { SchedulerHolidayRegionFilterProps } from './parts/SchedulerHolidayRegionFilter';
export type { TimeGridViewProps } from './views/TimeGridView';

export { meta as SchedulerMeta } from './meta';