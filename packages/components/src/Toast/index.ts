/**
 * Public surface for `<Toaster>` + `toast(…)` + `<Toast>`.
 *
 * The trio splits responsibilities cleanly:
 *
 *   `Toaster`  — singleton root mounted once at the app shell.
 *   `toast`    — imperative facade callers reach for from anywhere.
 *   `Toast`    — the rendered single-toast component, exposed for rare inline use.
 */
export { Toaster } from './Toaster';
export { Toast } from './Toast';
export { toast } from './toastApi';

export type {
  ToastApi,
  ToastButton,
  ToastIntent,
  ToastOptions,
  ToastPosition,
  ToastPromiseMessages,
  ToastProps,
  ToastVariant,
  ToasterProps,
} from './Toast.types';
