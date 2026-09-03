import { describe, expect, it } from 'vitest';

import {
  initialSchedulerState,
  schedulerReducer,
  type SchedulerAction,
} from '../src/Scheduler/headless/schedulerReducer';
import type { SchedulerError, SchedulerState } from '../src/Scheduler/Scheduler.types';

const RANGE = { start: new Date(2024, 0, 8), end: new Date(2024, 0, 14, 23, 59) };
const NEXT_RANGE = { start: new Date(2024, 0, 15), end: new Date(2024, 0, 21, 23, 59) };

const initial = (): SchedulerState =>
  initialSchedulerState('week', new Date(2024, 0, 10), RANGE, {}, 'standard');

/** Apply actions in order from a fresh initial state. */
const run = (...actions: SchedulerAction[]): SchedulerState =>
  actions.reduce(schedulerReducer, initial());

const error = (code: SchedulerError['code'], message: string): SchedulerError => ({ code, message });

const dragging = (): SchedulerAction => ({
  type: 'beginDrag',
  dragType: 'move',
  eventId: 'e1',
  previewStart: new Date(2024, 0, 10, 9),
  previewEnd: new Date(2024, 0, 10, 10),
  previewResourceId: 'room-1',
});

describe('initialSchedulerState', () => {
  it('seeds the values it is given', () => {
    const state = initial();
    expect(state.view).toBe('week');
    expect(state.density).toBe('standard');
    expect(state.visibleRange).toBe(RANGE);
  });

  it('starts with nothing selected, open, dragging or errored', () => {
    const state = initial();
    expect(state.selection).toEqual({ eventId: null, slotRange: null });
    expect(state.popover.open).toBe(false);
    expect(state.modal.open).toBe(false);
    expect(state.drag.active).toBe(false);
    expect(state.errors).toEqual([]);
  });

  it('builds an independent state each call', () => {
    expect(initial()).not.toBe(initial());
    expect(initial().errors).not.toBe(initial().errors);
  });
});

describe('navigation', () => {
  it('setView changes the view and range together', () => {
    const state = run({ type: 'setView', view: 'month', visibleRange: NEXT_RANGE });
    expect(state.view).toBe('month');
    expect(state.visibleRange).toBe(NEXT_RANGE);
  });

  it('setView leaves the anchor date alone', () => {
    const state = run({ type: 'setView', view: 'day', visibleRange: NEXT_RANGE });
    expect(state.date).toEqual(new Date(2024, 0, 10));
  });

  it('setDate changes the date and range together', () => {
    const date = new Date(2024, 0, 17);
    const state = run({ type: 'setDate', date, visibleRange: NEXT_RANGE });
    expect(state.date).toBe(date);
    expect(state.visibleRange).toBe(NEXT_RANGE);
  });

  it('setDate leaves the view alone', () => {
    const state = run({ type: 'setDate', date: new Date(2024, 0, 17), visibleRange: NEXT_RANGE });
    expect(state.view).toBe('week');
  });

  it('setVisibleRange moves the range without touching view or date', () => {
    const state = run({ type: 'setVisibleRange', range: NEXT_RANGE });
    expect(state.visibleRange).toBe(NEXT_RANGE);
    expect(state.view).toBe('week');
    expect(state.date).toEqual(new Date(2024, 0, 10));
  });
});

describe('filters', () => {
  it('setFilters replaces the whole filter object', () => {
    const state = run(
      { type: 'setFilters', filters: { search: 'standup', calendarIds: ['work'] } },
      { type: 'setFilters', filters: { search: 'retro' } },
    );
    expect(state.filters).toEqual({ search: 'retro' });
  });

  it('clearFilters empties them', () => {
    const state = run(
      { type: 'setFilters', filters: { search: 'standup' } },
      { type: 'clearFilters' },
    );
    expect(state.filters).toEqual({});
  });

  it('clearFilters leaves navigation untouched', () => {
    const state = run({ type: 'setFilters', filters: { search: 'x' } }, { type: 'clearFilters' });
    expect(state.view).toBe('week');
    expect(state.visibleRange).toBe(RANGE);
  });
});

