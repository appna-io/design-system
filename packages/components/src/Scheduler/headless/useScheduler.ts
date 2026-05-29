'use client';

import { useI18n } from '@apx-ui/engine';
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import {
  DEFAULT_SCHEDULER_TRANSLATIONS,
  mergeSchedulerTranslations,
} from '../Scheduler.i18n';
import type {
  BeginDragParams,
  CalendarSource,
  EventId,
  EventMoveChange,
  EventResizeChange,
  Holiday,
  NewEventDraft,
  PersistedSchedulerState,
  PositionedEvent,
  Resource,
  ResourceGroup,
  SchedulerDensity,
  SchedulerError as SchedulerErrorType,
  SchedulerEvent,
  SchedulerFilters,
  SchedulerSelectionState,
  SchedulerState,
  SchedulerTimeFormat,
  SchedulerTranslations,
  SchedulerView,
  UpdateDragParams,
  UseSchedulerOptions,
  UseSchedulerReturn,
} from '../Scheduler.types';

import {
  addDays,
  eachDayInRange,
  startOfDay,
  toDayKey,
} from '../helpers/dateMath';
import { layoutAllDayEvents, layoutTimedEvents } from '../helpers/eventLayout';
import {
  getBuiltInHolidays,
  indexHolidaysByDay,
  localeToRegions,
} from '../helpers/holidays';
import { expandRecurrence } from '../helpers/recurrence';
import { shiftAnchor, viewportRange } from '../helpers/viewportRange';

import {
  initialSchedulerState,
  schedulerReducer,
  type SchedulerAction,
} from './schedulerReducer';
import { resolveStorageAdapter, safeParse } from './storage';

type UpdateDragAction = Extract<SchedulerAction, { type: 'updateDrag' }>;

/**
 * The Scheduler's headless state machine.
 *
 * Drives both the high-level `<Scheduler />` and any consumer who wants to roll their own
 * DOM. The shape mirrors the spec in `plans/pending/components/58-scheduler.md`
 * §"Headless State Machine".
 *
 * Pipeline overview:
 *
 *   props.events  ─┐                                      ┌──▶ visibleEvents
 *   recurrence    ─┼──▶ expandRecurrence(range) ─┐        │
 *   filters       ─┘                              ├──▶ filter ─┼──▶ eventsByDay
 *                                                 │             │
 *                                                 │             ├──▶ layoutsByDay
 *                                                 │             │
 *                                                 │             └──▶ allDayLayoutsByDay
 *                                                 │
 *                  props.holidays / holidaysProvider ─▶ visibleHolidays
 *
 * All derivations are `useMemo`-cached on the inputs that matter.
 */
