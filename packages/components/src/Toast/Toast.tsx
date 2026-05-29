'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, type ReactElement } from 'react';

import { toastMotion } from './Toast.motion';
import {
  toastActionRecipe,
  toastCloseRecipe,
  toastContentRecipe,
} from './Toast.recipe';
import { ToastIcon } from './ToastIcon';
import type { ToastIntent, ToastProps } from './Toast.types';

/**
 * The rendered single toast. `<Toaster>` wires per-toast props (variant, duration, paused)
 * from its own props + queue state; this component is responsible for:
 *
 *  - **Auto-dismiss timer** — respects `paused` (driven by Toaster's hover / focus-loss /
 *    Promise-pending state). Pausing saves remaining time; resuming installs a fresh timer
 *    with that remainder.
 *  - **Live-region semantics** — `role="status"` for non-error intents, `role="alert"` for
 *    `error`. `aria-atomic` so screen readers re-announce the whole toast when `update` patches
 *    the title.
 *  - **Action / cancel / close** — keyboard-focusable buttons. Action defaults to dismissing
 *    on click (consumer can override with `dismissOnClick: false`).
 *  - **Motion** — enter / exit slide tuned to the Toaster's `position` (top → from above,
 *    bottom → from below).
 *
 * The component is intentionally **not** memoized — the Toaster slices the queue and React
 * reconciles by `key={id}`, so identity already matches the queue. Memoizing here would just
 * add an extra equality check per render.
 */

const ROLE_BY_INTENT: Record<ToastIntent, 'status' | 'alert'> = {
  neutral: 'status',
  success: 'status',
  warning: 'status',
  info: 'status',
  loading: 'status',
  // `alert` is more disruptive — reserved for `error` only so screen readers preempt the
  // current narration when the user needs to know something failed.
  error: 'alert',
};

export function Toast({
  item,
  variant,
  duration,
  closeButton,
  paused,
  position,
  onDismiss,
  onAutoClose,
  className,
  style,
  sx,
}: ToastProps): ReactElement {
  const {
    id,
    title,
    description,
    intent,
    icon,
    action,
    cancel,
    dismissible,
  } = item;

  // The effective duration: `item.duration` overrides the Toaster prop. `0` is persistent.
  // `loading` intent is also forced persistent because the promise-update flow drives its exit.
  const effectiveDuration = item.duration ?? duration;
  const persistent = effectiveDuration === 0 || intent === 'loading';

  // Remaining-time bookkeeping. We don't use plain `setTimeout` because pause-on-hover needs
  // to *resume* with the leftover time, not restart the full timer. The pattern:
  //   - On mount / unpause: install timer for `remainingRef`. Store the start timestamp.
  //   - On pause: subtract elapsed from remaining, store. Clear timer.
  //   - On `update` (via `item.duration` or `title` change): not auto-extended; the consumer
  //     calls `toast.update(id, …)` which the store handles; the timer here keeps ticking.
  const remainingRef = useRef<number>(effectiveDuration);
  const startedAtRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const fireAutoClose = useCallback(() => {
    onAutoClose(id);
  }, [id, onAutoClose]);

  useEffect(() => {
    if (persistent) return undefined;
    if (paused) {
      // Capture the time already spent in the visible state and stop the timer.
      const elapsed = Date.now() - startedAtRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      clear();
      return undefined;
    }
    // Resuming (or first install). Start a fresh timer for whatever's left.
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(fireAutoClose, remainingRef.current);
    return clear;
  }, [paused, persistent, clear, fireAutoClose]);

  // When the consumer mutates `item.duration` via `toast.update`, refresh the remaining time
  // and restart the visible-state clock. Skip when the item is persistent (consumer typically
  // patches duration to 0 alongside a loading→success transition).
  useEffect(() => {
    remainingRef.current = effectiveDuration;
    startedAtRef.current = Date.now();
    // Eslint exhaustive-deps would want `effectiveDuration` listed here; that's correct — we
    // intentionally reset the local clock when the *duration value* changes, not on every
    // render.
  }, [effectiveDuration]);

  // Ref to the close button so we can `.focus()` it when the toast gains keyboard focus.
  const closeRef = useRef<HTMLButtonElement>(null);

  const { className: contentClass, style: contentStyle } = useThemedClasses({
    recipe: toastContentRecipe,
    componentName: 'Toast',
    slot: 'content',
    props: { variant, intent, className, sx, style },
  });

  const { className: actionPrimaryClass } = useThemedClasses({
    recipe: toastActionRecipe,
    componentName: 'Toast',
    slot: 'action',
    props: { role: 'primary' },
  });

  const { className: actionCancelClass } = useThemedClasses({
    recipe: toastActionRecipe,
    componentName: 'Toast',
    slot: 'action',
    props: { role: 'cancel' },
  });

  const { className: closeClass } = useThemedClasses({
    recipe: toastCloseRecipe,
    componentName: 'Toast',
    slot: 'close',
    props: {},
  });

  const ariaRole = ROLE_BY_INTENT[intent];

  const motionProps = toastMotion(position);

  const handleAction = (): void => {
    action?.onClick();
    if (action?.dismissOnClick ?? true) {
      clear();
      onDismiss(id);
    }
  };

  const handleCancel = (): void => {
    cancel?.onClick();
    if (cancel?.dismissOnClick ?? true) {
      clear();
      onDismiss(id);
    }
  };

  const handleClose = (): void => {
    clear();
    onDismiss(id);
  };

  // Motion's `MotionStyle` rejects the `CSSProperties` shape under strict optional-property
  // checks; same cast pattern Alert + Modal use.
  const motionExtraProps: Record<string, unknown> = {
    ...(contentStyle ? { style: contentStyle } : {}),
  };

  return (
    <motion.li
      key={id}
      // `tabIndex={0}` keeps the toast in the natural Tab order — users can reach toasts by
      // tabbing forward through the page (Sonner / GitHub convention) and the Toaster's F8
      // shortcut becomes a fast-path rather than the only path. Arrow-key navigation inside
      // the region uses `.focus()` programmatically; both modes share the same tab stop.
      tabIndex={0}
      role={ariaRole}
      aria-atomic="true"
      data-toast=""
      data-toast-id={id}
      data-intent={intent}
      data-variant={variant}
      className={contentClass}
      layout
      {...motionProps}
      {...motionExtraProps}
    >
      <ToastIcon intent={intent} override={icon} />

      <div className="min-w-0 flex-1">
        <div className="font-medium leading-snug">{title}</div>
        {description !== undefined ? (
          <div className="mt-1 text-fg-muted leading-relaxed">{description}</div>
        ) : null}

        {action !== undefined || cancel !== undefined ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {action !== undefined ? (
              <button
                type="button"
                onClick={handleAction}
                className={actionPrimaryClass}
              >
                {action.label}
              </button>
            ) : null}
            {cancel !== undefined ? (
              <button
                type="button"
                onClick={handleCancel}
                className={actionCancelClass}
              >
                {cancel.label}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {closeButton && dismissible ? (
        <button
          ref={closeRef}
          type="button"
          aria-label="Dismiss notification"
          onClick={handleClose}
          className={closeClass}
        >
          <X />
        </button>
      ) : null}
    </motion.li>
  );
}

Toast.displayName = 'Toast';
