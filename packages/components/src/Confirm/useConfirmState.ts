import { useSyncExternalStore } from 'react';

import { ConfirmStore, type ConfirmState } from './ConfirmStore';

/**
 * React boundary into the confirm store. `useSyncExternalStore` is the React 18 primitive
 * built exactly for this case (external event-emitter → component render) — it batches
 * correctly, resolves the SSR-snapshot vs hydrated-state hazard, and avoids the tearing
 * issues that a naive `useState + subscribe` pattern would introduce under concurrent
 * rendering.
 *
 * The snapshot returns the same object identity until the store actually changes, so the
 * `<ConfirmProvider>` host only re-renders when the active confirm mutates.
 */
const EMPTY_STATE: ConfirmState = { current: null };

function getSnapshot(): ConfirmState {
  return ConfirmStore.getState();
}

function getServerSnapshot(): ConfirmState {
  // SSR: the confirm is always closed at render time (no one has called `confirm.display()`
  // yet). Hydration matches this because the client also starts empty.
  return EMPTY_STATE;
}

export function useConfirmState(): ConfirmState {
  return useSyncExternalStore(ConfirmStore.subscribe, getSnapshot, getServerSnapshot);
}