describe('selection', () => {
  const slot = { start: new Date(2024, 0, 10, 9), end: new Date(2024, 0, 10, 10) };

  it('selects an event', () => {
    expect(run({ type: 'setSelectionEvent', eventId: 'e1' }).selection.eventId).toBe('e1');
  });

  it('clears the event selection', () => {
    const state = run(
      { type: 'setSelectionEvent', eventId: 'e1' },
      { type: 'setSelectionEvent', eventId: null },
    );
    expect(state.selection.eventId).toBeNull();
  });

  it('selects a slot range', () => {
    expect(run({ type: 'setSelectionSlot', slot }).selection.slotRange).toBe(slot);
  });

  it('keeps event and slot selection independent', () => {
    const state = run({ type: 'setSelectionEvent', eventId: 'e1' }, { type: 'setSelectionSlot', slot });
    expect(state.selection).toEqual({ eventId: 'e1', slotRange: slot });
  });

  it('clears a slot selection without dropping the event', () => {
    const state = run(
      { type: 'setSelectionEvent', eventId: 'e1' },
      { type: 'setSelectionSlot', slot },
      { type: 'setSelectionSlot', slot: null },
    );
    expect(state.selection).toEqual({ eventId: 'e1', slotRange: null });
  });
});

describe('density', () => {
  it('sets the density', () => {
    expect(run({ type: 'setDensity', density: 'compact' }).density).toBe('compact');
  });
});

describe('quick popover', () => {
  const open = (): SchedulerAction => ({
    type: 'openQuickPopover',
    draft: { start: new Date(2024, 0, 10, 9), end: new Date(2024, 0, 10, 10) },
    anchorRect: null,
    mode: 'create',
    eventId: null,
  });

  it('opens with the given draft, mode and anchor', () => {
    const state = run(open());
    expect(state.popover.open).toBe(true);
    expect(state.popover.mode).toBe('create');
    expect(state.popover.draft).not.toBeNull();
  });

  it('opens in view mode against an existing event', () => {
    const state = run({
      type: 'openQuickPopover',
      draft: null,
      anchorRect: null,
      mode: 'view',
      eventId: 'e1',
    });
    expect(state.popover).toMatchObject({ open: true, mode: 'view', eventId: 'e1' });
  });

  it('replaces the popover wholesale on a second open', () => {
    const state = run(open(), {
      type: 'openQuickPopover',
      draft: null,
      anchorRect: null,
      mode: 'view',
      eventId: 'e2',
    });
    expect(state.popover).toMatchObject({ mode: 'view', eventId: 'e2', draft: null });
  });

  it('resets every field on close', () => {
    const state = run(open(), { type: 'closeQuickPopover' });
    expect(state.popover).toEqual({
      open: false,
      mode: 'create',
      draft: null,
      eventId: null,
      anchorRect: null,
    });
  });

  it('does not touch the modal', () => {
    expect(run(open()).modal.open).toBe(false);
  });
});

describe('event modal', () => {
  const open = (): SchedulerAction => ({
    type: 'openEventModal',
    draft: { start: new Date(2024, 0, 10, 9), end: new Date(2024, 0, 10, 10) },
    mode: 'edit',
    eventId: 'e1',
  });

  it('opens with the given draft, mode and event', () => {
    expect(run(open()).modal).toMatchObject({ open: true, mode: 'edit', eventId: 'e1' });
  });

  it('resets every field on close', () => {
    const state = run(open(), { type: 'closeEventModal' });
    expect(state.modal).toEqual({ open: false, mode: 'create', draft: null, eventId: null });
  });

  it('does not touch the popover', () => {
    expect(run(open()).popover.open).toBe(false);
  });
});

