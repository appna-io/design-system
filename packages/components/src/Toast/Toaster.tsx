'use client';

import { Portal } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { AnimatePresence } from 'motion/react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';

import { toastRegionRecipe } from './Toast.recipe';
import { ToastStore } from './ToastStore';
import type {
  ToastItem,
  ToastPosition,
  ToastVariant,
  ToasterProps,
} from './Toast.types';
import { Toast } from './Toast';
import { useToastQueue } from './useToastQueue';

/**
 * Singleton root for the imperative toast queue. Mount **once** at the app root — every
 * `toast(…)` call across the app feeds into this instance via the module-level `ToastStore`.
 *
 * Responsibilities the Toaster shoulders (so individual toasts stay dumb):
 *
 *  - **Region semantics** — `<ol role="region" aria-live="polite" aria-label>`. The list is
 *    rendered even when empty so screen readers have a live region to subscribe to. New toasts
 *    append as `<li>` children and the live-region announcer picks them up automatically.
 *  - **Queue clipping** — `toasts.slice(-max)` so older toasts queue silently behind. The full
 *    history is still in the store; only the visible window is rendered.
 *  - **Pause coordinator** — owns the boolean `paused` flag derived from
 *    `pauseOnHover` (pointer over region) and `pauseOnFocusLoss` (`document.visibilityState`).
 *    Toasts receive this flag and pause their own timers.
 *  - **F8 focus shortcut** — global keyboard listener that focuses the toast region when the
 *    user presses `F8`. Standard platform convention (Slack, GitHub, Sonner). Inside the
 *    region, arrow keys cycle between toast `<li>`s and `Esc` dismisses the focused one.
 *  - **Portal** — defaults to `document.body`; consumer can override.
 *
 *  Renderer guarantees: this is the **only** place that touches DOM globals (focus, visibility,
 *  keydown). Toasts themselves stay pure React.
 */
