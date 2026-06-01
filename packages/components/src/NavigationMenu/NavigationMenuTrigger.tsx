'use client';

import { Slot, Slottable, forwardRef, mergeRefs } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  useCallback,
  type ButtonHTMLAttributes,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type Ref,
} from 'react';

import {
  useNavigationMenuContext,
  useNavigationMenuItemContext,
} from './NavigationMenu.context';
import { interpolateNavMenu } from './NavigationMenu.i18n';
import { navMenuChevronRecipe, navMenuTriggerRecipe } from './NavigationMenu.recipe';
import type { NavigationMenuTriggerProps } from './NavigationMenu.types';
import { useNavMenuKeyboard } from './useNavMenuKeyboard';

/**
 * `<NavigationMenu.Trigger>` — the focusable button that owns a dropdown.
 *
 * The trigger is `<button role="menuitem" aria-haspopup="menu" aria-expanded>`
 * and lives inside an `<li role="none">` Item. It:
 *
 *   - Owns the click toggle (when `trigger="click"` or `'both'`).
 *   - Schedules hover open/close via the root's `useHoverDelay`.
 *   - Implements the W3C Menubar keyboard pattern via `useNavMenuKeyboard`.
 *   - Tracks the roving-tabindex focused id (`tabIndex={0}` when this item is
 *     the focused one, `tabIndex={-1}` otherwise — Tab stops once for the
 *     entire menubar).
 *   - Renders an inline chevron that rotates on the open state. Consumers can
 *     suppress the chevron with `hideChevron` for icon-only triggers.
 *
 * `asChild` is supported: the consumer's element becomes the trigger via Slot.
 * This is rare — the typical use case is wrapping a Trigger in a `<Tooltip>`
 * for an extra hint on hover. The child must still be a single focusable
 * element (button / a) for the keyboard / a11y story to work.
 */
