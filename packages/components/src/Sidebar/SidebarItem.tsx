'use client';

import { Slot, Slottable, cn, forwardRef, useId } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from 'react';

import { Badge } from '../Badge/Badge';
import { Tooltip } from '../Tooltip/Tooltip';
import { isActiveHref } from './isActiveHref';
import { useSidebarContext } from './Sidebar.context';
import { sidebarItemRecipe } from './Sidebar.recipe';
import type { SidebarItemProps } from './Sidebar.types';
import { SidebarSubItems } from './SidebarSubItems';
import { useDisclosure } from './useDisclosure';

/**
 * `<Sidebar.Item>` — the primary atom of the sidebar.
 *
 * Renders as one of three element shapes, in priority order:
 *   1. `asChild` → the consumer's single child element gets all the styling + a11y attributes
 *      (router-link integration: `<RouterLink to="/foo">`).
 *   2. `href` (with or without `onClick`) → `<a>` (navigation target).
 *   3. neither `href` nor `asChild` → `<button>` (action handler).
 *
 * Active-state resolution:
 *   - If the consumer passes `active`, it wins (explicit override).
 *   - Otherwise, `isActiveHref({ current: ctx.activeHref, itemHref: href, strategy })` decides.
 *   - The active item gets `aria-current="page"` + the recipe's `state=active` styling.
 *
 * Rail mode (`ctx.collapsed`):
 *   - The label text becomes `sr-only` (still in the DOM, so SR announces it as the
 *     accessible name).
 *   - The Item is wrapped in a `<Tooltip content={label}>` so the visible cue on hover/focus
 *     is the label text itself.
 *   - The optional `endIcon` and `badge` visually hide (sr-only) to keep the rail clean.
 *
 * Expandable items (`expandable={true}`):
 *   - The item becomes the trigger for a disclosure on its `<Sidebar.SubItems>` child.
 *   - In that case, it's always a `<button aria-expanded>` (no `href`) — clicking a row-with-
 *     children is "expand", not "navigate". If consumers genuinely want both, they should add
 *     a child `<Sidebar.Item href>` at the top of the SubItems list.
 *
 * Disabled items:
 *   - Set `aria-disabled="true"` and `tabIndex={-1}`.
 *   - Click is captured + neutralized so consumers don't need to remember to check.
 */
