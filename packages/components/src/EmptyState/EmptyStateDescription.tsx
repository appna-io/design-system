'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { emptyStateRecipes } from './EmptyState.recipe';
import { useEmptyStateContext } from './EmptyStateContext';
import type { EmptyStateDescriptionProps } from './EmptyState.types';

/**
 * Supporting text under the title. Caps at `max-w-md` so the line length stays readable even on
 * wide screens (the right call for empty-state copy, which is almost always a single sentence or
 * short paragraph).
 *
 * Rendered as `<p>` so the description is a real paragraph in the document outline — screen
 * readers using "next paragraph" navigation can land on it.
 */
export const EmptyStateDescription = forwardRef<
  HTMLParagraphElement,
  EmptyStateDescriptionProps
>(function EmptyStateDescription(props, ref) {
  const { className, style, sx, children, ...rest } = props;
  const { size } = useEmptyStateContext();

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: emptyStateRecipes.description,
    componentName: 'EmptyState',
    slot: 'description',
    props: { size, className, sx, style },
  });

  return (
    <p ref={ref} className={cls} style={rootStyle} {...rest}>
      {children}
    </p>
  );
}, 'EmptyState.Description');