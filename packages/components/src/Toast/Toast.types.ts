import type { CSSProperties, ReactNode } from 'react';
import type { Sx } from '@apx-ui/engine';

/**
 * Semantic intent of a toast. Drives the leading icon, `role` (`alert` for `error`, `status`
 * otherwise), and the color used for the `outline` / `soft` variant borders + tints. The
 * `loading` intent has no color spotlight — it just renders the inline spinner glyph.
 */
export type ToastIntent = 'neutral' | 'success' | 'error' | 'warning' | 'info' | 'loading';

/**
 * Visual chrome. Orthogonal to `intent`.
 *
 *   `solid`   — Default minimal style: paper background, neutral 1-px border. Subtle.
 *   `outline` — Paper background, **colored** border per intent. Quietly intent-led.
 *   `soft`    — Intent-tinted background + matching border. Loud; opt-in via `Toaster richColors`.
 */
export type ToastVariant = 'solid' | 'outline' | 'soft';

/**
 * Where the Toaster anchors its region. Physical (not logical) — toast positions are spatial,
 * not direction-dependent, so the same screen corner is used in LTR and RTL.
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Action / cancel button on a toast. */
export interface ToastButton {
  label: ReactNode;
  onClick: () => void;
  /** When `true` (default), clicking the button auto-dismisses the toast. */
  dismissOnClick?: boolean;
}

/**
 * Options accepted by every `toast(…)` / `toast.success(…)` / etc. call. `intent` and `title`
 * are slotted in by the facade based on which alias was called; everything else is passthrough.
 */
export interface ToastOptions {
  /**
   * Stable dedup key. If a toast with this `id` is already in the queue, the new call updates it
   * in place (preserves `createdAt`) instead of appending. Without `id`, a uuid is generated.
   */
  id?: string;
  /** Body text rendered under the title. */
  description?: ReactNode;
  /** Override the per-intent icon. Pass `false` to render no icon. */
  icon?: ReactNode | false;
  /** Right-side primary button (e.g. "Undo"). */
  action?: ToastButton;
  /** Secondary "X"-style button rendered alongside `action`. Distinct from the close `×`. */
  cancel?: ToastButton;
  /**
   * Auto-dismiss timeout in ms. `0` keeps the toast persistent until explicitly dismissed.
   * Falls back to `Toaster.duration` when omitted.
   */
  duration?: number;
  /** When `false`, hides the close `×` button **and** disables swipe-to-dismiss for the toast. */
  dismissible?: boolean;
  /** Fired when the toast leaves the queue via close-button / programmatic dismiss / cancel. */
  onDismiss?: (id: string) => void;
  /** Fired when the toast leaves the queue because its auto-dismiss timer expired. */
  onAutoClose?: (id: string) => void;
  /** Override the visual variant. Defaults to `Toaster.richColors ? 'soft' : 'solid'`. */
  variant?: ToastVariant;
}

/**
 * The shape stored inside `ToastStore`. Consumers never construct these directly; the facade
 * normalizes the public options into this form.
 */
export interface ToastItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  intent: ToastIntent;
  icon?: ReactNode | false;
  action?: ToastButton;
  cancel?: ToastButton;
  duration: number;
  dismissible: boolean;
  onDismiss?: ((id: string) => void) | undefined;
  onAutoClose?: ((id: string) => void) | undefined;
  /** Wall-clock ms at which the toast was first added (preserved across `update`). */
  createdAt: number;
  /** Optional per-toast variant override; falls through to the Toaster's variant when unset. */
  variant?: ToastVariant;
}

/**
 * Public surface of the imperative `toast` API. Aliases (`toast.success`, etc.) are
 * pre-bound with their intent. `toast.promise` returns the original promise for awaiting.
 */
export interface ToastApi {
  (title: ReactNode, opts?: ToastOptions): string;
  success: (title: ReactNode, opts?: ToastOptions) => string;
  error: (title: ReactNode, opts?: ToastOptions) => string;
  warning: (title: ReactNode, opts?: ToastOptions) => string;
  info: (title: ReactNode, opts?: ToastOptions) => string;
  loading: (title: ReactNode, opts?: ToastOptions) => string;
  /**
   * Map an async operation onto a 3-state toast. Returns the original promise so callers can
   * `await` it. The loading toast is persistent (`duration: 0`); on settle the same toast is
   * updated to success / error with the Toaster's default duration.
   */
  promise: <T>(p: Promise<T>, msgs: ToastPromiseMessages<T>, opts?: ToastOptions) => Promise<T>;
  /** Dismiss a specific toast. Omit the id to dismiss every toast in the queue. */
  dismiss: (id?: string) => void;
  /** Patch an existing toast in place (no-op when no toast with that id is in the queue). */
  update: (id: string, patch: Partial<ToastOptions> & { title?: ReactNode; intent?: ToastIntent }) => void;
}

/**
 * Messages payload for `toast.promise`. Each entry is either a static node or a function that
 * receives the resolved value (for `success`) or the rejection reason (for `error`).
 */
export interface ToastPromiseMessages<T> {
  loading: ReactNode;
  success: ReactNode | ((data: T) => ReactNode);
  error: ReactNode | ((err: unknown) => ReactNode);
}

/**
 * Props for `<Toaster />` — the singleton root. Placed once in the app shell.
 */
export interface ToasterProps {
  /** Anchor for the toast region. @default 'bottom-right' */
  position?: ToastPosition;
  /** Cap on simultaneously-visible toasts. Older toasts queue behind. @default 3 */
  max?: number;
  /** Gap (px) between toasts in the stack. @default 8 */
  gap?: number;
  /**
   * When `true`, stack always renders expanded. When `false` (default), the stack is collapsed
   * (cards stacked) until the user hovers the region or focuses a toast, then it expands.
   * @default false
   */
  expand?: boolean;
  /** Default auto-dismiss in ms. Each `toast()` call can override via `duration`. @default 5000 */
  duration?: number;
  /** Show the close `×` on every toast by default. @default false */
  closeButton?: boolean;
  /** Make `soft` (intent-tinted) the default variant for every toast. @default false */
  richColors?: boolean;
  /** Pause auto-dismiss timers while the pointer is over the region. @default true */
  pauseOnHover?: boolean;
  /** Pause auto-dismiss timers while the tab loses focus / visibility. @default true */
  pauseOnFocusLoss?: boolean;
  /**
   * Portal target. `undefined` → `document.body`. `null` → "not yet ready" (renders nothing).
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** Accessible label for the live region. @default 'Notifications' */
  'aria-label'?: string;
}

/**
 * Props for the rendered single `<Toast />`. Used internally by Toaster, but also valid for
 * one-off inline usage when the imperative queue isn't the right fit.
 */
export interface ToastProps {
  /** The toast item to render. */
  item: ToastItem;
  /** Resolved variant (Toaster-level default applied). */
  variant: ToastVariant;
  /** Effective duration (Toaster-level default applied; `0` is persistent). */
  duration: number;
  /** Whether the close `×` should render. */
  closeButton: boolean;
  /** Whether the toast's timer is currently paused (hover / focus-loss / promise pending). */
  paused: boolean;
  /** Anchor side — drives enter/exit slide direction. */
  position: ToastPosition;
  /** Called when the user explicitly dismisses (close button / action with dismissOnClick). */
  onDismiss: (id: string) => void;
  /** Called when the toast's timer expires. */
  onAutoClose: (id: string) => void;
  /** Override className on the toast content. */
  className?: string;
  /** Override inline style on the toast content. */
  style?: CSSProperties;
  /** Theme-aware inline style. */
  sx?: Sx;
}
