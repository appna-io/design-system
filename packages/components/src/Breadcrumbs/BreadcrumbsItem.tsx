'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { cloneElement, isValidElement, type ReactElement } from 'react';

import { breadcrumbsRecipes } from './Breadcrumbs.recipe';
import { useBreadcrumbsContext } from './BreadcrumbsContext';
import type { BreadcrumbsItemProps } from './Breadcrumbs.types';

/**
 * A single crumb. Renders an `<li>` wrapping either a `<span>` (for current page / plain text)
 * or whatever element the consumer provides via `asChild` (typically a router `<Link>`).
 *
 * The `current` state paints differently (no link affordance) and applies `aria-current="page"`
 * to the inner content node — that's the ARIA Authoring Practices recommendation for breadcrumbs.
 *
 * `asChild` flows through engine `<Slot>` so the className + ref merge into the single child
 * element. The Slot wrapper means consumers can pass `<a>`, `<Link>`, `<NavLink>`, etc. and the
 * crumb's recipe class string lands on the actual link, not a wrapping div.
 */
export const BreadcrumbsItem = forwardRef<HTMLLIElement, BreadcrumbsItemProps>(
  function BreadcrumbsItem(props, ref) {
    const ctx = useBreadcrumbsContext('Breadcrumbs.Item');
    const {
      asChild = false,
      current = false,
      icon,
      className,
      style,
      sx,
      children,
      ...rest
    } = props;

    const { className: contentCls, style: contentStyle } = useThemedClasses({
      recipe: breadcrumbsRecipes.item,
      componentName: 'Breadcrumbs',
      slot: 'item',
      props: {
        variant: ctx.variant,
        color: ctx.color,
        state: current ? 'current' : 'link',
        className,
        sx,
        style,
      },
    });

    const ariaCurrent = current ? ('page' as const) : undefined;

    let content: ReactElement;
    if (asChild && isValidElement(children)) {
      // Slot path: merge the recipe className + aria-current onto the user's child element. We
      // bypass <Slot> here because we want to ALSO render `icon` alongside the child's content,
      // not just clone with merged props — cloning lets us inject icon + slottable children in
      // one pass while keeping the child element's tag (`<a>` / `<Link>`).
      const child = children as ReactElement<{
        className?: string;
        children?: React.ReactNode;
      }>;
      const mergedClassName = [child.props.className, contentCls].filter(Boolean).join(' ');
      content = cloneElement(child, {
        className: mergedClassName,
        'aria-current': ariaCurrent,
        children: (
          <>
            {icon != null ? (
              <span aria-hidden="true" className="inline-flex shrink-0 items-center">
                {icon}
              </span>
            ) : null}
            {child.props.children}
          </>
        ),
      } as Partial<typeof child.props> & { 'aria-current'?: 'page' });
    } else if (asChild) {
      // `asChild` with no valid element child — degrade to span + dev warning. We don't throw
      // because consumers might briefly hit this during conditional rendering.
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[apx-ds] <Breadcrumbs.Item asChild> expects a single React element child. Falling back to <span>.',
        );
      }
      content = (
        <span aria-current={ariaCurrent} className={contentCls} style={contentStyle ?? undefined}>
          {icon != null ? (
            <span aria-hidden="true" className="inline-flex shrink-0 items-center">
              {icon}
            </span>
          ) : null}
          {children}
        </span>
      );
    } else {
      // Default path: render a span (current page or plain text crumb). For interactive crumbs
      // consumers should pass `asChild` + an `<a>` / `<Link>`; the array API handles this for
      // them by wrapping `href`-bearing items in a native `<a>`.
      content = (
        <span aria-current={ariaCurrent} className={contentCls} style={contentStyle ?? undefined}>
          {icon != null ? (
            <span aria-hidden="true" className="inline-flex shrink-0 items-center">
              {icon}
            </span>
          ) : null}
          {children}
        </span>
      );
    }

    return (
      <li ref={ref} data-breadcrumbs-item="" data-current={current || undefined} {...rest}>
        {content}
      </li>
    );
  },
  'Breadcrumbs.Item',
);