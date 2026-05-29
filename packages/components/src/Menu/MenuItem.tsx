'use client';

import { mergeRefs } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ForwardedRef,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type Ref,
} from 'react';

import { menuItemRecipe, menuShortcutRecipe } from './Menu.recipe';
import { useMenuContext } from './MenuContext';
import type { MenuItemProps } from './Menu.types';

/**
 * Plain action item. Registers itself with the root's item registry on mount (so the keyboard
 * hook can navigate to it and type-ahead can find it by `textValue`), and renders the standard
 * `role="menuitem"` row with left icon + label + right icon + shortcut slots.
 *
 * `onSelect` fires for both mouse click and keyboard Enter/Space. The keyboard hook dispatches a
 * synthetic `node.click()` so a single onClick captures both code paths. After `onSelect`, if the
 * root's `closeOnSelect` is `true` (default) and the consumer didn't `preventDefault`, the menu
 * closes.
 *
 * `data-highlighted="true"` is set imperatively when the root's `highlightedId` matches this
 * item's id. Pointer-move sets the highlight too (mouse hover focuses the row visually).
 */
function MenuItemImpl(
  props: MenuItemProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    leftIcon,
    rightIcon,
    shortcut,
    disabled = false,
    color,
    onSelect,
    onClick,
    onPointerMove,
    onPointerLeave,
    sx,
    style,
    className,
    children,
    ...rest
  } = props;

  const ctx = useMenuContext('Menu.Item');
  const { setHighlightedId, highlightedId, setOpen, closeOnSelect, registerItem } = ctx;

  const reactId = useId();
  // Stable per-render id we hand to the registry. Falls back to the React-provided id so each
  // mounted instance is unique even when the consumer doesn't pass one.
  const id = reactId;

  const nodeRef = useRef<HTMLDivElement | null>(null);

  // Derive `textValue` from children when it's a primitive string; otherwise the consumer should
  // pass `aria-label` on rest. Type-ahead falls back to `aria-label` then to empty.
  const textValue = useMemo(() => {
    if (typeof children === 'string') return children;
    const aria = (rest as { 'aria-label'?: string })['aria-label'];
    return aria ?? '';
  }, [children, rest]);

  // Register / re-register the item whenever its identity-affecting fields change.
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
      if (event.defaultPrevented) return;
      if (disabled) return;
      onSelect?.();
      if (closeOnSelect) setOpen(false);
    },
    [onClick, disabled, onSelect, closeOnSelect, setOpen],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      if (event.defaultPrevented) return;
      if (disabled) return;
      // Pointer-hovering an item highlights it. This mirrors the keyboard highlight so mouse +
      // keyboard share one signal — when the user switches between input modes the highlight
      // doesn't desync.
      if (highlightedId !== id) setHighlightedId(id);
    },
    [onPointerMove, disabled, highlightedId, id, setHighlightedId],
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      if (event.defaultPrevented) return;
      if (highlightedId === id) setHighlightedId(null);
    },
    [onPointerLeave, highlightedId, id, setHighlightedId],
  );

  const { className: itemClass, style: itemStyle } = useThemedClasses({
    recipe: menuItemRecipe,
    componentName: 'Menu',
    slot: 'item',
    props: {
      size: undefined,
      color: color ?? 'neutral',
      className,
      sx,
      style,
    },
  });

  const { className: shortcutClass } = useThemedClasses({
    recipe: menuShortcutRecipe,
    componentName: 'Menu',
    slot: 'shortcut',
    props: {},
  });

  const composedRef = mergeRefs<HTMLDivElement>(
    nodeRef as unknown as Ref<HTMLDivElement>,
    forwardedRef as Ref<HTMLDivElement>,
  );

  const highlighted = highlightedId === id;

  // Keyboard handling for items lives at <Menu.Content>'s onKeyDown — the keyboard hook
  // dispatches `node.click()` so this onClick captures both mouse and keyboard. The lint rule
  // can't see across that indirection, so we disable it for this element specifically.
  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
    <div
      ref={composedRef}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      className={itemClass}
      style={itemStyle}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      {leftIcon ? (
        <span aria-hidden="true" className="inline-flex items-center justify-center shrink-0">
          {leftIcon}
        </span>
      ) : null}
      <span className="flex-1 truncate">{children}</span>
      {rightIcon ? (
        <span aria-hidden="true" className="inline-flex items-center justify-center shrink-0">
          {rightIcon}
        </span>
      ) : null}
      {shortcut ? <span className={shortcutClass}>{shortcut}</span> : null}
    </div>
  );
}

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(MenuItemImpl);
MenuItem.displayName = 'Menu.Item';
