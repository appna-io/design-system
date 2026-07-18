'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useState, type ForwardedRef, type ReactElement, type SyntheticEvent } from 'react';

import { imageRecipe } from './Image.recipe';
import type { ImageProps } from './Image.types';

/**
 * `<Image />` — the content-imagery primitive. Sections and app surfaces render pictures
 * through this instead of a raw `<img>`, so radius / shadow / fit stay on the token scales
 * and a broken source degrades to a `fallback` slot instead of the browser's broken-image
 * glyph.
 *
 *  - **Layout stability**: `aspectRatio` reserves the box before (and after) load — no CLS.
 *  - **A11y**: `alt` is required at the type level; `alt=""` opts a decorative image out of
 *    the accessibility tree (native `<img>` semantics — no extra ARIA needed).
 *  - **Failure path**: on `error`, the `fallback` node (if any) replaces the image inside a
 *    `role="img"` box that keeps the same classes, ratio and accessible name.
 */
function ImageImpl(props: ImageProps, ref: ForwardedRef<HTMLImageElement>): ReactElement {
  const {
    src,
    alt,
    aspectRatio,
    fit = 'cover',
    radius = 'none',
    shadow = 'none',
    fullWidth = true,
    fallback,
    loading = 'lazy',
    className,
    style,
    sx,
    onError,
    ...rest
  } = props;

  const [failed, setFailed] = useState(false);

  const { className: themedClass, style: themedStyle } = useThemedClasses({
    recipe: imageRecipe,
    componentName: 'Image',
    props: { fit, radius, shadow, fullWidth, className, sx, style },
  });

  const boxStyle =
    aspectRatio !== undefined ? { aspectRatio, ...themedStyle } : themedStyle;

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    setFailed(true);
    onError?.(event);
  };

  if (failed && fallback !== undefined && fallback !== null) {
    // The fallback box keeps the image's accessible name unless the image was decorative
    // (`alt=""`), in which case it stays hidden from the a11y tree like the image it replaces.
    const decorative = alt === '';
    return (
      <span
        className={themedClass}
        style={{ display: 'block', ...boxStyle }}
        {...(decorative
          ? { 'aria-hidden': true as const }
          : { role: 'img', 'aria-label': alt })}
        data-image-fallback
      >
        {fallback}
      </span>
    );
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={themedClass}
      style={boxStyle}
      data-fit={fit}
      onError={handleError}
      {...rest}
    />
  );
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(ImageImpl, 'Image');
