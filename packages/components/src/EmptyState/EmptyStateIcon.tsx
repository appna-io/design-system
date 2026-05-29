'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { emptyStateRecipes } from './EmptyState.recipe';
import { useEmptyStateContext } from './EmptyStateContext';
import type { EmptyStateIconProps } from './EmptyState.types';

/**
 * Small leading glyph container. Pulls `size` + `variant` from `EmptyStateContext` so the icon
 * container tint tracks the root variant (default → neutral subtle, error → danger subtle,
 * success → success subtle, loading → neutral subtle). Children are typically a 24px SVG icon
 * (consumer's choice of icon library — common pick is `lucide-react`).
 *
 * `aria-hidden` defaults to `true` because the title / description / wrapper own the
 * announcement — the icon is decorative.
 */
export const EmptyStateIcon = forwardRef<HTMLDivElement, EmptyStateIconProps>(
  function EmptyStateIcon(props, ref) {
    const { className, style, sx, children, ...rest } = props;
    const { size, variant } = useEmptyStateContext();

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: emptyStateRecipes.icon,
      componentName: 'EmptyState',
      slot: 'icon',
      props: { size, variant, className, sx, style },
    });

    return (
      <div ref={ref} aria-hidden="true" className={cls} style={rootStyle} {...rest}>
        {children}
      </div>
    );
  },
  'EmptyState.Icon',
);
