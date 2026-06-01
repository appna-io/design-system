'use client';

import { mergeRefs } from '@apx-ui/engine';
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type {
  MouseEvent,
  PointerEvent,
  ReactElement,
  Ref,
} from 'react';

import { useMenuContext } from './MenuContext';
import type { MenuTriggerProps, MenuVirtualAnchor } from './Menu.types';

/**
 * The clickable / focusable / right-clickable / hoverable trigger. Two render modes (mirroring
 * Popover): `asChild={true}` (default) clones a single child element and attaches the wiring to
 * it; `asChild={false}` renders an inline `<button type="button">`.
 *
 * Event wiring varies by `trigger` mode resolved at the root:
 *
 *  - `click`   — onClick toggles open. contextmenu falls through to the platform default.
 *  - `context` — onContextMenu opens at the cursor (preventDefault). onClick is unbound.
 *  - `hover`   — onPointerEnter schedules open after `openDelay`; onPointerLeave schedules close
 *    after `closeDelay`. Both timers are cancellable so quick hover-out cancels the open.
 *
 * The `data-state="open|closed"` and `aria-haspopup="menu"` / `aria-expanded` / `aria-controls`
 * attributes are always set so consumers can style and screen readers can announce the open
 * state regardless of which trigger mode is active.
 */
export function MenuTrigger(props: MenuTriggerProps): ReactElement {
  const {
    asChild = false,
    children,
    onClick,
    onContextMenu,
    onPointerEnter,
    onPointerLeave,
    ...rest
  } = props;
  const ctx = useMenuContext('Menu.Trigger');
  const { triggerKind, openDelay, closeDelay, setContextAnchor } = ctx;

  // Hover-mode timers — held in refs so the cleanup effect can clear them on unmount or when
  // `trigger` flips off `hover`.
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearOpenTimer();
      clearCloseTimer();
    };
  }, [clearOpenTimer, clearCloseTimer]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      onClick?.(event as MouseEvent<HTMLButtonElement>);
      if (event.defaultPrevented) return;
      // Context mode doesn't open on plain click — the user explicitly right-clicks.
      if (triggerKind === 'context') return;
      ctx.setOpen(!ctx.open);
    },
    [ctx, onClick, triggerKind],
  );

  const handleContextMenu = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      onContextMenu?.(event as MouseEvent<HTMLButtonElement>);
      if (event.defaultPrevented) return;
      // Only `context` mode hijacks contextmenu. Other modes let the platform menu show.
      if (triggerKind !== 'context') return;
      event.preventDefault();
      const x = event.clientX;
      const y = event.clientY;
      // Synthesize a 1px virtual rect at the cursor. Floating UI accepts this in place of a DOM
      // node via `setReference(virtualElement)`.
      const anchor: MenuVirtualAnchor = {
        getBoundingClientRect: () => ({
          x,
          y,
          left: x,
          top: y,
          right: x + 1,
          bottom: y + 1,
          width: 1,
          height: 1,
        }),
      };
      setContextAnchor(anchor);
      ctx.setOpen(true);
    },
    [ctx, onContextMenu, triggerKind, setContextAnchor],
  );

  const handlePointerEnter = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      onPointerEnter?.(event as PointerEvent<HTMLButtonElement>);
      if (event.defaultPrevented) return;
      if (triggerKind !== 'hover') return;
      clearCloseTimer();
      if (ctx.open) return;
      openTimerRef.current = setTimeout(() => {
        ctx.setOpen(true);
        openTimerRef.current = null;
      }, openDelay);
    },
    [ctx, onPointerEnter, triggerKind, openDelay, clearCloseTimer],
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      onPointerLeave?.(event as PointerEvent<HTMLButtonElement>);
      if (event.defaultPrevented) return;
      if (triggerKind !== 'hover') return;
      clearOpenTimer();
      if (!ctx.open) return;
      closeTimerRef.current = setTimeout(() => {
        ctx.setOpen(false);
        closeTimerRef.current = null;
      }, closeDelay);
    },
    [ctx, onPointerLeave, triggerKind, closeDelay, clearOpenTimer],
  );

  const sharedProps = {
    id: ctx.triggerId,
    'aria-haspopup': 'menu' as const,
    'aria-expanded': ctx.open,
    'aria-controls': ctx.open ? ctx.contentId : undefined,
    'data-state': ctx.open ? ('open' as const) : ('closed' as const),
    onClick: handleClick,
    onContextMenu: handleContextMenu,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
  };

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      throw new Error('<Menu.Trigger asChild> requires a single React element as its child.');
    }
    const childProps = child.props as {
      ref?: Ref<HTMLElement>;
      onClick?: (e: MouseEvent<HTMLElement>) => void;
      onContextMenu?: (e: MouseEvent<HTMLElement>) => void;
      onPointerEnter?: (e: PointerEvent<HTMLElement>) => void;
      onPointerLeave?: (e: PointerEvent<HTMLElement>) => void;
    };
    const composedRef = mergeRefs<HTMLElement>(childProps.ref, ctx.triggerRef);
    return cloneElement(child, {
      ref: composedRef,
      ...sharedProps,
      onClick: (event: MouseEvent<HTMLElement>) => {
        childProps.onClick?.(event);
        if (event.defaultPrevented) return;
        handleClick(event);
      },
      onContextMenu: (event: MouseEvent<HTMLElement>) => {
        childProps.onContextMenu?.(event);
        if (event.defaultPrevented) return;
        handleContextMenu(event);
      },
      onPointerEnter: (event: PointerEvent<HTMLElement>) => {
        childProps.onPointerEnter?.(event);
        if (event.defaultPrevented) return;
        handlePointerEnter(event);
      },
      onPointerLeave: (event: PointerEvent<HTMLElement>) => {
        childProps.onPointerLeave?.(event);
        if (event.defaultPrevented) return;
        handlePointerLeave(event);
      },
      ...rest,
    } as Record<string, unknown>);
  }

  return (
    <button
      type="button"
      ref={ctx.triggerRef as unknown as Ref<HTMLButtonElement>}
      {...sharedProps}
      {...rest}
    >
      {children}
    </button>
  );
}

MenuTrigger.displayName = 'Menu.Trigger';