export function useScheduler(options: UseSchedulerOptions): UseSchedulerReturn {
  const {
    events,
    holidays: holidaysProp = 'auto',
    holidaysProvider,
    calendars,
    resources,
    view: controlledView,
    defaultView = 'week',
    onViewChange,
    date: controlledDate,
    defaultDate,
    onDateChange,
    onRangeChange,
    readOnly = false,
    isEventEditable,
    onEventCreate,
    onEventUpdate,
    onEventDelete,
    onEventMove,
    onEventResize,
    onConflict: _onConflict,
    onEventClick,
    onEventDoubleClick,
    onSlotClick,
    selectedEventId,
    onSelectedEventChange,
    state: controlledState,
    onStateChange,
    defaultFilters,
    defaultDensity = 'standard',
    density: densityProp,
    hourHeight: hourHeightProp,
    snapMinutes = 15,
    workingHours = { start: '09:00', end: '17:00' },
    workingDays = [1, 2, 3, 4, 5],
    timeFormat: timeFormatProp,
    locale: localeProp,
    weekStartsOn = 0,
    multiDayCount = 3,
    showNowIndicator = true,
    showHolidays = true,
    enableDragCreate = true,
    enableDragMove = true,
    enableDragResize = true,
    translations: translationsProp,
    storage,
    storageKey,
  } = options;

  /* -------------------------------------------------------------------- */
  /*  i18n + locale                                                        */
  /* -------------------------------------------------------------------- */

  const i18n = useI18n();
  const locale = localeProp ?? i18n?.locale ?? 'en';
  const providerTranslations = i18n?.get<Partial<SchedulerTranslations>>('Scheduler');
  const t = useMemo<SchedulerTranslations>(
    () =>
      mergeSchedulerTranslations(
        DEFAULT_SCHEDULER_TRANSLATIONS,
        providerTranslations,
        translationsProp,
      ),
    [providerTranslations, translationsProp],
  );

  const timeFormat: SchedulerTimeFormat =
    timeFormatProp ?? (locale.startsWith('en-US') ? '12h' : '24h');

  /* -------------------------------------------------------------------- */
  /*  Initial state                                                        */
  /* -------------------------------------------------------------------- */

  const storageAdapter = useMemo(() => resolveStorageAdapter(storage), [storage]);

  const initialView: SchedulerView = controlledView ?? defaultView;
  const initialDate: Date = controlledDate ?? defaultDate ?? new Date();

  const initialState = useMemo<SchedulerState>(() => {
    const range = viewportRange({
      view: initialView,
      anchor: initialDate,
      weekStartsOn,
      multiDayCount,
      workingDays,
    });
    let base = initialSchedulerState(
      initialView,
      initialDate,
      range,
      defaultFilters ?? {},
      defaultDensity,
    );
    if (storageAdapter && storageKey) {
      const raw = storageAdapter.get(storageKey);
      const persisted = safeParse<PersistedSchedulerState>(raw);
      if (persisted) {
        const date = new Date(persisted.date);
        const restoredRange = viewportRange({
          view: persisted.view,
          anchor: date,
          weekStartsOn,
          multiDayCount,
          workingDays,
        });
        const { dateRange: persistedRange, ...persistedRest } = persisted.filters;
        const restoredFilters: SchedulerFilters = { ...persistedRest };
        if (persistedRange) {
          restoredFilters.dateRange = {
            start: new Date(persistedRange.start),
            end: new Date(persistedRange.end),
          };
        }
        base = {
          ...base,
          view: persisted.view,
          date,
          visibleRange: restoredRange,
          density: persisted.density,
          filters: restoredFilters,
        };
      }
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageAdapter, storageKey]);

  const [internalState, dispatch] = useReducer(schedulerReducer, initialState);

  /* -------------------------------------------------------------------- */
  /*  Controlled merge                                                     */
  /* -------------------------------------------------------------------- */

  const state = useMemo<SchedulerState>(() => {
    let merged: SchedulerState = internalState;
    if (controlledView !== undefined && controlledView !== merged.view) {
      const range = viewportRange({
        view: controlledView,
        anchor: merged.date,
        weekStartsOn,
        multiDayCount,
        workingDays,
      });
      merged = { ...merged, view: controlledView, visibleRange: range };
    }
    if (controlledDate !== undefined && controlledDate.getTime() !== merged.date.getTime()) {
      const range = viewportRange({
        view: merged.view,
        anchor: controlledDate,
        weekStartsOn,
        multiDayCount,
        workingDays,
      });
      merged = { ...merged, date: controlledDate, visibleRange: range };
    }
    if (densityProp !== undefined && typeof densityProp === 'string' && densityProp !== merged.density) {
      merged = { ...merged, density: densityProp };
    }
    if (selectedEventId !== undefined && selectedEventId !== merged.selection.eventId) {
      merged = {
        ...merged,
        selection: { ...merged.selection, eventId: selectedEventId },
      };
    }
    if (controlledState) {
      merged = { ...merged, ...controlledState };
    }
    return merged;
  }, [
    internalState,
    controlledView,
    controlledDate,
    densityProp,
    selectedEventId,
    controlledState,
    weekStartsOn,
    multiDayCount,
    workingDays,
  ]);

  /* -------------------------------------------------------------------- */
  /*  onStateChange / onRangeChange notification                           */
  /* -------------------------------------------------------------------- */

  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;
  const prevStateRef = useRef<SchedulerState>(state);
  useEffect(() => {
    if (prevStateRef.current === state) return;
    prevStateRef.current = state;
    onStateChangeRef.current?.(state);
  }, [state]);

  const onRangeChangeRef = useRef(onRangeChange);
  onRangeChangeRef.current = onRangeChange;
  const prevRangeRef = useRef(state.visibleRange);
  useEffect(() => {
    if (
      prevRangeRef.current.start.getTime() === state.visibleRange.start.getTime() &&
      prevRangeRef.current.end.getTime() === state.visibleRange.end.getTime()
    ) {
      return;
    }
    prevRangeRef.current = state.visibleRange;
    onRangeChangeRef.current?.(state.visibleRange);
  }, [state.visibleRange]);

  /* -------------------------------------------------------------------- */
  /*  Persistence                                                          */
  /* -------------------------------------------------------------------- */

  useEffect(() => {
    if (!storageAdapter || !storageKey) return;
    // Strip the function-valued `custom` predicate (can't JSON-serialize) and rebuild
    // the `dateRange` into the ISO-string shape `PersistedSchedulerState` expects.
    const { custom: _custom, dateRange, ...rest } = state.filters;
    void _custom;
    const persistedFilters: PersistedSchedulerState['filters'] = { ...rest };
    if (dateRange) {
      persistedFilters.dateRange = {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      };
    }
    const snapshot: PersistedSchedulerState = {
      view: state.view,
      date: state.date.toISOString(),
      density: state.density,
      filters: persistedFilters,
    };
    try {
      storageAdapter.set(storageKey, JSON.stringify(snapshot));
    } catch {
      // Swallow — already guarded inside the adapter, but JSON.stringify can throw too.
    }
  }, [storageAdapter, storageKey, state.view, state.date, state.density, state.filters]);

  /* -------------------------------------------------------------------- */
  /*  Holidays                                                             */
  /* -------------------------------------------------------------------- */

  const [providerHolidays, setProviderHolidays] = useState<readonly Holiday[]>([]);

  useEffect(() => {
    if (!holidaysProvider) return;
    const year = state.visibleRange.start.getFullYear();
    let cancelled = false;
    const maybe = holidaysProvider(year, locale);
    if (Array.isArray(maybe)) {
      setProviderHolidays(maybe);
    } else if (maybe && typeof (maybe as Promise<readonly Holiday[]>).then === 'function') {
      (maybe as Promise<readonly Holiday[]>)
        .then((hs) => {
          if (!cancelled) setProviderHolidays(hs);
        })
        .catch(() => {
          // Silent fail — holidays are best-effort enrichment.
        });
    }
    return () => {
      cancelled = true;
    };
  }, [holidaysProvider, state.visibleRange.start, locale]);

  const resolvedHolidays = useMemo<readonly Holiday[]>(() => {
    if (!showHolidays) return [];
    if (holidaysProvider) return providerHolidays;
    if (Array.isArray(holidaysProp)) return holidaysProp;
    if (holidaysProp === 'auto') {
      const regions = localeToRegions(locale);
      return getBuiltInHolidays(state.visibleRange.start.getFullYear(), { regions });
    }
    return [];
  }, [
    showHolidays,
    holidaysProvider,
    providerHolidays,
    holidaysProp,
    locale,
    state.visibleRange.start,
  ]);

  const visibleHolidays = useMemo(() => {
    const filtered = state.filters.holidays?.show === false ? [] : resolvedHolidays;
    const restricted =
      state.filters.holidays?.regions && state.filters.holidays.regions.length > 0
        ? filtered.filter((h) => !h.region || state.filters.holidays!.regions!.includes(h.region))
        : filtered;
    return indexHolidaysByDay(restricted);
  }, [resolvedHolidays, state.filters.holidays]);

  /* -------------------------------------------------------------------- */
  /*  Visible events — expand recurrence then filter                       */
  /* -------------------------------------------------------------------- */

  const calendarById = useMemo<ReadonlyMap<string, CalendarSource>>(() => {
    const map = new Map<string, CalendarSource>();
    (calendars ?? []).forEach((c) => map.set(c.id, c));
    return map;
  }, [calendars]);

  const resourceById = useMemo<ReadonlyMap<string, Resource>>(() => {
    const map = new Map<string, Resource>();
    (resources ?? []).forEach((r) => map.set(r.id, r));
    return map;
  }, [resources]);

  const resourceGroups = useMemo<readonly ResourceGroup[]>(() => {
    if (!resources || resources.length === 0) return [];
    const map = new Map<string, Resource[]>();
    for (const r of resources) {
      const g = r.group ?? '';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(r);
    }
    return Array.from(map.entries()).map(([group, items]) => ({
      group,
      resources: items,
    }));
  }, [resources]);

  const visibleEvents = useMemo<readonly SchedulerEvent[]>(() => {
    const { start, end } = state.visibleRange;

    // 1. Expand recurrence
    const expanded: SchedulerEvent[] = [];
    for (const e of events) {
      const out = expandRecurrence(e, { rangeStart: start, rangeEnd: end });
      for (const inst of out) expanded.push(inst);
    }

    // 2. Apply visibility / search / calendar / resource filters
    const f = state.filters;
    const search = f.search?.trim().toLowerCase();
    const visibleCalendars =
      calendars && calendars.length > 0
        ? new Set(
            (f.calendarIds && f.calendarIds.length > 0
              ? f.calendarIds
              : calendars.filter((c) => c.visible !== false).map((c) => c.id)),
          )
        : null;
    const visibleResources =
      f.resourceIds && f.resourceIds.length > 0 ? new Set(f.resourceIds) : null;

    return expanded.filter((e) => {
      if (e.status === 'cancelled') return false;
      if (visibleCalendars && e.calendarId && !visibleCalendars.has(e.calendarId)) return false;
      if (visibleResources && e.resourceId && !visibleResources.has(e.resourceId)) return false;
      if (search) {
        const hay = `${e.title ?? ''} ${e.description ?? ''} ${e.location ?? ''}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (f.dateRange) {
        const t1 = e.start.getTime();
        const t2 = e.end.getTime();
        const a = f.dateRange.start.getTime();
        const b = f.dateRange.end.getTime();
        if (t2 < a || t1 > b) return false;
      }
      if (f.custom && !f.custom(e)) return false;
      return true;
    });
  }, [events, state.visibleRange, state.filters, calendars]);

  /* -------------------------------------------------------------------- */
  /*  Per-day binning + layout                                             */
  /* -------------------------------------------------------------------- */

  const days = useMemo(
    () => eachDayInRange(state.visibleRange.start, state.visibleRange.end),
    [state.visibleRange],
  );

  const eventsByDay = useMemo<ReadonlyMap<string, readonly SchedulerEvent[]>>(() => {
    const map = new Map<string, SchedulerEvent[]>();
    for (const d of days) map.set(toDayKey(d), []);
    for (const e of visibleEvents) {
      // Walk each day the event covers
      let cur = startOfDay(e.start);
      const last = startOfDay(e.end);
      let safety = 400;
      while (cur.getTime() <= last.getTime() && safety-- > 0) {
        const k = toDayKey(cur);
        const bucket = map.get(k);
        if (bucket) bucket.push(e);
        cur = addDays(cur, 1);
      }
    }
    return map;
  }, [visibleEvents, days]);

  const eventsByResource = useMemo<ReadonlyMap<string, readonly SchedulerEvent[]>>(() => {
    const map = new Map<string, SchedulerEvent[]>();
    for (const e of visibleEvents) {
      const r = e.resourceId ?? '';
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(e);
    }
    return map;
  }, [visibleEvents]);

  const layoutsByDay = useMemo<ReadonlyMap<string, readonly PositionedEvent[]>>(() => {
    return layoutTimedEvents({ events: visibleEvents, days });
  }, [visibleEvents, days]);

  const allDayLayoutsByDay = useMemo<ReadonlyMap<string, readonly PositionedEvent[]>>(() => {
    return layoutAllDayEvents({ events: visibleEvents, days });
  }, [visibleEvents, days]);

  /* -------------------------------------------------------------------- */
  /*  Actions                                                              */
  /* -------------------------------------------------------------------- */

  const setView = useCallback(
    (next: SchedulerView) => {
      const range = viewportRange({
        view: next,
        anchor: state.date,
        weekStartsOn,
        multiDayCount,
        workingDays,
      });
      dispatch({ type: 'setView', view: next, visibleRange: range });
      onViewChange?.(next);
    },
    [state.date, weekStartsOn, multiDayCount, workingDays, onViewChange],
  );

  const setDate = useCallback(
    (next: Date) => {
      const range = viewportRange({
        view: state.view,
        anchor: next,
        weekStartsOn,
        multiDayCount,
        workingDays,
      });
      dispatch({ type: 'setDate', date: next, visibleRange: range });
      onDateChange?.(next);
    },
    [state.view, weekStartsOn, multiDayCount, workingDays, onDateChange],
  );

  const goPrev = useCallback(
    () => setDate(shiftAnchor(state.view, state.date, -1, { multiDayCount })),
    [setDate, state.view, state.date, multiDayCount],
  );

  const goNext = useCallback(
    () => setDate(shiftAnchor(state.view, state.date, 1, { multiDayCount })),
    [setDate, state.view, state.date, multiDayCount],
  );

  const goToday = useCallback(() => setDate(new Date()), [setDate]);
  const jumpTo = useCallback((d: Date) => setDate(d), [setDate]);

  const setFilters = useCallback(
    (
      next:
        | SchedulerFilters
        | ((prev: SchedulerFilters) => SchedulerFilters),
    ) => {
      const resolved =
        typeof next === 'function' ? (next as (p: SchedulerFilters) => SchedulerFilters)(state.filters) : next;
      dispatch({ type: 'setFilters', filters: resolved });
    },
    [state.filters],
  );

  const clearFilters = useCallback(() => dispatch({ type: 'clearFilters' }), []);

  const selectEvent = useCallback(
    (id: EventId | null) => {
      dispatch({ type: 'setSelectionEvent', eventId: id });
      onSelectedEventChange?.(id);
    },
    [onSelectedEventChange],
  );

  const selectSlot = useCallback(
    (slot: SchedulerSelectionState['slotRange']) =>
      dispatch({ type: 'setSelectionSlot', slot }),
    [],
  );

  const setDensity = useCallback(
    (next: SchedulerDensity) => dispatch({ type: 'setDensity', density: next }),
    [],
  );

  const openQuickPopover = useCallback(
    (
      draft: NewEventDraft,
      anchorRect: DOMRect | null,
      mode: 'create' | 'view' = 'create',
      eventId: EventId | null = null,
    ) => {
      dispatch({ type: 'openQuickPopover', draft, anchorRect, mode, eventId });
    },
    [],
  );

  const closeQuickPopover = useCallback(() => dispatch({ type: 'closeQuickPopover' }), []);

  const openEventModal = useCallback(
    (event: SchedulerEvent | NewEventDraft, mode: 'create' | 'edit' = 'edit') => {
      const eventId = 'id' in event ? (event as SchedulerEvent).id : null;
      dispatch({
        type: 'openEventModal',
        draft: 'id' in event ? (event as unknown as NewEventDraft) : event,
        mode,
        eventId,
      });
    },
    [],
  );

  const closeEventModal = useCallback(() => dispatch({ type: 'closeEventModal' }), []);

  /* -------------------------------------------------------------------- */
  /*  CRUD — these are thin wrappers; the consumer's onEventX callbacks    */
  /*  do the actual mutation. We surface errors back into `state.errors`. */
  /* -------------------------------------------------------------------- */

  const canEditEvent = useCallback(
    (event: SchedulerEvent): boolean => {
      if (readOnly) return false;
      if (event.editable === false) return false;
      if (event.editable === true) return true;
      if (isEventEditable) return isEventEditable(event);
      if (event.calendarId) {
        const cal = calendarById.get(event.calendarId);
        if (cal && cal.editable === false) return false;
      }
      return true;
    },
    [readOnly, isEventEditable, calendarById],
  );

  const handleError = useCallback(
    (
      code: 'create' | 'update' | 'delete' | 'move' | 'resize',
      message: string,
      eventId?: EventId,
      cause?: unknown,
    ) => {
      const error: SchedulerErrorType = { code, message, cause };
      if (eventId !== undefined) error.eventId = eventId;
      dispatch({ type: 'pushError', error });
    },
    [],
  );

  const createEvent = useCallback(
    async (draft: NewEventDraft) => {
      if (readOnly) return;
      try {
        await onEventCreate?.(draft);
      } catch (err) {
        handleError('create', (err as Error)?.message ?? 'Failed to create event', undefined, err);
      }
    },
    [readOnly, onEventCreate, handleError],
  );

  const updateEvent = useCallback(
    async (id: EventId, patch: Partial<SchedulerEvent>) => {
      const target = events.find((e) => e.id === id);
      if (!target) return;
      if (!canEditEvent(target)) return;
      try {
        await onEventUpdate?.(target, patch);
      } catch (err) {
        handleError('update', (err as Error)?.message ?? 'Failed to update event', id, err);
      }
    },
    [events, canEditEvent, onEventUpdate, handleError],
  );

  const deleteEvent = useCallback(
    async (id: EventId) => {
      const target = events.find((e) => e.id === id);
      if (target && !canEditEvent(target)) return;
      try {
        await onEventDelete?.(id);
      } catch (err) {
        handleError('delete', (err as Error)?.message ?? 'Failed to delete event', id, err);
      }
    },
    [events, canEditEvent, onEventDelete, handleError],
  );

  const moveEvent = useCallback(
    async (id: EventId, change: EventMoveChange) => {
      const target = events.find((e) => e.id === id);
      if (!target || !canEditEvent(target)) return;
      try {
        await onEventMove?.(target, change);
      } catch (err) {
        handleError('move', (err as Error)?.message ?? 'Failed to move event', id, err);
      }
    },
    [events, canEditEvent, onEventMove, handleError],
  );

  const resizeEvent = useCallback(
    async (id: EventId, change: EventResizeChange) => {
      const target = events.find((e) => e.id === id);
      if (!target || !canEditEvent(target)) return;
      try {
        await onEventResize?.(target, change);
      } catch (err) {
        handleError('resize', (err as Error)?.message ?? 'Failed to resize event', id, err);
      }
    },
    [events, canEditEvent, onEventResize, handleError],
  );

  /* -------------------------------------------------------------------- */
  /*  Drag interaction                                                     */
  /* -------------------------------------------------------------------- */

  const beginDrag = useCallback((params: BeginDragParams) => {
    dispatch({
      type: 'beginDrag',
      dragType: params.type,
      eventId: params.eventId ?? null,
      previewStart: params.start,
      previewEnd: params.end,
      previewResourceId: params.resourceId ?? null,
    });
  }, []);

  const updateDrag = useCallback((params: UpdateDragParams) => {
    const action: UpdateDragAction = { type: 'updateDrag' };
    if (params.start !== undefined) action.previewStart = params.start;
    if (params.end !== undefined) action.previewEnd = params.end;
    if (params.resourceId !== undefined) action.previewResourceId = params.resourceId;
    dispatch(action);
  }, []);

  const commitDrag = useCallback(async () => {
    const { drag } = state;
    if (!drag.active || !drag.previewStart || !drag.previewEnd) {
      dispatch({ type: 'cancelDrag' });
      return;
    }
    if (drag.type === 'create') {
      const draft: NewEventDraft = {
        start: drag.previewStart,
        end: drag.previewEnd,
        resourceId: drag.previewResourceId,
      };
      // Don't auto-call onEventCreate — open the quick popover so the user can supply a title.
      dispatch({ type: 'openQuickPopover', draft, anchorRect: null, mode: 'create', eventId: null });
    } else if (drag.type === 'move' && drag.eventId) {
      const moveChange: EventMoveChange = {
        start: drag.previewStart,
        end: drag.previewEnd,
      };
      if (drag.previewResourceId !== null) moveChange.resourceId = drag.previewResourceId;
      await moveEvent(drag.eventId, moveChange);
    } else if (drag.type === 'resize' && drag.eventId) {
      await resizeEvent(drag.eventId, {
        start: drag.previewStart,
        end: drag.previewEnd,
      });
    }
    dispatch({ type: 'commitDrag' });
  }, [state, moveEvent, resizeEvent]);

  const cancelDrag = useCallback(() => dispatch({ type: 'cancelDrag' }), []);

  /* -------------------------------------------------------------------- */
  /*  Compatibility wrappers for option-derived defaults                   */
  /* -------------------------------------------------------------------- */

  const hourHeight = hourHeightProp ?? resolveDefaultHourHeightInline(state.density);

  const reset = useCallback(() => {
    const range = viewportRange({
      view: defaultView,
      anchor: defaultDate ?? new Date(),
      weekStartsOn,
      multiDayCount,
      workingDays,
    });
    dispatch({ type: 'setView', view: defaultView, visibleRange: range });
    dispatch({ type: 'clearFilters' });
  }, [defaultView, defaultDate, weekStartsOn, multiDayCount, workingDays]);

  /* -------------------------------------------------------------------- */
  /*  Event click handlers — exposed via context so views don't redeclare. */
  /* -------------------------------------------------------------------- */

  // Note: the actual click handlers fire from view-level events. They're forwarded to
  // the consumer's props for parity with `<DataGrid />`'s pattern.
  void onEventClick;
  void onEventDoubleClick;
  void onSlotClick;

  return {
    state,
    visibleEvents,
    eventsByDay,
    eventsByResource,
    layoutsByDay,
    allDayLayoutsByDay,
    visibleHolidays,
    calendars: calendars ?? [],
    calendarById,
    resourceById,
    resourceGroups,
    setView,
    setDate,
    goPrev,
    goNext,
    goToday,
    jumpTo,
    setFilters,
    clearFilters,
    selectEvent,
    selectSlot,
    setDensity,
    openQuickPopover,
    closeQuickPopover,
    openEventModal,
    closeEventModal,
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    resizeEvent,
    beginDrag,
    updateDrag,
    commitDrag,
    cancelDrag,
    canEditEvent,
    hourHeight,
    snapMinutes,
    workingHours,
    workingDays,
    timeFormat,
    locale,
    weekStartsOn,
    multiDayCount,
    showNowIndicator,
    showHolidays,
    enableDragCreate,
    enableDragMove,
    enableDragResize,
    readOnly,
    t,
    reset,
  };
}

/** Duplicated to avoid a top-level circular import with `SchedulerContext`. */
function resolveDefaultHourHeightInline(density: SchedulerDensity): number {
  switch (density) {
    case 'compact':
      return 36;
    case 'comfortable':
      return 64;
    default:
      return 48;
  }
}
