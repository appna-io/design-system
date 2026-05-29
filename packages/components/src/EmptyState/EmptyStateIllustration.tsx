'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { emptyStateRecipes } from './EmptyState.recipe';
import { useEmptyStateContext } from './EmptyStateContext';
import type { EmptyStateIllustrationProps } from './EmptyState.types';

/**
 * Larger graphic container. Caps at a size-dependent max-width (120 / 200 / 320 px) so the
 * illustration stays focused on the empty surface and never blows out the layout. Consumers pass
 * any `ReactNode` (`<img>`, inline `<svg>`, a CSS-art component) and the container handles the
 * sizing + centering.
 *
 * Decorative by default — wrapper carries `aria-hidden="true"`. The Title is the accessible
 * label for the region.
 */
export const EmptyStateIllustration = forwardRef<
  HTMLDivElement,
  EmptyStateIllustrationProps
>(function EmptyStateIllustration(props, ref) {
  const { className, style, sx, children, ...rest } = props;
  const { size } = useEmptyStateContext();

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: emptyStateRecipes.illustration,
    componentName: 'EmptyState',
    slot: 'illustration',
    props: { size, className, sx, style },
  });

  return (
    <div ref={ref} aria-hidden="true" className={cls} style={rootStyle} {...rest}>
      {children}
    </div>
  );
}, 'EmptyState.Illustration');
