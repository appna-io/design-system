'use client';

import { forwardRef, Slot, Slottable } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, useRef, type MouseEvent } from 'react';

import { tabsRecipes } from './Tabs.recipe';
import { useTabsContext } from './TabsContext';
import { useTabsKeyboard } from './useTabsKeyboard';
import type { TabsTriggerProps } from './Tabs.types';

/**
 * The clickable header that activates its matching `<Tabs.Panel>`. Renders a real `<button>`
 * by default so Enter / Space / click activation come from native semantics; `asChild` swaps
 * the rendered element for the consumer's child (typically a `<Link>` or `<a>`) while keeping
 * the ARIA roles + active-state classes — that's how routing-driven tabs work.
 *
 * The roving-tabindex pattern is implemented here: the active trigger has `tabIndex=0`, every
 * other trigger has `tabIndex=-1`. Arrow keys move focus within the list per the keyboard hook;
 * Tab leaves the list to the next focusable element on the page.
 */
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  props,
  ref,
) {
  const ctx = useTabsContext('Tabs.Trigger');
  const {
    value,
    disabled = false,
    leftIcon,
    rightIcon,
    badge,
    asChild = false,
    className,
    style,
    sx,
    children,
    onClick,
    onKeyDown,
    ...rest
  } = props;

  const active = ctx.value === value;

  // Local handle on the rendered element so we can register it with the root's keyboard
  // registry. Combined with the consumer-supplied `ref` via a callback so both stay in sync.
  const localRef = useRef<HTMLButtonElement | null>(null);

  // The callback-ref pattern handles both mount (`el = node`) and unmount (`el = null`) cases
  // — React invokes it with `null` immediately before swapping in a new ref callback (when the
  // identity changes) and again on unmount. There's intentionally **no separate `useEffect`
  // cleanup** here: layering one on top of the callback ref creates a commit-order race where
  // the effect cleanup fires *after* the new ref has already re-registered, silently dropping
  // the trigger from the keyboard registry on every context-driven re-render.
  const registerTrigger = ctx.registerTrigger;
  const setRefs = useCallback(
    (el: HTMLButtonElement | null) => {
      localRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      }
      registerTrigger(value, el);
    },
    [registerTrigger, value, ref],
  );

  const { className: triggerClass, style: triggerStyle } = useThemedClasses({
    recipe: tabsRecipes.trigger,
    componentName: 'Tabs',
    slot: 'trigger',
    props: {
      variant: ctx.variant,
      size: ctx.size,
      color: ctx.color,
      orientation: ctx.orientation,
      className,
      sx,
      style,
    },
  });

  const handleKeyboard = useTabsKeyboard(ctx, value);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (disabled) return;
      if (ctx.value === value) return;
      ctx.setValue(value);
    },
    [onClick, disabled, ctx, value],
  );

  const Component: typeof Slot | 'button' = asChild ? Slot : 'button';

  return (
    <Component
      ref={setRefs}
      // `type=button` is the right call only when we render a native button. For `asChild` the
      // wrapped element keeps its own type (an `<a>` has no `type` to worry about, a `<Link>`
      // forwards to its `<a>`). The Slot strips the `type` attribute on non-button elements.
      type={asChild ? undefined : 'button'}
      role="tab"
      id={`${ctx.baseId}-trigger-${value}`}
      aria-selected={active}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      aria-disabled={disabled || undefined}
      tabIndex={active ? 0 : -1}
      data-state={active ? 'active' : 'inactive'}
      data-disabled={disabled || undefined}
      data-orientation={ctx.orientation}
      disabled={asChild ? undefined : disabled}
      className={triggerClass}
      style={triggerStyle ?? undefined}
      onClick={handleClick}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        handleKeyboard(event);
      }}
      {...rest}
    >
      {leftIcon != null ? (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center">
          {leftIcon}
        </span>
      ) : null}
      <Slottable>{children}</Slottable>
      {badge != null ? (
        <span className="ms-1 inline-flex shrink-0 items-center" data-tabs-badge="">
          {badge}
        </span>
      ) : null}
      {rightIcon != null ? (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center">
          {rightIcon}
        </span>
      ) : null}
    </Component>
  );
}, 'Tabs.Trigger');
