'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { MoreHorizontal } from 'lucide-react';
import { type ReactNode } from 'react';

import { Menu } from '../Menu';
import { breadcrumbsRecipes } from './Breadcrumbs.recipe';
import type { BreadcrumbsItem, BreadcrumbsSize } from './Breadcrumbs.types';

/**
 * Renders a single `<li>` containing a `<Menu>` whose trigger is an ellipsis button and whose
 * content is one `<Menu.Item>` per hidden crumb. Clicking a menu item navigates to that crumb's
 * `href` / `to` (or invokes the consumer-supplied `renderItem` if they want fully custom items).
 *
 * Menu is consumed as a black box — Breadcrumbs doesn't reach into Menu internals. If a hidden
 * crumb's `href` is missing the menu item still renders as a text-only entry (consistent with
 * the array API's behavior outside the overflow path).
 *
 * The plan also calls out a no-Menu fallback (inline `<span aria-hidden>…</span>`). In practice
 * Menu always ships from the same package and is a peer of Breadcrumbs in the bundle, so the
 * fallback is unreachable; we keep the structure simple instead of guarding for it.
 */
export interface BreadcrumbsOverflowProps {
  hidden: BreadcrumbsItem[];
  size: BreadcrumbsSize;
  ariaLabel: string;
  /** Override the default rendering of a menu item (mirrors `renderItem` from the root). */
  renderItem?: (item: BreadcrumbsItem, index: number) => ReactNode;
}

export function BreadcrumbsOverflow({
  hidden,
  size,
  ariaLabel,
  renderItem,
}: BreadcrumbsOverflowProps) {
  const { className: triggerCls } = useThemedClasses({
    recipe: breadcrumbsRecipes.overflowTrigger,
    componentName: 'Breadcrumbs',
    slot: 'overflowTrigger',
    props: { size },
  });

  return (
    <li data-breadcrumbs-overflow="">
      <Menu>
        <Menu.Trigger asChild>
          <button type="button" aria-label={ariaLabel} className={triggerCls}>
            <MoreHorizontal aria-hidden="true" />
          </button>
        </Menu.Trigger>
        <Menu.Content size={size === 'lg' ? 'md' : 'sm'}>
          {hidden.map((item, index) => {
            const href = item.href ?? item.to;
            const key = item.key ?? `${index}:${typeof item.label === 'string' ? item.label : ''}`;

            if (renderItem) {
              return (
                <Menu.Item key={key} onSelect={() => navigate(href)}>
                  {renderItem(item, index)}
                </Menu.Item>
              );
            }

            return (
              <Menu.Item key={key} onSelect={() => navigate(href)}>
                {item.icon != null ? (
                  <span aria-hidden="true" className="me-2 inline-flex shrink-0 items-center">
                    {item.icon}
                  </span>
                ) : null}
                {item.label}
              </Menu.Item>
            );
          })}
        </Menu.Content>
      </Menu>
    </li>
  );
}

/**
 * Best-effort navigation for hidden crumb selection. The Breadcrumbs primitive doesn't ship a
 * router, so when no consumer-supplied `renderItem` lands inside the menu we fall back to a
 * full-page navigation. Consumers who use a router should pass `renderItem` to wire their own
 * `<Link>` and `onSelect` semantics — that's the documented integration pattern.
 */
function navigate(href: string | undefined) {
  if (!href) return;
  if (typeof window === 'undefined') return;
  window.location.assign(href);
}
