import type { ReactNode } from 'react';

import { ToastStore } from './ToastStore';
import type {
  ToastApi,
  ToastIntent,
  ToastOptions,
  ToastPromiseMessages,
} from './Toast.types';

/**
 * Public imperative facade. Each alias preserves the same signature as the base callable,
 * differing only in the implicit `intent`.
 *
 * The shape is intentionally `Object.assign(callable, { …aliases })` rather than a class so
 * tree-shaking can drop unused aliases (a consumer that only calls `toast.success` won't pay
 * for `toast.promise`, etc.).
 */
function baseToast(title: ReactNode, opts: ToastOptions = {}): string {
  return ToastStore.add({ title, intent: 'neutral', ...opts });
}

function withIntent(intent: ToastIntent) {
  return (title: ReactNode, opts: ToastOptions = {}): string =>
    ToastStore.add({ title, intent, ...opts });
}

function promiseFn<T>(
  p: Promise<T>,
  msgs: ToastPromiseMessages<T>,
  opts: ToastOptions = {},
): Promise<T> {
  // The loading toast is **persistent** (`duration: 0`) until the promise settles, then
  // updated in place. We keep the same `id` across all three states so consumers can reference
  // the toast through `toast.dismiss(id)` if they need to cancel the user-feedback layer
  // independently of the underlying request.
  const id = ToastStore.add({
    title: msgs.loading,
    intent: 'loading',
    ...opts,
    duration: 0,
  });

  // Detach the chain from the returned promise so a failed `success`/`error` resolver doesn't
  // mutate the user's await result. We propagate the original promise to the caller (matching
  // Sonner) — only the toast-side feedback is decoupled.
  p.then((data) => {
    ToastStore.update(id, {
      title: typeof msgs.success === 'function' ? (msgs.success as (data: T) => ReactNode)(data) : msgs.success,
      intent: 'success',
      ...(opts.duration !== undefined ? { duration: opts.duration } : { duration: 5000 }),
    });
  }).catch((err: unknown) => {
    ToastStore.update(id, {
      title:
        typeof msgs.error === 'function'
          ? (msgs.error as (err: unknown) => ReactNode)(err)
          : msgs.error,
      intent: 'error',
      ...(opts.duration !== undefined ? { duration: opts.duration } : { duration: 5000 }),
    });
  });

  return p;
}

export const toast: ToastApi = Object.assign(baseToast, {
  success: withIntent('success'),
  error: withIntent('error'),
  warning: withIntent('warning'),
  info: withIntent('info'),
  loading: withIntent('loading'),
  promise: promiseFn,
  dismiss: (id?: string): void => ToastStore.dismiss(id),
  update: (
    id: string,
    patch: Partial<ToastOptions> & { title?: ReactNode; intent?: ToastIntent },
  ): void => ToastStore.update(id, patch),
});
