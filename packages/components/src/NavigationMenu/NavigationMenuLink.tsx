'use client';

import { Slot, Slottable, forwardRef, mergeRefs } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  useCallback,
  useContext,
  useEffect,
  type AnchorHTMLAttributes,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from 'react';

import { isActiveHref } from '../Sidebar/isActiveHref';

import {
  NavigationMenuContentItemContext,
  NavigationMenuItemContext,
  useNavigationMenuContext,
} from './NavigationMenu.context';
import { navMenuPanelLinkRecipe, navMenuTriggerRecipe } from './NavigationMenu.recipe';
import type { NavigationMenuLinkProps } from './NavigationMenu.types';
import { useNavMenuKeyboard } from './useNavMenuKeyboard';

/**
 * `<NavigationMenu.Link>` — a navigation link.
 *
 * The Link plays two roles:
 *
 *   1. **Top-level link** — when used as a direct child of `<NavigationMenu.Item>`
 *      (no Trigger sibling). The Link IS the focusable element for that item;
 *      it participates in the menubar's roving tabindex and the W3C Menubar
 *      keyboard pattern.
 *   2. **Panel link** — when used inside a `<NavigationMenu.Content>` (typical
 *      mega-menu / dropdown link). In that case the Link is just an anchor —
 *      no roving tabindex, no menubar keyboard handler, but it still picks up
 *      `aria-current="page"` via the active-state resolver.
 *
 * `asChild` lets routers (`<NextLink>`, `<RouterLink>`, …) take over the
 * rendered element while keeping the Link's styling + a11y attributes — same
 * mechanism Sidebar.Item uses.
 */
