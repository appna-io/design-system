import type {
  EventId,
  SchedulerDensity,
  SchedulerError,
  SchedulerFilters,
  SchedulerSelectionState,
  SchedulerState,
  SchedulerView,
} from '../Scheduler.types';

/**
 * Single-reducer state machine. The Scheduler's state graph is small enough that a single
 * union of actions is clearer than DataGrid's per-slice approach — slices would create
 * cross-cutting actions (drag → popover → selection) that read worse split across files.
 *
 * Visible-range derivation is done in the hook (so the reducer stays pure of any
 * dependency on `viewportRange`'s default values), but the action types accept a precomputed
 * range for atomicity.
 */
export type SchedulerAction =
  | { type: 'setView'; view: SchedulerView; visibleRange: { start: Date; end: Date } }
  | { type: 'setDate'; date: Date; visibleRange: { start: Date; end: Date } }
  | { type: 'setVisibleRange'; range: { start: Date; end: Date } }
  | { type: 'setFilters'; filters: SchedulerFilters }
  | { type: 'clearFilters' }
  | { type: 'setSelectionEvent'; eventId: EventId | null }
  | { type: 'setSelectionSlot'; slot: SchedulerSelectionState['slotRange'] }
  | { type: 'setDensity'; density: SchedulerDensity }
  | {
      type: 'openQuickPopover';
      draft: SchedulerState['popover']['draft'];
      anchorRect: DOMRect | null;
      mode: 'create' | 'view';
      eventId: EventId | null;
    }
  | { type: 'closeQuickPopover' }
  | {
      type: 'openEventModal';
      draft: SchedulerState['modal']['draft'];
      mode: 'create' | 'edit';
      eventId: EventId | null;
    }
  | { type: 'closeEventModal' }
  | {
      type: 'beginDrag';
      dragType: 'create' | 'move' | 'resize';
      eventId: EventId | null;
      previewStart: Date;
      previewEnd: Date;
      previewResourceId: string | null;
    }
  | {
      type: 'updateDrag';
      previewStart?: Date | undefined;
      previewEnd?: Date | undefined;
      previewResourceId?: string | null | undefined;
    }
  | { type: 'cancelDrag' }
  | { type: 'commitDrag' }
  | { type: 'pushError'; error: SchedulerError }
  | { type: 'clearErrors' };

export const initialSchedulerState = (
  view: SchedulerView,
  date: Date,
  visibleRange: { start: Date; end: Date },
  filters: SchedulerFilters,
  density: SchedulerDensity,
): SchedulerState => ({
  view,
  date,
  visibleRange,
  filters,
  selection: { eventId: null, slotRange: null },
  density,
  popover: { open: false, mode: 'create', draft: null, eventId: null, anchorRect: null },
  modal: { open: false, mode: 'create', draft: null, eventId: null },
  drag: {
    active: false,
    type: null,
    eventId: null,
    previewStart: null,
    previewEnd: null,
    previewResourceId: null,
  },
  errors: [],
});

export function schedulerReducer(state: SchedulerState, action: SchedulerAction): SchedulerState {
  switch (action.type) {
    case 'setView':
      return { ...state, view: action.view, visibleRange: action.visibleRange };
    case 'setDate':
      return { ...state, date: action.date, visibleRange: action.visibleRange };
    case 'setVisibleRange':
      return { ...state, visibleRange: action.range };
    case 'setFilters':
      return { ...state, filters: action.filters };
    case 'clearFilters':
      return { ...state, filters: {} };
    case 'setSelectionEvent':
      return {
        ...state,
        selection: { ...state.selection, eventId: action.eventId },
      };
    case 'setSelectionSlot':
      return {
        ...state,
        selection: { ...state.selection, slotRange: action.slot },
      };
    case 'setDensity':
      return { ...state, density: action.density };
    case 'openQuickPopover':
      return {
        ...state,
        popover: {
          open: true,
          mode: action.mode,
          draft: action.draft,
          eventId: action.eventId,
          anchorRect: action.anchorRect,
        },
      };
    case 'closeQuickPopover':
      return {
        ...state,
        popover: { open: false, mode: 'create', draft: null, eventId: null, anchorRect: null },
      };
    case 'openEventModal':
      return {
        ...state,
        modal: {
          open: true,
          mode: action.mode,
          draft: action.draft,
          eventId: action.eventId,
        },
      };
    case 'closeEventModal':
      return {
        ...state,
        modal: { open: false, mode: 'create', draft: null, eventId: null },
      };
    case 'beginDrag':
      return {
        ...state,
        drag: {
          active: true,
          type: action.dragType,
          eventId: action.eventId,
          previewStart: action.previewStart,
          previewEnd: action.previewEnd,
          previewResourceId: action.previewResourceId,
        },
      };
    case 'updateDrag':
      if (!state.drag.active) return state;
      return {
        ...state,
        drag: {
          ...state.drag,
          previewStart: action.previewStart ?? state.drag.previewStart,
          previewEnd: action.previewEnd ?? state.drag.previewEnd,
          previewResourceId:
            action.previewResourceId !== undefined
              ? action.previewResourceId
              : state.drag.previewResourceId,
        },
      };
    case 'cancelDrag':
    case 'commitDrag':
      return {
        ...state,
        drag: {
          active: false,
          type: null,
          eventId: null,
          previewStart: null,
          previewEnd: null,
          previewResourceId: null,
        },
      };
    case 'pushError':
      return { ...state, errors: [...state.errors, action.error].slice(-10) };
    case 'clearErrors':
      return { ...state, errors: [] };
    default:
      return state;
  }
}
