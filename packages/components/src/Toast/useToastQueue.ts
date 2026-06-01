import { useSyncExternalStore } from 'react';

import { ToastStore, type ToastState } from './ToastStore';

/**
 * React boundary into the toast store. `useSyncExternalStore` is the React 18 primitive built
 * exactly for this case (external event-emitter → component render) — it batches correctly,
 * resolves the SSR-snapshot vs hydrated-state hazard, and avoids the tearing issues that a
 * naive `useState + subscribe` pattern would introduce under concurrent rendering.
 *
 * The snapshot returns the same object identity until the store actually changes, so the
 * Toaster's `toasts.slice(-max)` only re-runs when the queue mutates.
 */
const EMPTY_STATE: ToastState = { toasts: [] };

function getSnapshot(): ToastState {
  return ToastStore.getState();
}

function getServerSnapshot(): ToastState {
  // SSR: the queue is always empty at render time (no one has called `toast()` yet). Hydration
  // matches this because the client also starts with an empty queue.
  return EMPTY_STATE;
}

export function useToastQueue(): ToastState {
  return useSyncExternalStore(ToastStore.subscribe, getSnapshot, getServerSnapshot);
}