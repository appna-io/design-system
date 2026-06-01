'use client';

import { forwardRef, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { type CSSProperties } from 'react';

import { cardRecipes } from './Card.recipe';
import { useCardContext } from './CardContext';
import type { CardMediaProps } from './Card.types';

/**
 * Media slot — image or arbitrary children. Width-bounded in `vertical` Cards, width-fixed at
 * `2/5` of the row in `horizontal` Cards (the typical "image on the side" pattern). Orientation
 * is read from `CardContext` — the root sets it, the media respects it without prop drilling.
 *
 * When `src` is supplied, an `<img>` is rendered with `alt` straight onto the element. A dev-only
 * warning fires when `src` is set without `alt`, mirroring the lint rule for hand-authored
 * images. Pass arbitrary `children` to skip the `<img>` (e.g. a video / placeholder / iframe).
 */
export const CardMedia = forwardRef<HTMLDivElement, CardMediaProps>(
  function CardMedia(props, ref) {
    const { src, alt, aspectRatio, className, style, sx, children, ...rest } = props;
    const { orientation } = useCardContext();

    warn(
      !src || alt !== undefined,
      '<Card.Media src="…"> must include an `alt` prop. Pass an empty string `alt=""` for purely decorative imagery.',
      'CARD_MEDIA_NO_ALT',
    );

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: cardRecipes.media,
      componentName: 'Card',
      slot: 'media',
      props: { orientation, className, sx, style },
    });

    // `aspectRatio` is forwarded as the native CSS property so the browser handles the math —
    // works for any "W/H" string Tailwind doesn't ship a utility for.
    const composedStyle: CSSProperties = {
      ...(rootStyle ?? undefined),
      ...(aspectRatio ? { aspectRatio } : null),
    };

    return (
      <div ref={ref} className={cls} style={composedStyle} {...rest}>
        {src != null ? (
          <img src={src} alt={alt ?? ''} className="size-full object-cover" />
        ) : null}
        {children}
      </div>
    );
  },
  'Card.Media',
);