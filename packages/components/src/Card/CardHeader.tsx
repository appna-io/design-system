'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { cardRecipes } from './Card.recipe';
import { useCardContext } from './CardContext';
import type { CardHeaderProps } from './Card.types';

/**
 * Header slot — three named regions arranged on a single row:
 *
 *   [avatar?]   [title + subtitle + children]   [action?]
 *
 * Renders `title` as a `<div>` (not an `<h3>`) on purpose: a Card can live anywhere in the page
 * outline, so the consumer must control heading level by passing `<h3>title</h3>` (or any other
 * tag) into the slot. Plain text falls back to a `<div>` and stays out of the document outline.
 *
 * Padding inherits from `CardContext.size` so consumers set density once at the root.
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader(props, ref) {
    const { title, subtitle, avatar, action, children, className, style, sx, ...rest } = props;
    const { size } = useCardContext();

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: cardRecipes.header,
      componentName: 'Card',
      slot: 'header',
      props: { size, className, sx, style },
    });

    const hasTextContent = title != null || subtitle != null || children != null;

    return (
      <div ref={ref} className={cls} style={rootStyle ?? undefined} {...rest}>
        {avatar != null ? <div className="shrink-0">{avatar}</div> : null}
        {hasTextContent ? (
          <div className="min-w-0 flex-1">
            {title != null ? (
              <div className="truncate font-semibold leading-snug text-fg-default">{title}</div>
            ) : null}
            {subtitle != null ? (
              <div className="truncate text-sm leading-snug text-fg-muted">{subtitle}</div>
            ) : null}
            {children}
          </div>
        ) : null}
        {action != null ? <div className="shrink-0">{action}</div> : null}
      </div>
    );
  },
  'Card.Header',
);
