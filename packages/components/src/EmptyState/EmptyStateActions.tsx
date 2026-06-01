'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { emptyStateRecipes } from './EmptyState.recipe';
import { useEmptyStateContext } from './EmptyStateContext';
import type { EmptyStateActionsProps } from './EmptyState.types';

/**
 * Row container for the empty state's call-to-action buttons. Wraps to a new line on narrow
 * viewports via `flex-wrap`. Alignment follows the root's `align` token so a `start`-aligned
 * EmptyState keeps its buttons left-aligned too.
 *
 * Consumers pass `<Button>` (or `<Button asChild><a/>` for links) children directly. Two CTAs is
 * the recommended max — empty states should make the "next step" obvious, not present a menu.
 */
export const EmptyStateActions = forwardRef<HTMLDivElement, EmptyStateActionsProps>(
  function EmptyStateActions(props, ref) {
    const { className, style, sx, children, ...rest } = props;
    const { align } = useEmptyStateContext();

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: emptyStateRecipes.actions,
      componentName: 'EmptyState',
      slot: 'actions',
      props: { align, className, sx, style },
    });

    return (
      <div ref={ref} className={cls} style={rootStyle} {...rest}>
        {children}
      </div>
    );
  },
  'EmptyState.Actions',
);