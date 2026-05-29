'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { cardRecipes } from './Card.recipe';
import { useCardContext } from './CardContext';
import type { CardFooterProps } from './Card.types';

/**
 * Footer slot — typically holds the action row. `align` maps to a `justify-*` token so consumers
 * pick layout intent (`start` / `center` / `end` / `between`) instead of writing flex utilities
 * by hand.
 *
 * Default alignment is `'end'` because the action set in real-world cards almost always lives at
 * the trailing edge (Cancel / Save pattern). Override per-card when the layout calls for it.
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter(props, ref) {
    const { align, className, style, sx, children, ...rest } = props;
    const { size } = useCardContext();

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: cardRecipes.footer,
      componentName: 'Card',
      slot: 'footer',
      props: { size, align, className, sx, style },
    });

    return (
      <div ref={ref} className={cls} style={rootStyle ?? undefined} {...rest}>
        {children}
      </div>
    );
  },
  'Card.Footer',
);
