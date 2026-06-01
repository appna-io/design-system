import { useSyncExternalStore } from 'react';

import { SplashStore, type SplashState } from './SplashStore';

/**
 * React boundary into the splash store. `useSyncExternalStore` is the React 18 primitive built
 * exactly for this case (external event-emitter → component render) — it batches correctly,
 * resolves the SSR-snapshot vs hydrated-state hazard, and avoids the tearing issues that a
 * naive `useState + subscribe` pattern would introduce under concurrent rendering.
 *
 * The snapshot returns the same object identity until the store actually changes, so the
 * `<SplashProvider>` host only re-renders when the active splash mutates.
 */
const EMPTY_STATE: SplashState = { current: null };

function getSnapshot(): SplashState {
  return SplashStore.getState();
}

function getServerSnapshot(): SplashState {
  // SSR: the splash is always inactive at render time (no one has called `splash.show()`
  // yet). Hydration matches this because the client also starts empty.
  return EMPTY_STATE;
}

export function useSplashState(): SplashState {
  return useSyncExternalStore(SplashStore.subscribe, getSnapshot, getServerSnapshot);
}