export const NavigationMenuTrigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  function NavigationMenuTrigger(props, forwardedRef): ReactElement {
    const {
      children,
      icon,
      asChild = false,
      hideChevron = false,
      className,
      style,
      onClick,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      onKeyDown,
      ...rest
    } = props;

    const ctx = useNavigationMenuContext('NavigationMenu.Trigger');
    const itemCtx = useNavigationMenuItemContext('NavigationMenu.Trigger');
    const { itemId, disabled, triggerId, contentId, setItemNode } = itemCtx;

    const isOpen = ctx.openItemId === itemId;
    const isFocused = ctx.focusedItemId === itemId;

    const { className: triggerClass, style: triggerStyle } = useThemedClasses({
      recipe: navMenuTriggerRecipe,
      componentName: 'NavigationMenu',
      slot: 'trigger',
      props: {
        variant: ctx.variant,
        size: ctx.size,
        state: 'inactive',
        disabled,
        orientation: ctx.orientation,
        className,
        style,
      },
    });

    const { className: chevronClass } = useThemedClasses({
      recipe: navMenuChevronRecipe,
      componentName: 'NavigationMenu',
      slot: 'chevron',
      props: {},
    });

    // Roving tabindex: only the focused item is in the tab order. On first
    // render no item is focused yet — we make the FIRST item tabbable as the
    // safety net so users can Tab into the menubar.
    const isFirstItem = useIsFirstItem(itemId, ctx);
    const tabIndex = disabled ? -1 : isFocused || (ctx.focusedItemId === null && isFirstItem) ? 0 : -1;

    const handleKeyboard = useNavMenuKeyboard({
      ctx,
      itemId,
      hasContent: true,
    });

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        handleKeyboard(event);
      },
      [onKeyDown, handleKeyboard],
    );

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (ctx.trigger === 'hover') return;
        ctx.setOpenItemId(isOpen ? null : itemId);
      },
      [disabled, onClick, ctx, isOpen, itemId],
    );

    const handlePointerEnter = useCallback(
      (event: PointerEvent<HTMLButtonElement>) => {
        onPointerEnter?.(event);
        if (disabled) return;
        // Only react to mouse / pen — touch should fall through to click so
        // tappable hover doesn't fire a phantom open under the user's finger.
        if (event.pointerType === 'touch') return;
        ctx.scheduleOpen(itemId);
      },
      [onPointerEnter, disabled, ctx, itemId],
    );

    const handlePointerLeave = useCallback(
      (event: PointerEvent<HTMLButtonElement>) => {
        onPointerLeave?.(event);
        if (disabled) return;
        if (event.pointerType === 'touch') return;
        ctx.scheduleClose();
      },
      [onPointerLeave, disabled, ctx],
    );

    const handleFocus = useCallback(
      (event: FocusEvent<HTMLButtonElement>) => {
        onFocus?.(event);
        ctx.setFocusedItemId(itemId);
      },
      [onFocus, ctx, itemId],
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLButtonElement>) => {
        onBlur?.(event);
        // We don't reset the focusedItemId on blur — the registry of "which
        // item gets tabIndex={0}" is sticky across blurs so the menubar
        // re-enters tab focus on the last-focused trigger (Radix's behavior).
      },
      [onBlur],
    );

    // Compose: forwarded ref + item-context node ref. This is what the keyboard
    // handler / hover delay use to focus / measure.
    const composedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        setItemNode(node);
      },
      [setItemNode],
    );
    const ref = mergeRefs<HTMLButtonElement>(forwardedRef as Ref<HTMLButtonElement>, composedRef);

    const ariaLabel = interpolateNavMenu(ctx.translations.toggleSection, {
      label: typeof children === 'string' ? children : '',
    });

    const a11yProps: ButtonHTMLAttributes<HTMLButtonElement> = {
      role: 'menuitem',
      'aria-haspopup': 'menu',
      'aria-expanded': isOpen,
      'aria-controls': isOpen ? contentId : undefined,
      'aria-disabled': disabled || undefined,
      // sr-only context — when the trigger label is a string we don't need an
      // aria-label (the visible text suffices). For ReactNode labels we include
      // the toggle hint.
      'aria-label': typeof children === 'string' ? undefined : ariaLabel,
      tabIndex,
      type: 'button',
      id: triggerId,
    };

    const dataProps = {
      'data-state': isOpen ? 'open' : 'closed',
      'data-disabled': disabled ? 'true' : undefined,
      'data-active': undefined,
      'data-nav-item-id': itemId,
      'data-orientation': ctx.orientation,
    };

    const chevron = !hideChevron ? (
      <span aria-hidden="true" className={chevronClass} data-nav-trigger-chevron="">
        <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.22 5.97a.75.75 0 0 1 1.06 0L8 9.69l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 7.03a.75.75 0 0 1 0-1.06z" />
        </svg>
      </span>
    ) : null;

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={triggerClass}
          style={triggerStyle ?? undefined}
          onClick={handleClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...a11yProps}
          {...dataProps}
          {...(rest as Record<string, unknown>)}
        >
          {icon ? (
            <span className="inline-flex shrink-0 items-center" aria-hidden="true" data-nav-trigger-icon="">
              {icon}
            </span>
          ) : null}
          <Slottable>{children as ReactElement}</Slottable>
          {chevron}
        </Slot>
      );
    }

    return (
      <button
        {...rest}
        {...a11yProps}
        {...dataProps}
        ref={ref}
        className={triggerClass}
        style={triggerStyle ?? undefined}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        {icon ? (
          <span className="inline-flex shrink-0 items-center" aria-hidden="true" data-nav-trigger-icon="">
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 truncate">{children}</span>
        {chevron}
      </button>
    );
  },
  'NavigationMenu.Trigger',
);

/**
 * Returns true when this item is the *first* registered item in the menubar.
 * Used to bootstrap the roving-tabindex on first render: until any item gains
 * focus, the first item carries `tabIndex={0}` so Tab can reach the menubar.
 *
 * We deliberately read the registry on every render rather than memoizing —
 * the registry is a `Map` populated synchronously during mount, and re-renders
 * are cheap (single integer comparison).
 */
function useIsFirstItem(
  itemId: string,
  ctx: ReturnType<typeof useNavigationMenuContext>,
): boolean {
  // The first item by document order, or the first registered if nothing
  // mounted yet. Both fall back to the same answer once the menubar is fully
  // hydrated.
  const items = ctx.getOrderedItems();
  const first = items.find((rec) => !rec.disabled);
  return first?.id === itemId;
}