'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { cardRecipes } from './Card.recipe';
import { useCardContext } from './CardContext';
import type { CardBodyProps } from './Card.types';

/**
 * Card content slot. A bare `<div>` styled with the active size's horizontal/bottom padding —
 * deliberately omits top padding so a preceding `<Card.Header>` (which already carries full
 * padding) doesn't double-pad the gap between sections.
 */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  function CardBody(props, ref) {
    const { className, style, sx, children, ...rest } = props;
    const { size } = useCardContext();

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: cardRecipes.body,
      componentName: 'Card',
      slot: 'body',
      props: { size, className, sx, style },
    });

    return (
      <div ref={ref} className={cls} style={rootStyle ?? undefined} {...rest}>
        {children}
      </div>
    );
  },
  'Card.Body',
);
