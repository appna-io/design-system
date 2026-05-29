'use client';

import {
  useControllableState,
  useEscapeStack,
  useOutsideClick,
} from '@apx-ui/engine';
import { useCallback, useId, useMemo, useRef } from 'react';
import type { ReactElement, RefCallback } from 'react';

import { PopoverContext } from './PopoverContext';
import type { PopoverContextValue, PopoverProps } from './Popover.types';

/**
 * The compound root. `<Popover>` owns the open / close state and the lifecycle hooks (escape,
 * outside-click, focus-trap activation) so the visual subparts (`Trigger` / `Content` / `Arrow`
 * / `Close`) read from one place via `PopoverContext`.
 *
 * The split between root state and Content visuals matches Radix's contract: the consumer controls
 * "is it open" and "what closes it" at the root, the visual axes (`variant` / `size` / `color` /
 * `placement` / `offset` / `showArrow` / `portalContainer`) sit on `<Popover.Content>` because
 * they're surface-level decisions and Content might want them themed independently.
 *
 * Engine validation notes:
 *
 * - `useEscapeStack({ active: open && closeOnEscape, onEscape })` — `active: open` not
 *   `active: mounted`. AnimatePresence is driven by `open` flipping; if we tied `active` to the
 *   render-tree mount the Esc handler would stay registered through the exit animation and the
 *   second Esc press would close two overlays at once. Same lesson Tooltip documented.
 * - `useOutsideClick({ active: open && closeOnOutsideClick, refs: [trigger, content] })` — the
 *   trigger and the portalled content are both "inside". The hook supports multiple refs
 *   precisely so compound overlays don't have to merge nodes manually.
 * - The trigger ref is a `RefCallback` so the trigger subpart can also wire it through Floating
 *   UI's `setReference` — `usePosition` is read by `<Popover.Content>` but it needs the trigger
 *   element to anchor against. We expose the trigger node via a mutable ref so `useOutsideClick`
 *   can check `contains()` without a re-render-on-attach.
 */
export function Popover(props: PopoverProps): ReactElement {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = false,
    trapFocus = true,
    closeOnEscape = true,
    closeOnOutsideClick = true,
    children,
  } = props;

  const [openRaw, setOpenInternal] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange ?? undefined,
  });
  const open = openRaw ?? false;

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenInternal(next);
    },
    [setOpenInternal],
  );

  // Stable ids that pair the trigger to the content via `aria-controls` / `aria-labelledby`.
  // Using `useId` keeps SSR-safe (the ids are deterministic across server + client renders).
  const contentId = useId();
  const triggerId = useId();

  // The trigger element — captured via callback ref so the value is live (no re-render on
  // attach). Used by `useOutsideClick.contains()` and (via `positionReferenceRef`) by
  // `<Popover.Content>`'s `usePosition` so the trigger registers with both Popover (outside-
  // click + return-focus) and the positioning engine.
  const triggerNodeRef = useRef<HTMLElement | null>(null);
  // Mutable holder for Floating UI's `setReference` callback. `<Popover.Content>` registers it
  // here on mount; `<Popover.Trigger>` reads `.current` inside its `mergeRefs` chain so the
  // trigger DOM node is forwarded to the positioning engine the moment it mounts (and on every
  // remount), regardless of which sibling commits first.
  const positionReferenceRef = useRef<RefCallback<HTMLElement | null> | null>(null);
  const registerPositionReference = useCallback(
    (cb: RefCallback<HTMLElement | null> | null) => {
      positionReferenceRef.current = cb;
      // If the trigger was already attached when Content mounts, replay the current node so
      // Floating UI sees the reference without waiting for the next ref-callback cycle.
      if (cb && triggerNodeRef.current) cb(triggerNodeRef.current);
    },
    [],
  );
  const triggerRef = useCallback<RefCallback<HTMLElement | null>>((node) => {
    triggerNodeRef.current = node;
    // Forward to Floating UI right here so the positioning engine sees the trigger node the
    // exact moment it mounts. `positionReferenceRef.current` may be `null` if Content hasn't
    // mounted yet — that's fine, `registerPositionReference` will replay the current node when
    // Content does mount.
    positionReferenceRef.current?.(node);
  }, []);

  // The floating element — captured via callback ref so `useOutsideClick` can check `contains()`
  // against the *latest* node. Updated by `<Popover.Content>` via `registerContent`.
  const floatingNodeRef = useRef<HTMLElement | null>(null);
  const registerContent = useCallback((node: HTMLElement | null) => {
    floatingNodeRef.current = node;
  }, []);

  // Esc closes the topmost Popover. The escape stack means a Popover nested inside another
  // overlay only closes itself; the outer overlay stays open.
  const onEscape = useCallback(() => setOpen(false), [setOpen]);
  useEscapeStack({ active: open && closeOnEscape, onEscape });

  // Outside-click. Both the trigger and the (portaled) content are "inside" — pointer-down on
  // either is treated as an in-popover interaction. The hook is paused entirely when closed.
  useOutsideClick({
    active: open && closeOnOutsideClick,
    refs: [triggerNodeRef, floatingNodeRef],
    onOutside: () => setOpen(false),
  });

  const ctxValue = useMemo<PopoverContextValue>(
    () => ({
      open,
      setOpen,
      triggerRef,
      triggerNodeRef,
      floatingNodeRef,
      positionReferenceRef,
      registerPositionReference,
      contentId,
      triggerId,
      modal,
      trapFocus,
      registerContent,
    }),
    [
      open,
      setOpen,
      triggerRef,
      registerPositionReference,
      contentId,
      triggerId,
      modal,
      trapFocus,
      registerContent,
    ],
  );

  return <PopoverContext.Provider value={ctxValue}>{children}</PopoverContext.Provider>;
}

Popover.displayName = 'Popover';
