'use client';

import { mergeRefs } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { ChevronRight } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ForwardedRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type Ref,
} from 'react';

import {
  menuItemRecipe,
  menuSubTriggerChevronRecipe,
} from './Menu.recipe';
import { useMenuContext, useMenuSubContext } from './MenuContext';
import type { MenuSubTriggerProps } from './Menu.types';

/**
 * Submenu trigger. Renders as a menuitem row with a logical-end chevron, but with three crucial
 * differences from a plain `<Menu.Item>`:
 *
 *  1. It does NOT select/close on Enter — Enter opens the submenu.
 *  2. Pointer-enter / pointer-leave schedule open / close via the sub's hover delays.
 *  3. Right-arrow opens the submenu (handled by the parent Content's keyboard hook + this
 *     element capturing focus on highlight). For simplicity in V1 the keyboard hook calls
 *     `node.click()` for Enter; we treat onClick as "open submenu" for the SubTrigger.
 *
 * Like Item, this element registers in the *parent* MenuContext's item registry (it appears as
 * a row in the outer menu's keyboard nav). It does NOT live in its own sub's registry — the
 * sub's items go there instead.
 */
function MenuSubTriggerImpl(
  props: MenuSubTriggerProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    leftIcon,
    disabled = false,
    onClick,
    onPointerMove,
    onPointerLeave,
    onKeyDown,
    sx,
    style,
    className,
    children,
    ...rest
  } = props;

  const parent = useMenuContext('Menu.SubTrigger');
  const sub = useMenuSubContext('Menu.SubTrigger');
  const { setHighlightedId, highlightedId, registerItem } = parent;

  const reactId = useId();
  const id = reactId;

  const nodeRef = useRef<HTMLDivElement | null>(null);

  // Wire the sub's triggerNodeRef so SubContent's usePosition can anchor against this row.
  useEffect(() => {
    sub.triggerNodeRef.current = nodeRef.current;
  });

  const textValue = useMemo(() => {
    if (typeof children === 'string') return children;
    const aria = (rest as { 'aria-label'?: string })['aria-label'];
    return aria ?? '';
  }, [children, rest]);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    registerItem(id, node, { textValue, disabled });
    return () => {
      registerItem(id, null, { textValue, disabled });
    };
  }, [id, textValue, disabled, registerItem]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled) return;
      sub.cancelPending();
      sub.setOpen(!sub.open);
    },
    [onClick, disabled, sub],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      if (event.defaultPrevented || disabled) return;
      if (highlightedId !== id) setHighlightedId(id);
      // Hover-into a SubTrigger schedules the submenu to open.
      sub.scheduleOpen();
    },
    [onPointerMove, disabled, highlightedId, id, setHighlightedId, sub],
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      if (event.defaultPrevented) return;
      if (highlightedId === id) setHighlightedId(null);
      // Hover-out schedules a close; the cancellation happens when the pointer enters SubContent.
      sub.scheduleClose();
    },
    [onPointerLeave, highlightedId, id, setHighlightedId, sub],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;
      // SubTrigger captures Enter/Space directly because the parent's keyboard hook routes
      // Enter/Space through node.click(), which we redefine here to "open submenu". For
      // explicitness we also handle the keys at the SubTrigger so screen-reader announcements
      // and click-handlers stay aligned.
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
        event.preventDefault();
        sub.cancelPending();
        sub.setOpen(true);
      }
    },
    [onKeyDown, disabled, sub],
  );

  const { className: itemClass, style: itemStyle } = useThemedClasses({
    recipe: menuItemRecipe,
    componentName: 'Menu',
    slot: 'item',
    props: {
      size: undefined,
      color: 'neutral',
      className,
      sx,
      style,
    },
  });

  const { className: chevronClass } = useThemedClasses({
    recipe: menuSubTriggerChevronRecipe,
    componentName: 'Menu',
    slot: 'subTriggerChevron',
    props: {},
  });

  const composedRef = mergeRefs<HTMLDivElement>(
    nodeRef as unknown as Ref<HTMLDivElement>,
    forwardedRef as Ref<HTMLDivElement>,
  );

  const highlighted = highlightedId === id;

  return (
    <div
      ref={composedRef}
      id={sub.triggerId}
      role="menuitem"
      tabIndex={-1}
      aria-haspopup="menu"
      aria-expanded={sub.open}
      aria-controls={sub.open ? sub.contentId : undefined}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-state={sub.open ? 'open' : 'closed'}
      className={itemClass}
      style={itemStyle}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {leftIcon ? (
        <span aria-hidden="true" className="inline-flex items-center justify-center shrink-0">
          {leftIcon}
        </span>
      ) : null}
      <span className="flex-1 truncate">{children}</span>
      <ChevronRight aria-hidden="true" className={chevronClass} />
    </div>
  );
}

export const MenuSubTrigger = forwardRef<HTMLDivElement, MenuSubTriggerProps>(MenuSubTriggerImpl);
MenuSubTrigger.displayName = 'Menu.SubTrigger';
