'use client';

import { mergeRefs, Portal, usePosition } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { AnimatePresence, motion } from 'motion/react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type Ref,
} from 'react';

import { menuSubMotion } from './Menu.motion';
import { menuContentRecipe } from './Menu.recipe';
import { MenuContext, useMenuContext, useMenuSubContext } from './MenuContext';
import { useMenuKeyboard } from './useMenuKeyboard';
import type {
  MenuContextValue,
  MenuItemRecord,
  MenuItemRegistration,
  MenuPlacement,
  MenuSubContentProps,
} from './Menu.types';

/**
 * The submenu's floating panel. Architecturally a smaller version of `<Menu.Content>`:
 * positioned with `usePosition` against the SubTrigger node, portalled with `<Portal>`, animated
 * with `motion`, and keyboard-driven with `useMenuKeyboard`.
 *
 * The crucial structural difference is that SubContent **provides its own MenuContext** — items
 * rendered inside it register with this sub's own item registry, not the outer Menu's. This keeps
 * keyboard navigation scoped: ArrowDown inside the sub only steps through sub items; ArrowLeft
 * closes the sub and returns the parent's highlight to the SubTrigger.
 */
function MenuSubContentImpl(
  props: MenuSubContentProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    variant,
    size,
    color,
    placement: placementProp,
    offset = 0,
    portalContainer,
    loop = true,
    typeAhead = true,
    className,
    style,
    sx,
    children,
    onKeyDown,
    onPointerEnter,
    onPointerLeave,
    ...rest
  } = props;

  const parent = useMenuContext('Menu.SubContent');
  const sub = useMenuSubContext('Menu.SubContent');

  const placement: MenuPlacement =
    typeof placementProp === 'string'
      ? (placementProp as MenuPlacement)
      : 'right-start';

  const { triggerRef, floatingRef, placement: actualPlacement, floatingStyles } = usePosition({
    placement,
    offset,
    open: sub.open,
  });

  // Anchor against the SubTrigger node captured by `useMenuSubContext`.
  useEffect(() => {
    const node = sub.triggerNodeRef.current;
    if (node) (triggerRef as unknown as (el: unknown) => void)(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub.open]);

  const localFloatingRef = useRef<HTMLDivElement | null>(null);

  // Focus the SubContent on open. Same discipline as Menu.Content.
  useEffect(() => {
    if (!sub.open) return;
    const id = setTimeout(() => {
      localFloatingRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => clearTimeout(id);
  }, [sub.open]);

  // Own item registry — separate from the parent's. The provider below installs this context so
  // child items register here.
  const itemsRef = useRef<Map<string, MenuItemRecord>>(new Map());
  const registerItem = useCallback(
    (id: string, node: HTMLElement | null, opts: MenuItemRegistration) => {
      const map = itemsRef.current;
      if (node === null) {
        map.delete(id);
        return;
      }
      map.set(id, { id, node, textValue: opts.textValue, disabled: opts.disabled });
    },
    [],
  );

  const getEnabledItems = useCallback((): MenuItemRecord[] => {
    const list: MenuItemRecord[] = [];
    for (const rec of itemsRef.current.values()) {
      if (rec.disabled) continue;
      list.push(rec);
    }
    try {
      list.sort((a, b) => {
        const pos = a.node.compareDocumentPosition(b.node);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
    } catch {
      // ignore
    }
    return list;
  }, []);

  const [highlightedId, setHighlightedIdState] = useState<string | null>(null);
  const setHighlightedId = useCallback((id: string | null) => {
    setHighlightedIdState(id);
  }, []);

  // Clear highlight when the sub closes so re-opens start fresh.
  useEffect(() => {
    if (!sub.open) setHighlightedIdState(null);
  }, [sub.open]);

  // Keyboard handler for the sub. Esc closes the sub (escape stack handles ordering — the
  // sub's escape entry is on top, so the press goes to it first); ArrowLeft also closes the sub.
  const onCloseSub = useCallback(() => sub.setOpen(false), [sub]);

  const onSelectItem = useCallback(
    (id: string) => {
      const items = getEnabledItems();
      const target = items.find((it) => it.id === id);
      if (!target) return;
      target.node.click();
    },
    [getEnabledItems],
  );

  const handleKey = useMenuKeyboard({
    getItems: getEnabledItems,
    getHighlightedId: () => highlightedId,
    setHighlightedId,
    loop,
    typeAhead,
    onClose: onCloseSub,
    onSelect: onSelectItem,
    onCloseSub,
  });

  const composedKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      handleKey(event);
    },
    [onKeyDown, handleKey],
  );

  // Pointer-into the SubContent cancels any pending close timer set by the SubTrigger's
  // pointer-leave; pointer-out reschedules the close.
  const handlePointerEnter = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerEnter?.(event);
      if (event.defaultPrevented) return;
      sub.cancelPending();
    },
    [onPointerEnter, sub],
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      if (event.defaultPrevented) return;
      sub.scheduleClose();
    },
    [onPointerLeave, sub],
  );

  const { className: contentClass, style: contentStyle } = useThemedClasses({
    recipe: menuContentRecipe,
    componentName: 'Menu',
    slot: 'content',
    props: {
      variant,
      size,
      color,
      className,
      sx,
      style,
    },
  });

  const composedFloatingRef = mergeRefs<HTMLDivElement>(
    floatingRef as unknown as Ref<HTMLDivElement>,
    localFloatingRef as unknown as Ref<HTMLDivElement>,
    (node: HTMLDivElement | null) => sub.registerContent(node as HTMLElement | null),
    forwardedRef as Ref<HTMLDivElement>,
  );

  const surfaceStyle: CSSProperties = {
    ...(floatingStyles as CSSProperties),
    ...(contentStyle ?? {}),
  };

  // Build a sub-scoped MenuContext for items rendered inside. Inherits trigger / focus refs from
  // the *parent* so things like context-anchor stay shared, but swaps the item registry +
  // highlighted state to this sub's.
  const subCtxValue = useMemo<MenuContextValue>(
    () => ({
      ...parent,
      registerItem,
      getEnabledItems,
      highlightedId,
      setHighlightedId,
      contentId: sub.contentId,
      triggerId: sub.triggerId,
      // Inside a sub, items' `setOpen(false)` should close the sub, not the parent.
      setOpen: sub.setOpen,
      open: sub.open,
    }),
    [
      parent,
      registerItem,
      getEnabledItems,
      highlightedId,
      setHighlightedId,
      sub.contentId,
      sub.triggerId,
      sub.setOpen,
      sub.open,
    ],
  );

  const motionExtraProps: Record<string, unknown> = { ...rest };

  return (
    <Portal container={portalContainer}>
      <AnimatePresence>
        {sub.open ? (
          <motion.div
            ref={composedFloatingRef}
            id={sub.contentId}
            role="menu"
            tabIndex={-1}
            aria-labelledby={sub.triggerId}
            aria-orientation="vertical"
            data-state="open"
            data-placement={actualPlacement}
            data-variant={typeof variant === 'string' ? variant : 'solid'}
            className={contentClass}
            style={surfaceStyle as never}
            onKeyDown={composedKeyDown}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            {...menuSubMotion(actualPlacement as MenuPlacement)}
            {...motionExtraProps}
          >
            <MenuContext.Provider value={subCtxValue}>{children}</MenuContext.Provider>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}

export const MenuSubContent = forwardRef<HTMLDivElement, MenuSubContentProps>(MenuSubContentImpl);
MenuSubContent.displayName = 'Menu.SubContent';