'use client';

import { createElement } from 'react';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { emptyStateRecipes } from './EmptyState.recipe';
import { useEmptyStateContext } from './EmptyStateContext';
import type { EmptyStateTitleProps } from './EmptyState.types';

/**
 * Heading slot. `<h3>` by default — empty states almost always live inside a parent section /
 * page whose `<h2>` owns the page outline, so `<h3>` is the right default level. Override via
 * `as="h2"` (for top-of-page empty states) or `as="div"` (for inline use that mustn't appear in
 * the heading outline).
 *
 * Pulls `size` from context so typography scales with the root density token.
 */
export const EmptyStateTitle = forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(
  function EmptyStateTitle(props, ref) {
    const { as = 'h3', className, style, sx, children, ...rest } = props;
    const { size } = useEmptyStateContext();

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: emptyStateRecipes.title,
      componentName: 'EmptyState',
      slot: 'title',
      props: { size, className, sx, style },
    });

    return createElement(
      as,
      { ref, className: cls, style: rootStyle, ...rest },
      children,
    );
  },
  'EmptyState.Title',
);