describe('drag', () => {
  it('beginDrag activates with the preview', () => {
    const state = run(dragging());
    expect(state.drag).toMatchObject({
      active: true,
      type: 'move',
      eventId: 'e1',
      previewResourceId: 'room-1',
    });
  });

  it('updateDrag moves the preview', () => {
    const previewStart = new Date(2024, 0, 10, 11);
    const state = run(dragging(), { type: 'updateDrag', previewStart });
    expect(state.drag.previewStart).toBe(previewStart);
  });

  it('updateDrag keeps fields it was not given', () => {
    const state = run(dragging(), { type: 'updateDrag', previewStart: new Date(2024, 0, 10, 11) });
    expect(state.drag.previewEnd).toEqual(new Date(2024, 0, 10, 10));
    expect(state.drag.previewResourceId).toBe('room-1');
  });

  it('updateDrag can clear the resource to null', () => {
    // `null` is a meaningful value here (dragged off every resource lane), so it must be
    // distinguishable from "field omitted".
    const state = run(dragging(), { type: 'updateDrag', previewResourceId: null });
    expect(state.drag.previewResourceId).toBeNull();
  });

  it('updateDrag leaves the resource alone when the field is omitted', () => {
    const state = run(dragging(), { type: 'updateDrag', previewResourceId: undefined });
    expect(state.drag.previewResourceId).toBe('room-1');
  });

  it('updateDrag is a no-op when no drag is active', () => {
    const before = initial();
    const after = schedulerReducer(before, {
      type: 'updateDrag',
      previewStart: new Date(2024, 0, 10, 11),
    });
    expect(after).toBe(before);
  });

  it('cancelDrag clears the drag state', () => {
    const state = run(dragging(), { type: 'cancelDrag' });
    expect(state.drag).toEqual({
      active: false,
      type: null,
      eventId: null,
      previewStart: null,
      previewEnd: null,
      previewResourceId: null,
    });
  });

  it('commitDrag clears the drag state identically to cancel', () => {
    // The reducer only tears the drag down — `useScheduler.commitDrag` performs the move or
    // resize and opens the popover *before* dispatching, so the two actions are deliberately
    // indistinguishable here.
    expect(run(dragging(), { type: 'commitDrag' }).drag).toEqual(
      run(dragging(), { type: 'cancelDrag' }).drag,
    );
  });

  it('a second beginDrag replaces the first', () => {
    const state = run(dragging(), {
      type: 'beginDrag',
      dragType: 'resize',
      eventId: 'e2',
      previewStart: new Date(2024, 0, 11, 9),
      previewEnd: new Date(2024, 0, 11, 10),
      previewResourceId: null,
    });
    expect(state.drag).toMatchObject({ type: 'resize', eventId: 'e2', previewResourceId: null });
  });

  it('dragging leaves selection and navigation alone', () => {
    const state = run({ type: 'setSelectionEvent', eventId: 'e9' }, dragging());
    expect(state.selection.eventId).toBe('e9');
    expect(state.visibleRange).toBe(RANGE);
  });
});

describe('errors', () => {
  it('appends an error', () => {
    const state = run({ type: 'pushError', error: error('create', 'nope') });
    expect(state.errors).toEqual([{ code: 'create', message: 'nope' }]);
  });

  it('keeps errors in the order they arrived', () => {
    const state = run(
      { type: 'pushError', error: error('create', 'first') },
      { type: 'pushError', error: error('delete', 'second') },
    );
    expect(state.errors.map((e) => e.message)).toEqual(['first', 'second']);
  });

  it('keeps only the 10 most recent', () => {
    const pushes = Array.from({ length: 14 }, (_, i): SchedulerAction => ({
      type: 'pushError',
      error: error('update', `e${i}`),
    }));
    const state = run(...pushes);
    expect(state.errors).toHaveLength(10);
    expect(state.errors[0]!.message).toBe('e4');
    expect(state.errors[9]!.message).toBe('e13');
  });

  it('clearErrors empties the list', () => {
    const state = run({ type: 'pushError', error: error('move', 'x') }, { type: 'clearErrors' });
    expect(state.errors).toEqual([]);
  });
});

describe('purity', () => {
  it('returns the same state for an unknown action', () => {
    const before = initial();
    expect(schedulerReducer(before, { type: 'nonsense' } as unknown as SchedulerAction)).toBe(before);
  });

  it('never mutates the state it was given', () => {
    const before = initial();
    const snapshot = JSON.stringify(before);
    const actions: SchedulerAction[] = [
      { type: 'setView', view: 'month', visibleRange: NEXT_RANGE },
      { type: 'setFilters', filters: { search: 'x' } },
      { type: 'setSelectionEvent', eventId: 'e1' },
      { type: 'setDensity', density: 'compact' },
      dragging(),
      { type: 'pushError', error: error('create', 'boom') },
    ];
    for (const action of actions) schedulerReducer(before, action);
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it('leaves untouched slices referentially identical', () => {
    const before = initial();
    const after = schedulerReducer(before, { type: 'setDensity', density: 'compact' });
    expect(after).not.toBe(before);
    expect(after.selection).toBe(before.selection);
    expect(after.popover).toBe(before.popover);
    expect(after.drag).toBe(before.drag);
    expect(after.errors).toBe(before.errors);
  });
});