export const SidebarItem = forwardRef<HTMLElement, SidebarItemProps>(function SidebarItem(
  props,
  ref,
) {
  const {
    children,
    icon,
    endIcon,
    badge,
    badgeColor = 'neutral',
    href,
    active: activeProp,
    expandable = false,
    defaultExpanded = false,
    expanded: expandedProp,
    onExpandedChange,
    variant = 'default',
    size: sizeProp,
    disabled = false,
    asChild = false,
    onClick,
    className,
    style,
    ...rest
  } = props;

  const ctx = useSidebarContext('Sidebar.Item');
  const size = sizeProp ?? ctx.itemSize;

  // Active resolution — explicit prop wins, otherwise compare against root's activeHref.
  const isActive =
    activeProp !== undefined
      ? activeProp
      : isActiveHref({
          current: ctx.activeHref,
          itemHref: href,
          strategy: ctx.activeMatchStrategy,
        });

  // Expandable disclosure state (only meaningful when `expandable={true}`).
  const { open: expanded, toggle: toggleExpanded } = useDisclosure({
    open: expandedProp,
    defaultOpen: defaultExpanded,
    onOpenChange: onExpandedChange,
  });

  // We split children into "label content" + a potential `<Sidebar.SubItems>` child so we can
  // render the disclosure body OUTSIDE the trigger element (the trigger must be a single
  // interactive element; subitems are siblings, not descendants).
  const { labelChildren, subItemsChild } = splitSubItems(children);

  const { className: itemClass, style: itemStyle } = useThemedClasses({
    recipe: sidebarItemRecipe,
    componentName: 'Sidebar.Item',
    props: {
      variant,
      size,
      state: isActive ? 'active' : 'inactive',
      collapsed: ctx.collapsed,
      disabled,
      className,
      style,
    },
  });

  // Stable id for the expandable disclosure's body, used for aria-controls.
  const subItemsId = useId();

  const labelNode: ReactNode = (
    <>
      {icon && (
        <span
          className="inline-flex shrink-0 items-center justify-center"
          aria-hidden="true"
          data-sidebar-item-icon=""
        >
          {icon}
        </span>
      )}
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-start',
          ctx.collapsed && 'sr-only',
        )}
        data-sidebar-item-label=""
      >
        {labelChildren}
      </span>
      {!ctx.collapsed && badge !== undefined && badge !== null && badge !== false && (
        <Badge size="sm" color={badgeColor} variant="soft">
          {badge}
        </Badge>
      )}
      {!ctx.collapsed && endIcon && (
        <span
          className="ms-auto inline-flex shrink-0 items-center"
          aria-hidden="true"
          data-sidebar-item-end-icon=""
        >
          {endIcon}
        </span>
      )}
      {expandable && !ctx.collapsed && (
        <span
          aria-hidden="true"
          className={cn(
            'ms-auto inline-flex h-3 w-3 items-center justify-center transition-transform duration-150',
            expanded ? 'rotate-90' : 'rotate-0',
          )}
          data-sidebar-item-chevron=""
        >
          <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06z" />
          </svg>
        </span>
      )}
      {/*
       * Screen-reader-only mirror of the badge content when the sidebar is in rail mode — the
       * visible badge collapses to sr-only, but the count is still announced via this hidden
       * span so users on AT know there are unread items.
       */}
      {ctx.collapsed && badge !== undefined && badge !== null && badge !== false && (
        <span className="sr-only">{badge}</span>
      )}
    </>
  );

  const sharedA11y: Record<string, unknown> = {
    'aria-current': isActive ? 'page' : undefined,
    'aria-disabled': disabled || undefined,
    tabIndex: disabled ? -1 : undefined,
    'data-active': isActive ? 'true' : undefined,
    'data-disabled': disabled ? 'true' : undefined,
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (expandable) {
      event.preventDefault();
      toggleExpanded();
    }
    onClick?.(event as MouseEvent<HTMLAnchorElement> & MouseEvent<HTMLButtonElement>);
  };

  const renderTrigger = (): ReactElement => {
    // asChild → consumer-driven element (router Link, etc.). We mark the consumer's element
    // with <Slottable> so Slot knows to clone IT and inject our chrome (icon / badge / chevron)
    // as siblings of the consumer's original children. The consumer's text becomes the label
    // in-place — we don't try to wrap it in a sr-only span, which means rail-mode hides the
    // entire item except the icon. The Tooltip still provides the hover/focus label cue.
    if (asChild) {
      // In asChild mode, we read the consumer's text from their element's children for the
      // Tooltip content (rail mode) — fallback to a generic label otherwise.
      return (
        <Slot
          ref={ref as React.ForwardedRef<HTMLElement>}
          className={itemClass}
          style={itemStyle ?? undefined}
          onClick={handleClick}
          {...sharedA11y}
          {...(rest as Record<string, unknown>)}
        >
          {icon && (
            <span
              className="inline-flex shrink-0 items-center justify-center"
              aria-hidden="true"
              data-sidebar-item-icon=""
            >
              {icon}
            </span>
          )}
          <Slottable>{labelChildren as ReactElement}</Slottable>
          {!ctx.collapsed && badge !== undefined && badge !== null && badge !== false && (
            <Badge size="sm" color={badgeColor} variant="soft">
              {badge}
            </Badge>
          )}
          {!ctx.collapsed && endIcon && (
            <span
              className="ms-auto inline-flex shrink-0 items-center"
              aria-hidden="true"
              data-sidebar-item-end-icon=""
            >
              {endIcon}
            </span>
          )}
          {ctx.collapsed && badge !== undefined && badge !== null && badge !== false && (
            <span className="sr-only">{badge}</span>
          )}
        </Slot>
      );
    }

    // Expandable rows are always buttons — clicking expands, doesn't navigate.
    if (expandable) {
      return (
        <button
          type="button"
          ref={ref as React.ForwardedRef<HTMLButtonElement>}
          className={itemClass}
          style={itemStyle ?? undefined}
          onClick={handleClick}
          aria-expanded={expanded}
          aria-controls={subItemsChild ? subItemsId : undefined}
          {...sharedA11y}
          {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {labelNode}
        </button>
      );
    }

    // Navigation target → anchor element.
    if (href !== undefined) {
      return (
        <a
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          href={href}
          className={itemClass}
          style={itemStyle ?? undefined}
          onClick={handleClick}
          {...sharedA11y}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {labelNode}
        </a>
      );
    }

    // Action item → button.
    return (
      <button
        type="button"
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        className={itemClass}
        style={itemStyle ?? undefined}
        onClick={handleClick}
        {...sharedA11y}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {labelNode}
      </button>
    );
  };

  const triggerElement = renderTrigger();

  // Wrap the trigger in a Tooltip when the sidebar is in rail mode AND there's a label to show.
  // Skip the tooltip when no label content (icon-only without children — Tooltip needs content).
  const hasLabelText = labelChildren !== undefined && labelChildren !== null && labelChildren !== false;
  const wrappedTrigger =
    ctx.collapsed && hasLabelText ? (
      <Tooltip content={labelChildren} placement="right" openDelay={250}>
        {triggerElement}
      </Tooltip>
    ) : (
      triggerElement
    );

  // If there are SubItems, render them as a sibling region clipped by the expanded disclosure
  // (same grid-template-rows mechanism as Section). Always pass through the subItemsId so the
  // trigger's aria-controls points at a real region.
  if (subItemsChild) {
    return (
      <div data-sidebar-item-wrapper="" data-expanded={expanded ? 'true' : 'false'}>
        {wrappedTrigger}
        <div
          id={subItemsId}
          className={cn(
            'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
            expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
          aria-hidden={!expanded || undefined}
        >
          <div className="min-h-0 overflow-hidden">{subItemsChild}</div>
        </div>
      </div>
    );
  }

  return wrappedTrigger;
}, 'Sidebar.Item');

/**
 * Walks `children` once and splits them into the label content (everything that's NOT a
 * `<Sidebar.SubItems>`) + the single SubItems child (if any). This lets the Item render
 * `labelChildren` inside the interactive trigger element while keeping `SubItems` as a
 * separate disclosure region — required for valid ARIA semantics (interactive elements
 * can't contain other interactive elements).
 */
function splitSubItems(children: ReactNode): {
  labelChildren: ReactNode;
  subItemsChild: ReactElement | null;
} {
  let subItemsChild: ReactElement | null = null;
  const labels: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child) && (child.type === SidebarSubItems)) {
      if (subItemsChild === null) {
        subItemsChild = cloneElement(child as ReactElement);
      }
      return;
    }
    labels.push(child);
  });

  // Unwrap single-child arrays so Tooltip / Slot don't choke on an array-of-one.
  const labelChildren: ReactNode = labels.length === 1 ? labels[0] : labels;
  return { labelChildren, subItemsChild };
}
