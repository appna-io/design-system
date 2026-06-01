'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { cardRecipes } from './Card.recipe';
import { useCardContext } from './CardContext';
import type { CardHeaderProps } from './Card.types';

/**
 * Header slot — three named regions arranged on a single row by default:
 *
 *   [avatar?]   [title + subtitle + children]   [action?]
 *
 * Opt into the **icon-led feature layout** by passing `icon` (and optionally `iconColor` /
 * `iconVariant`); the header flips to a column and renders an opinionated icon tile above the
 * title row:
 *
 *   [icon tile]
 *   [avatar?]   [title + subtitle + children]   [action?]
 *
 * The tile's size + corner radius scale with `CardContext.size`, and the title-to-icon gap is
 * proportional to the card density, so feature cards always read with the same icon → title → body
 * vertical rhythm regardless of card size.
 *
 * Renders `title` as a `<div>` (not an `<h3>`) on purpose: a Card can live anywhere in the page
 * outline, so the consumer must control heading level by passing `<h3>title</h3>` (or any other
 * tag) into the slot. Plain text falls back to a `<div>` and stays out of the document outline.
 *
 * Padding inherits from `CardContext.size` so consumers set density once at the root.
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader(props, ref) {
    const {
      title,
      subtitle,
      avatar,
      action,
      icon,
      iconColor = 'primary',
      iconVariant = 'soft',
      children,
      className,
      style,
      sx,
      ...rest
    } = props;
    const { size } = useCardContext();
    const hasIcon = icon != null;

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: cardRecipes.header,
      componentName: 'Card',
      slot: 'header',
      props: { size, withIcon: hasIcon, className, sx, style },
    });

    const { className: iconCls } = useThemedClasses({
      recipe: cardRecipes.headerIcon,
      componentName: 'Card',
      slot: 'headerIcon',
      props: { size, variant: iconVariant, color: iconColor },
    });

    const { className: rowCls } = useThemedClasses({
      recipe: cardRecipes.headerRow,
      componentName: 'Card',
      slot: 'headerRow',
      props: {},
    });

    const hasTextContent = title != null || subtitle != null || children != null;

    // Title row — the historical avatar + title + action layout. Factored out so both the legacy
    // (no-icon) and icon-led (column) code paths render an identical row underneath.
    const titleRow = (
      <>
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
      </>
    );

    if (hasIcon) {
      // Icon-led layout: tile on top, title row below. The outer container is `flex-col` (via
      // the `withIcon=true` recipe variant) so the tile is its own block; the inner row keeps
      // the avatar / title / action triplet on one line.
      return (
        <div
          ref={ref}
          className={cls}
          style={rootStyle ?? undefined}
          data-with-icon="true"
          {...rest}
        >
          <span className={iconCls} aria-hidden="true">
            {icon}
          </span>
          {hasTextContent || avatar != null || action != null ? (
            <div className={rowCls}>{titleRow}</div>
          ) : null}
        </div>
      );
    }

    return (
      <div ref={ref} className={cls} style={rootStyle ?? undefined} {...rest}>
        {titleRow}
      </div>
    );
  },
  'Card.Header',
);