import type { ConfirmDisplayOptions, ConfirmItem } from './Confirm.types';

/**
 * Module-level event emitter that powers the imperative `confirm.display(...)` API. **No React
 * imports.** That single constraint is why the facade works from any JavaScript context — a
 * fetch interceptor, a service-worker callback, a Zustand action. `<ConfirmProvider>`
 * subscribes via the React boundary in `useConfirmState`; everything else is plain data.
 *
 * Unlike Toast (queue) and like SplashScreen (single-slot), the confirm is **single-slot**.
 * Only one dialog can be visible at a time. Calling `display()` while a dialog is already open
 * resolves the previous promise with `false` (treating the unattended dialog as cancelled)
 * before installing the new record. This matches how native `window.confirm` would have
 * blocked the second call — but without the UI freeze.
 */

type Listener = (state: ConfirmState) => void;

export interface ConfirmState {
  /** The currently visible confirm, or `null` when nothing is open. */
  current: ConfirmItem | null;
}

const INITIAL_STATE: ConfirmState = { current: null };
let state: ConfirmState = INITIAL_STATE;
const listeners = new Set<Listener>();

let idSeed = 0;
function generateId(): string {
  // Module-local monotonic id. Not cryptographic — confirm records don't need RFC4122
  // strength, and we want to avoid a `crypto` dependency in non-browser contexts (SSR / Edge).
  // Time-prefix prevents collisions across SSR + hydration of two separate hosts mounted in
  // the same window during fast-refresh.
  idSeed += 1;
  return `confirm_${Date.now().toString(36)}_${idSeed.toString(36)}`;
}

function emit(): void {
  // Listeners is iterated by `useSyncExternalStore`'s `getSnapshot` polling, so we don't need
  // to defer to microtask — the React scheduler batches the resulting renders.
  listeners.forEach((listener) => listener(state));
}

export const ConfirmStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getState(): ConfirmState {
    return state;
  },

  /**
   * Open the confirm dialog. Returns the promise the facade hands back to the caller and the
   * generated id so the host can route resolve / cancel back to the right record.
   *
   * If a dialog is already open, its pending promise is resolved with `false` (treating the
   * displaced dialog as cancelled) before the new record takes over. This mirrors how a
   * blocking `window.confirm()` would have prevented the second call from running until the
   * first settled — except here the displacement happens synchronously and the caller gets
   * a fresh promise.
   */
  open(input: ConfirmDisplayOptions = {}): { id: string; promise: Promise<boolean> } {
    const existing = state.current;
    if (existing) {
      // Resolve the predecessor with `false` so its `await` site unblocks. Swallow any throw
      // from the resolver — a misbehaving consumer shouldn't crash the host.
      try {
        existing.resolve(false);
      } catch {
        /* swallow */
      }
    }

    const id = generateId();
    let resolveFn: (value: boolean) => void = () => undefined;
    const promise = new Promise<boolean>((resolve) => {
      resolveFn = resolve;
    });

    const next: ConfirmItem = {
      ...input,
      id,
      resolve: resolveFn,
      createdAt: Date.now(),
    };
    state = { current: next };
    emit();
    return { id, promise };
  },

  /**
   * Resolve the active dialog with the given outcome and tear it down. No-op when nothing is
   * open. When `id` is provided, only resolves if it matches the active record (used by the
   * host to defend against stale event handlers firing after a new dialog has taken over).
   */
  close(outcome: boolean, id?: string): void {
    const active = state.current;
    if (!active) return;
    if (id !== undefined && active.id !== id) return;
    try {
      active.resolve(outcome);
    } catch {
      /* swallow */
    }
    state = { current: null };
    emit();
  },

  isOpen(): boolean {
    return state.current != null;
  },

  /**
   * Test helper. Not exported from the package's public surface — but the store is a module
   * singleton, so unit tests need a reset hook to keep cases independent.
   */
  __reset(): void {
    // Resolve any pending dialog with `false` so awaiting tests don't hang on reset.
    const active = state.current;
    if (active) {
      try {
        active.resolve(false);
      } catch {
        /* swallow */
      }
    }
    state = INITIAL_STATE;
    idSeed = 0;
    emit();
  },
};