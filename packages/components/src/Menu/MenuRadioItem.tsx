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

import {
  menuItemRecipe,
  menuRadioIndicatorRecipe,
  menuShortcutRecipe,
} from './Menu.recipe';
import { useMenuContext, useMenuRadioGroupContext } from './MenuContext';
import type { MenuRadioItemProps } from './Menu.types';

/**
 * Single radio in a `<Menu.RadioGroup>`. `role="menuitemradio"` + `aria-checked`. Like
 * CheckboxItem, never auto-closes the menu — RadioGroup commits the value through context.
 *
 * Reuses Phase 11 Radio's visual indicator pattern (a centered dot) without re-importing.
 */
function MenuRadioItemImpl(
  props: MenuRadioItemProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    value,
    leftIcon,
    rightIcon,
    shortcut,
    disabled = false,
    color,
    onClick,
    onPointerMove,
    onPointerLeave,
    sx,
    style,
    className,
    children,
    ...rest
  } = props;

  const ctx = useMenuContext('Menu.RadioItem');
  const radioCtx = useMenuRadioGroupContext('Menu.RadioItem');
  const { setHighlightedId, highlightedId, registerItem } = ctx;

  const reactId = useId();
  const id = reactId;

  const nodeRef = useRef<HTMLDivElement | null>(null);

  const checked = radioCtx.value === value;

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
      if (event.defaultPrevented) return;
      if (disabled) return;
      radioCtx.setValue(value);
    },
    [onClick, disabled, radioCtx, value],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      if (event.defaultPrevented || disabled) return;
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

  const { className: indicatorClass } = useThemedClasses({
    recipe: menuRadioIndicatorRecipe,
    componentName: 'Menu',
    slot: 'radioIndicator',
    props: {},
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

  // Keyboard handling lives at <Menu.Content>'s onKeyDown (same architecture as <Menu.Item>);
  // see MenuItem.tsx for the rationale. The lint rule can't follow the indirection.
  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
    <div
      ref={composedRef}
      role="menuitemradio"
      tabIndex={-1}
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-state={checked ? 'checked' : 'unchecked'}
      className={itemClass}
      style={itemStyle}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      <span aria-hidden="true" className={indicatorClass}>
        {checked ? (
          <span className="size-1.5 rounded-full bg-current" />
        ) : null}
      </span>
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

export const MenuRadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>(MenuRadioItemImpl);
MenuRadioItem.displayName = 'Menu.RadioItem';