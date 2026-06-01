import type { CSSProperties, ReactNode } from 'react';
import type { Sx } from '@apx-ui/engine';

/**
 * Semantic variant of the confirm dialog. Drives the leading icon, the confirm button color,
 * and the (subtle) header tint. Maps to the DS palette as follows:
 *
 * | Variant   | Palette role | Default icon              | Confirm button color |
 * | --------- | ------------ | ------------------------- | -------------------- |
 * | `default` | `neutral`    | `MessageCircle`           | `primary`            |
 * | `info`    | `info`       | `Info`                    | `info`               |
 * | `success` | `success`    | `CheckCircle2`            | `success`            |
 * | `warning` | `warning`    | `AlertTriangle`           | `warning`            |
 * | `error`   | `danger`     | `AlertOctagon`            | `danger`             |
 *
 * `default` is the no-emphasis fallback — pick this when the dialog asks an ordinary question
 * that isn't tied to any specific status feel ("Save changes?", "Apply preset?").
 */
export type ConfirmVariant = 'default' | 'info' | 'success' | 'warning' | 'error';

/**
 * The shape `confirm.display(…)` accepts. Everything is optional — call with `{}` and you'll
 * get a minimal "Are you sure?" / "Confirm" / "Cancel" dialog using the `default` variant.
 */
export interface ConfirmDisplayOptions {
  /**
   * Semantic variant. Drives the leading icon, the confirm button color, and the header tint.
   * @default 'default'
   */
  variant?: ConfirmVariant | undefined;

  /**
   * Whether to render the leading icon above the title. The icon itself is picked from the
   * variant (see `ConfirmVariant`); pass `false` to suppress it entirely.
   * @default true
   */
  showIcon?: boolean | undefined;

  /**
   * Override the auto-picked variant icon. Pass any `ReactNode` — typically a lucide-react
   * `<Icon />` or an inline `<svg>`. Ignored when `showIcon` is `false`.
   */
  icon?: ReactNode;

  /**
   * Headline question / statement, rendered as the dialog's `h2` and wired into the dialog's
   * `aria-labelledby`. Defaults to `'Are you sure?'` so the dialog stays usable even when the
   * caller forgot to pass a title.
   */
  title?: ReactNode;

  /**
   * Supporting copy below the title. Wired into the dialog's `aria-describedby` when present.
   */
  description?: ReactNode;

  /**
   * Label on the confirm (primary) button. @default 'Confirm'
   */
  confirmText?: ReactNode;

  /**
   * Label on the cancel (secondary) button. @default 'Cancel'
   */
  cancelText?: ReactNode;

  /**
   * When `true`, pressing Escape resolves the dialog with `false`. @default true
   */
  closeOnEscape?: boolean | undefined;

  /**
   * When `true`, clicking the backdrop resolves the dialog with `false`. @default true
   */
  closeOnBackdropClick?: boolean | undefined;

  /**
   * Theme-aware inline style object applied to the dialog surface.
   */
  sx?: Sx | undefined;

  /**
   * Plain inline style applied to the dialog surface. Merged after `sx`.
   */
  style?: CSSProperties | undefined;

  /**
   * Additional class names merged onto the dialog surface.
   */
  className?: string | undefined;
}

/**
 * Internal record shape stored by `ConfirmStore`. Carries the resolver alongside the visual
 * options so the host can call it on confirm / cancel / Escape / backdrop click.
 */
export interface ConfirmItem extends ConfirmDisplayOptions {
  /** Stable identifier for the active dialog. */
  id: string;
  /** Resolver for the promise returned by `confirm.display(...)`. */
  resolve: (value: boolean) => void;
  /** Monotonic timestamp used by motion / focus reset when the dialog identity flips. */
  createdAt: number;
}

/**
 * The public imperative facade. Callable via `confirm.display(options)` — mirrors the
 * `splash(...)` / `toast(...)` family but returns a `Promise<boolean>` that resolves on user
 * action instead of running with side-effecting callbacks.
 *
 * @example
 *   import { confirm } from '@apx-ui/ds';
 *
 *   const ok = await confirm.display({
 *     variant: 'error',
 *     title: 'Delete account?',
 *     description: 'This is permanent.',
 *     confirmText: 'Yes, delete',
 *   });
 *   if (ok) deleteAccount();
 */
export interface ConfirmApi {
  /** Open the confirm dialog. Resolves with `true` (confirm) or `false` (cancel / dismiss). */
  display: (options?: ConfirmDisplayOptions) => Promise<boolean>;

  /** Variant shortcut — equivalent to `confirm.display({ variant: 'info', ... })`. */
  info: (options?: Omit<ConfirmDisplayOptions, 'variant'>) => Promise<boolean>;
  /** Variant shortcut for `success`. */
  success: (options?: Omit<ConfirmDisplayOptions, 'variant'>) => Promise<boolean>;
  /** Variant shortcut for `warning`. */
  warning: (options?: Omit<ConfirmDisplayOptions, 'variant'>) => Promise<boolean>;
  /** Variant shortcut for `error`. */
  error: (options?: Omit<ConfirmDisplayOptions, 'variant'>) => Promise<boolean>;

  /**
   * Dismiss the active confirm without user input. Resolves the pending promise with `false`.
   * No-op when nothing is open.
   */
  cancel: () => void;

  /** Returns `true` if a confirm dialog is currently visible. */
  isOpen: () => boolean;
}

/**
 * Props for the singleton `<ConfirmProvider>` host. Mount **once** at the app root next to
 * `<ThemeProvider>` so every `confirm.display(...)` across the app feeds into this instance.
 */
export interface ConfirmProviderProps {
  /**
   * Default options shallow-merged into every `confirm.display(...)` call unless overridden at
   * the call site. Useful for pinning a `confirmText: 'OK'` / `cancelText: 'Cancel'` policy in
   * a single place per app.
   */
  defaultOptions?: ConfirmDisplayOptions | undefined;
  /**
   * Mount target for the dialog portal. Defaults to `document.body`. Pass an element to scope
   * confirms inside a specific subtree (e.g. an Electron window root).
   */
  portalContainer?: HTMLElement | null | undefined;
}