export function Toaster(props: ToasterProps): ReactElement {
  const {
    position = 'bottom-right',
    max = 3,
    gap = 8,
    expand = false,
    duration = 5000,
    closeButton = false,
    richColors = false,
    pauseOnHover = true,
    pauseOnFocusLoss = true,
    portalContainer,
    'aria-label': ariaLabel = 'Notifications',
  } = props;

  const { toasts } = useToastQueue();

  // Pause state — derived from hover + focus-loss + manual hold. We track each input
  // separately and `paused = hovering || hidden`. The `expand` flag also forces visual expand
  // when hovering or focused, but doesn't affect timer pause (that's a separate concern).
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  const regionRef = useRef<HTMLOListElement>(null);

  // Track tab visibility. `document.visibilityState === 'hidden'` covers both other-tab and
  // window-minimized cases. Only attach the listener when the consumer opted in.
  useEffect(() => {
    if (!pauseOnFocusLoss) return undefined;
    if (typeof document === 'undefined') return undefined;
    const onChange = (): void => {
      setHidden(document.visibilityState === 'hidden');
    };
    onChange();
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, [pauseOnFocusLoss]);

  // F8 focuses the region. The region itself isn't normally focusable, so we set `tabIndex=-1`
  // and call `.focus()` programmatically — that fires `onFocus` and the user can then
  // arrow-cycle through the toasts.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'F8') return;
      const region = regionRef.current;
      if (!region) return;
      // First press → focus the region itself. Subsequent arrow keys are handled by the
      // region's own onKeyDown handler below.
      event.preventDefault();
      region.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Resolved stack direction — top-anchored stacks render newest at the bottom (`down`);
  // bottom-anchored stacks render newest at the top (`up`). Matches user expectation that the
  // newest toast appears closest to where the eye lands when reading the screen edge.
  const stackDirection: 'up' | 'down' = position.startsWith('bottom-') ? 'up' : 'down';

  const { className: regionClass, style: regionStyle } = useThemedClasses({
    recipe: toastRegionRecipe,
    componentName: 'Toast',
    slot: 'region',
    props: { position, stackDirection },
  });

  // Cap the visible window. `slice(-max)` keeps the *newest* `max` toasts — older ones are
  // dropped from rendering, matching the natural reading order on bottom-anchored regions.
  const visible = useMemo<ToastItem[]>(() => toasts.slice(-max), [toasts, max]);

  const paused = (pauseOnHover && hovering) || hidden;

  // When `expand={true}`, we always render expanded; otherwise we expand on hover or when any
  // toast has focus. This is a presentation hint only — the stack gap is `gap` either way.
  const expanded = expand || hovering || hasFocus;

  const handleAutoClose = useCallback((id: string): void => {
    const item = ToastStore.getState().toasts.find((t) => t.id === id);
    item?.onAutoClose?.(id);
    ToastStore.dismiss(id);
  }, []);

  const handleDismiss = useCallback((id: string): void => {
    const item = ToastStore.getState().toasts.find((t) => t.id === id);
    item?.onDismiss?.(id);
    ToastStore.dismiss(id);
  }, []);

  // Arrow-key navigation between toasts when the region is focused. Esc dismisses the focused
  // toast. The pattern matches Sonner / GitHub's toast keyboard model.
  const handleRegionKeyDown = (event: React.KeyboardEvent<HTMLOListElement>): void => {
    const region = regionRef.current;
    if (!region) return;
    const items = Array.from(region.querySelectorAll<HTMLLIElement>('[data-toast]'));
    if (items.length === 0) return;

    const active = document.activeElement as HTMLElement | null;
    const currentIndex = active ? items.findIndex((el) => el === active || el.contains(active)) : -1;

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const dir = event.key === 'ArrowDown' ? 1 : -1;
      const next = currentIndex === -1 ? 0 : Math.max(0, Math.min(items.length - 1, currentIndex + dir));
      items[next]?.focus();
    } else if (event.key === 'Escape' && currentIndex !== -1) {
      const focusedId = items[currentIndex]?.getAttribute('data-toast-id');
      if (focusedId !== null && focusedId !== undefined) {
        event.preventDefault();
        handleDismiss(focusedId);
      }
    }
  };

  // Apply the `gap` prop directly via inline style so consumers can pass any pixel value
  // without us pre-baking a CSS class for it.
  const mergedRegionStyle = {
    ...(regionStyle as React.CSSProperties | undefined),
    gap: `${gap}px`,
  };

  return (
    <Portal container={portalContainer}>
      {/*
        The region is the platform-canonical landing target for toast-keyboard navigation
        (F8 → focus, ArrowUp / ArrowDown to cycle, Esc to dismiss — Slack / GitHub / Sonner
        all converge here). It needs `tabIndex={-1}` so we can programmatically focus it from
        the global F8 handler, and an `onKeyDown` to handle in-region navigation. jsx-a11y's
        no-noninteractive-element-interactions rule flags this because `region` is non-
        interactive in ARIA, but the keyboard model is consumer-expected and the screen-reader
        live-region semantics (aria-live=polite) are unaffected by the focusable wrapper.
      */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <ol
        ref={regionRef}
        tabIndex={-1}
        role="region"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label={ariaLabel}
        data-position={position}
        data-expanded={expanded ? 'true' : 'false'}
        className={regionClass}
        style={mergedRegionStyle}
        onPointerEnter={pauseOnHover ? () => setHovering(true) : undefined}
        onPointerLeave={pauseOnHover ? () => setHovering(false) : undefined}
        onFocus={() => setHasFocus(true)}
        onBlur={(event) => {
          // Only flip back when focus leaves the region entirely — focus moving between
          // toasts (li ↔ li) shouldn't toggle the expanded state.
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setHasFocus(false);
          }
        }}
        onKeyDown={handleRegionKeyDown}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((item) => {
            const resolvedVariant: ToastVariant =
              item.variant ?? (richColors ? 'soft' : 'solid');
            return (
              <Toast
                key={item.id}
                item={item}
                variant={resolvedVariant}
                duration={duration}
                closeButton={closeButton}
                paused={paused}
                position={position as ToastPosition}
                onDismiss={handleDismiss}
                onAutoClose={handleAutoClose}
              />
            );
          })}
        </AnimatePresence>
      </ol>
    </Portal>
  );
}

Toaster.displayName = 'Toaster';
