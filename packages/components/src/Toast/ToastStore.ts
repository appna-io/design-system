import type { ReactNode } from 'react';

import type { ToastIntent, ToastItem, ToastOptions } from './Toast.types';

/**
 * Module-level event emitter that powers the imperative `toast(…)` API. **No React imports.**
 * That single constraint is why the facade works from any JavaScript context — a fetch
 * interceptor, a service-worker callback, a Zustand action, the global error handler. Toaster
 * subscribes via the React boundary in `useToastQueue`; everything else is plain data.
 *
 * Dedup-by-id semantics match Sonner / react-hot-toast: calling `add({ id: 'save' })` twice
 * doesn't append, it updates the existing record in place (preserving `createdAt` so timer math
 * stays stable). This is the contract `toast.promise` relies on — it adds a `loading` toast,
 * then `update()`s it to `success` / `error` when the promise settles.
 */

type Listener = (state: ToastState) => void;

export interface ToastState {
  toasts: ToastItem[];
}

/**
 * The single subset of `ToastOptions` the store needs in addition to `title` + `intent`. The
 * facade resolves defaults (duration, dismissible) before calling `add`, keeping the store
 * thin.
 */
export interface ToastAddInput extends ToastOptions {
  title: ReactNode;
  intent: ToastIntent;
}

let state: ToastState = { toasts: [] };
const listeners = new Set<Listener>();

let idSeed = 0;
function generateId(): string {
  // Module-local monotonic id. Not cryptographic — toasts don't need RFC4122 strength, and we
  // want to avoid a `crypto` dependency in non-browser contexts (e.g. SSR rendering, Edge
  // runtime). Time-prefix prevents collisions across SSR + hydration of two separate Toaster
  // instances mounted in the same window in fast-refresh.
  idSeed += 1;
  return `t_${Date.now().toString(36)}_${idSeed.toString(36)}`;
}

function emit(): void {
  // Listeners is iterated by `useSyncExternalStore`'s `getSnapshot` polling, so we don't need
  // to defer to microtask — the React scheduler batches the resulting renders.
  listeners.forEach((listener) => listener(state));
}

export const ToastStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getState(): ToastState {
    return state;
  },

  add(input: ToastAddInput): string {
    const { id: explicitId, title, intent, ...rest } = input;
    const id = explicitId ?? generateId();
    const existing = state.toasts.find((t) => t.id === id);

    if (existing) {
      state = {
        toasts: state.toasts.map((t) =>
          t.id === id
            ? mergeItem(t, { title, intent, ...rest })
            : t,
        ),
      };
    } else {
      const next: ToastItem = {
        id,
        title,
        intent,
        duration: rest.duration ?? 5000,
        dismissible: rest.dismissible ?? true,
        createdAt: Date.now(),
        ...(rest.description !== undefined ? { description: rest.description } : {}),
        ...(rest.icon !== undefined ? { icon: rest.icon } : {}),
        ...(rest.action !== undefined ? { action: rest.action } : {}),
        ...(rest.cancel !== undefined ? { cancel: rest.cancel } : {}),
        ...(rest.onDismiss !== undefined ? { onDismiss: rest.onDismiss } : {}),
        ...(rest.onAutoClose !== undefined ? { onAutoClose: rest.onAutoClose } : {}),
        ...(rest.variant !== undefined ? { variant: rest.variant } : {}),
      };
      state = { toasts: [...state.toasts, next] };
    }

    emit();
    return id;
  },

  dismiss(id?: string): void {
    if (id === undefined) {
      if (state.toasts.length === 0) return;
      state = { toasts: [] };
      emit();
      return;
    }
    const next = state.toasts.filter((t) => t.id !== id);
    if (next.length === state.toasts.length) return;
    state = { toasts: next };
    emit();
  },

  update(id: string, patch: Partial<ToastOptions> & { title?: ReactNode; intent?: ToastIntent }): void {
    const exists = state.toasts.some((t) => t.id === id);
    if (!exists) return;
    state = {
      toasts: state.toasts.map((t) =>
        t.id === id ? mergeItem(t, patch) : t,
      ),
    };
    emit();
  },

  /**
   * Test helper. Not exported from the package's public surface — but the store is a module
   * singleton, so unit tests need a reset hook to keep cases independent.
   */
  __reset(): void {
    state = { toasts: [] };
    idSeed = 0;
    emit();
  },
};

/**
 * Merge a patch into an existing item. Preserves `id` and `createdAt` (timer math depends on
 * `createdAt` staying stable across updates).
 */
function mergeItem(
  current: ToastItem,
  patch: Partial<ToastOptions> & { title?: ReactNode; intent?: ToastIntent },
): ToastItem {
  // Strip `undefined`s so a patch like `{ description: undefined }` doesn't accidentally wipe
  // out an existing description. The store treats `undefined` as "keep current".
  const merged: ToastItem = { ...current };
  if (patch.title !== undefined) merged.title = patch.title;
  if (patch.intent !== undefined) merged.intent = patch.intent;
  if (patch.description !== undefined) merged.description = patch.description;
  if (patch.icon !== undefined) merged.icon = patch.icon;
  if (patch.action !== undefined) merged.action = patch.action;
  if (patch.cancel !== undefined) merged.cancel = patch.cancel;
  if (patch.duration !== undefined) merged.duration = patch.duration;
  if (patch.dismissible !== undefined) merged.dismissible = patch.dismissible;
  if (patch.onDismiss !== undefined) merged.onDismiss = patch.onDismiss;
  if (patch.onAutoClose !== undefined) merged.onAutoClose = patch.onAutoClose;
  if (patch.variant !== undefined) merged.variant = patch.variant;
  return merged;
}