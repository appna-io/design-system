'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { breadcrumbsRecipes } from './Breadcrumbs.recipe';
import { useBreadcrumbsContext } from './BreadcrumbsContext';
import type { BreadcrumbsSeparatorProps } from './Breadcrumbs.types';

/**
 * Visual divider between crumbs. Carries `role="presentation"` + `aria-hidden="true"` so screen
 * readers don't read "slash, slash, slash" between every item — the structural `<ol>` already
 * conveys ordered navigation.
 *
 * Renders the root's `separator` content (`/` by default) unless the consumer passes their own
 * children. The element is a `<li>` so the surrounding `<ol>` stays valid HTML (a non-`<li>`
 * inside `<ol>` is a structural error and breaks assistive tech).
 */
export const BreadcrumbsSeparator = forwardRef<HTMLLIElement, BreadcrumbsSeparatorProps>(
  function BreadcrumbsSeparator(props, ref) {
    const ctx = useBreadcrumbsContext('Breadcrumbs.Separator');
    const { children, className, style, sx, ...rest } = props;

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: breadcrumbsRecipes.separator,
      componentName: 'Breadcrumbs',
      slot: 'separator',
      props: { color: ctx.separatorColor, className, sx, style },
    });

    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        data-breadcrumbs-separator=""
        className={cls}
        style={rootStyle ?? undefined}
        {...rest}
      >
        {children ?? ctx.separator}
      </li>
    );
  },
  'Breadcrumbs.Separator',
);