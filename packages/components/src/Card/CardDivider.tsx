'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { cardRecipes } from './Card.recipe';
import type { CardDividerProps } from './Card.types';

/**
 * Thin horizontal rule used between Card sections. Renders as a semantic `<hr>` so screen
 * readers announce the break, with a single-pixel border-replacement background so the divider
 * stays crisp on high-DPI screens regardless of the user-agent's default `<hr>` styling.
 */
export const CardDivider = forwardRef<HTMLHRElement, CardDividerProps>(
  function CardDivider(props, ref) {
    const { className, style, sx, ...rest } = props;

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: cardRecipes.divider,
      componentName: 'Card',
      slot: 'divider',
      props: { className, sx, style },
    });

    return <hr ref={ref} className={cls} style={rootStyle ?? undefined} {...rest} />;
  },
  'Card.Divider',
);
