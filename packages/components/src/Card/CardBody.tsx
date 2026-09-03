'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { cardRecipes } from './Card.recipe';
import { useCardContext } from './CardContext';
import type { CardBodyProps } from './Card.types';

/**
 * Card content slot. A bare `<div>` styled with the active size's horizontal/bottom padding.
 *
 * Top padding is scoped to `:first-child`: a body that follows a `<Card.Header>` (which already
 * carries full padding) or a `<Card.Media>` (which must bleed to the body's edge) stays flush,
 * while a card composed of nothing but a `<Card.Body>` still gets even padding on all four
 * sides instead of rendering its content against the card's top border.
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