export const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  function NavigationMenuLink(props, forwardedRef): ReactElement {
    const {
      children,
      icon,
      description,
      asChild = false,
      active: activeProp,
      href,
      className,
      style,
      onClick,
      onFocus,
      onBlur,
      onKeyDown,
      ...rest
    } = props;

    const ctx = useNavigationMenuContext('NavigationMenu.Link');
    const itemCtx = useContext(NavigationMenuItemContext);
    const insideContent = useContext(NavigationMenuContentItemContext);

    // Active resolution. Explicit prop wins; otherwise compare against the root's
    // activeHref via the shared `isActiveHref` helper (same pure function the
    // Sidebar uses, so both navigation surfaces agree on what "active" means).
    const isActive =
      activeProp !== undefined
        ? activeProp
        : isActiveHref({
            current: ctx.activeHref,
            itemHref: href,
            strategy: ctx.activeMatchStrategy,
          });

    // Sync the Item registry when this Link is the top-level focusable. The
    // registry needs the href to short-circuit hover-open (no panel = no
    // open) and the label for type-to-search.
    const isTopLevel = itemCtx !== null && !insideContent;
    const { updateItem } = ctx;
    useEffect(() => {
      if (!isTopLevel || !itemCtx) return;
      updateItem(itemCtx.itemId, {
        href,
        hasContent: false,
        label: typeof children === 'string' ? children : extractText(children),
      });
    }, [isTopLevel, itemCtx, updateItem, href, children]);

    const isFocused = isTopLevel && itemCtx ? ctx.focusedItemId === itemCtx.itemId : false;

    // Roving tabindex bootstrap. When no item has been focused yet, fall back
    // to the FIRST registered item via `getOrderedItems()`. We compute this
    // once per render — `getOrderedItems` reads a ref-backed Map that's
    // populated by item registration effects.
    const isFirstUnfocused = useIsFirstFocusable(ctx, itemCtx?.itemId);
    const tabIndex = !isTopLevel
      ? undefined
      : itemCtx?.disabled
        ? -1
        : isFocused || (ctx.focusedItemId === null && isFirstUnfocused)
          ? 0
          : -1;

    const recipe = isTopLevel ? navMenuTriggerRecipe : navMenuPanelLinkRecipe;
    const recipeProps = isTopLevel
      ? {
          variant: ctx.variant,
          size: ctx.size,
          state: isActive ? 'active' : 'inactive',
          disabled: itemCtx?.disabled ?? false,
          orientation: ctx.orientation,
          className,
          style,
        }
      : {
          size: ctx.size,
          disabled: false,
          className,
          style,
        };

    const { className: linkClass, style: linkStyle } = useThemedClasses({
      recipe,
      componentName: 'NavigationMenu',
      slot: isTopLevel ? 'link' : 'panelLink',
      props: recipeProps,
    });

    // Keyboard handler — only for top-level links. Panel links delegate to
    // the Content panel's own ArrowUp/Down handler.
    const handleKeyboard = useNavMenuKeyboard({
      ctx,
      itemId: itemCtx?.itemId ?? '',
      hasContent: false,
    });

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLAnchorElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (!isTopLevel) return;
        handleKeyboard(event);
      },
      [onKeyDown, handleKeyboard, isTopLevel],
    );

    const handleClick = useCallback(
      (event: MouseEvent<HTMLAnchorElement>) => {
        if (itemCtx?.disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      },
      [itemCtx, onClick],
    );

    const handleFocus = useCallback(
      (event: FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(event);
        if (isTopLevel && itemCtx) {
          ctx.setFocusedItemId(itemCtx.itemId);
        }
      },
      [onFocus, isTopLevel, itemCtx, ctx],
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLAnchorElement>) => {
        onBlur?.(event);
      },
      [onBlur],
    );

    // Fan-out the ref: forwarded → item-context node ref. The item-context ref
    // is what the keyboard handler / indicator use to focus + measure the
    // top-level link. Panel links don't register against the item context.
    const composedRef = useCallback(
      (node: HTMLAnchorElement | null) => {
        if (isTopLevel && itemCtx) itemCtx.setItemNode(node);
      },
      [isTopLevel, itemCtx],
    );
    const ref = mergeRefs<HTMLAnchorElement>(forwardedRef as Ref<HTMLAnchorElement>, composedRef);

    // We always pass `href` (even on disabled items) so the `<a>` keeps its
    // navigation semantics; the `handleClick` handler `preventDefault`s when
    // disabled so the user can't activate it. Stripping `href` would turn the
    // anchor into a "static interactive element" (lint rule
    // `jsx-a11y/no-static-element-interactions`) and downgrade screen-reader
    // semantics to a generic span.
    //
    // Mega-menu links drop `role="menuitem"` because their grandparent panel
    // uses `role="group"` instead of `role="menu"` (the mega-menu hierarchy
    // doesn't fit the W3C menu pattern's required-children contract — h3
    // headings, columns, featured slot). Top-level links and default panel
    // links keep `role="menuitem"`.
    const insideMega = insideContent?.variant === 'mega';
    const a11yProps: AnchorHTMLAttributes<HTMLAnchorElement> = {
      role: insideMega ? undefined : 'menuitem',
      'aria-current': isActive ? 'page' : undefined,
      'aria-disabled': itemCtx?.disabled || undefined,
      tabIndex,
      href,
    };

    const dataProps = {
      'data-active': isActive ? 'true' : undefined,
      'data-disabled': itemCtx?.disabled ? 'true' : undefined,
      'data-nav-item-id': isTopLevel ? itemCtx?.itemId : undefined,
      'data-orientation': isTopLevel ? ctx.orientation : undefined,
    };

    const labelNode = (
      <>
        {icon ? (
          <span className="inline-flex shrink-0 items-center" aria-hidden="true" data-nav-link-icon="">
            {icon}
          </span>
        ) : null}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
          <span className="truncate font-medium">{children}</span>
          {description ? (
            <span className="truncate text-xs text-(--sds-color-text-muted)">{description}</span>
          ) : null}
        </span>
        {isActive ? (
          <span className="sr-only">{ctx.translations.activeItem}</span>
        ) : null}
      </>
    );

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={linkClass}
          style={linkStyle ?? undefined}
          onClick={handleClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...a11yProps}
          {...dataProps}
          {...(rest as Record<string, unknown>)}
        >
          {/*
           * In asChild mode we let the consumer's element provide its own
           * children (typical: `<RouterLink to="/x">Pricing</RouterLink>`).
           * The icon / description are siblings of the slottable children so
           * the consumer's text becomes the label in-place.
           */}
          {icon ? (
            <span className="inline-flex shrink-0 items-center" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <Slottable>{children as ReactElement}</Slottable>
          {description ? (
            <span className="truncate text-xs text-(--sds-color-text-muted)">{description}</span>
          ) : null}
          {isActive ? <span className="sr-only">{ctx.translations.activeItem}</span> : null}
        </Slot>
      );
    }

    return (
      <a
        {...rest}
        {...dataProps}
        ref={ref}
        href={href}
        role={a11yProps.role}
        aria-current={a11yProps['aria-current']}
        aria-disabled={a11yProps['aria-disabled']}
        tabIndex={tabIndex}
        className={linkClass}
        style={linkStyle ?? undefined}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        {labelNode}
      </a>
    );
  },
  'NavigationMenu.Link',
);

/**
 * Walks a ReactNode looking for the first string descendant. Used for
 * type-to-search labels when the consumer passes a JSX label like
 * `<><Icon />Pricing</>` instead of a plain string.
 */
function extractText(node: unknown): string {
  if (typeof node === 'string') return node.trim();
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = extractText(child);
      if (found) return found;
    }
  }
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: unknown } }).props;
    if (props && 'children' in props) return extractText(props.children);
  }
  return '';
}

/**
 * Returns true when this Link is the FIRST registered focusable in the menubar
 * AND no item is currently focused. Same logic as `Trigger`'s
 * `useIsFirstItem` — bootstrap the roving tabindex on first paint so Tab can
 * land in the menubar.
 */
function useIsFirstFocusable(
  ctx: ReturnType<typeof useNavigationMenuContext>,
  itemId: string | undefined,
): boolean {
  if (!itemId) return false;
  const items = ctx.getOrderedItems();
  const first = items.find((rec) => !rec.disabled);
  return first?.id === itemId;
}