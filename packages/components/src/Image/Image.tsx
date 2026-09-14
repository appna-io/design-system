'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useState, type ForwardedRef, type ReactElement, type SyntheticEvent } from 'react';

import {
  imageFrameRecipe,
  imageHoverSrcRecipe,
  imageMediaRecipe,
  imageRecipe,
} from './Image.recipe';
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
    hoverEffect = 'none',
    hoverSrc,
    className,
    style,
    sx,
    onError,
    ...rest
  } = props;

  const [failed, setFailed] = useState(false);

  // `hoverSrc` is only mounted once the pointer has actually arrived. Rendering it up-front would
  // double the image payload of a product grid for an interaction most visitors never perform;
  // once mounted it stays, so the fade is instant on every subsequent hover.
  const [hoverSrcArmed, setHoverSrcArmed] = useState(false);

  // A frame is required for any hover treatment: `zoom` must be clipped by a box that does not
  // itself grow (or every card to the right of the cursor shifts), and `hoverSrc` needs a
  // positioned ancestor to stack the second image against.
  const framed = hoverEffect !== 'none' || hoverSrc !== undefined;

  const { className: themedClass, style: themedStyle } = useThemedClasses({
    recipe: imageRecipe,
    componentName: 'Image',
    props: { fit, radius, shadow, fullWidth, className, sx, style },
  });

  // Resolved unconditionally — rules of hooks. When `framed` is false these are a few
  // microseconds of class merging that nothing reads.
  const { className: frameClass, style: frameThemedStyle } = useThemedClasses({
    recipe: imageFrameRecipe,
    componentName: 'Image',
    slot: 'frame',
    props: { radius, shadow, fullWidth, hoverEffect, className, sx, style },
  });

  const { className: mediaClass } = useThemedClasses({
    recipe: imageMediaRecipe,
    componentName: 'Image',
    slot: 'media',
    props: { fit, hoverEffect },
  });

  const { className: hoverSrcClass } = useThemedClasses({
    recipe: imageHoverSrcRecipe,
    componentName: 'Image',
    slot: 'hoverSrc',
    props: { fit },
  });

  const boxStyle =
    aspectRatio !== undefined ? { aspectRatio, ...themedStyle } : themedStyle;

  // When framed, the aspect ratio belongs to the FRAME — it is the element that holds the layout
  // box. Leaving it on the image would let a zoom fight the reserved space.
  const frameStyle =
    aspectRatio !== undefined ? { aspectRatio, ...frameThemedStyle } : frameThemedStyle;

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

  if (!framed) {
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

  return (
    <span
      className={frameClass}
      style={frameStyle}
      // `group/image` is the named hover scope the zoom and cross-fade hang off. Named rather than
      // a bare `group` so an Image inside a consumer's own `group` — a product card that lifts as
      // a whole — reacts to its own frame, not to the card's.
      data-image-frame
      data-hover-effect={hoverEffect}
      // Mount the second source on the first pointer that arrives. `onPointerEnter` rather than
      // `onMouseEnter` so a stylus / precise pointer also arms it; touch never fires it, which is
      // the intent — the cross-fade is a hover affordance and does nothing there anyway.
      {...(hoverSrc !== undefined && !hoverSrcArmed
        ? { onPointerEnter: () => setHoverSrcArmed(true) }
        : {})}
    >
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={mediaClass}
        data-fit={fit}
        onError={handleError}
        {...rest}
      />
      {hoverSrc !== undefined && hoverSrcArmed ? (
        <img
          src={hoverSrc}
          // Presentational: it shows the same subject the primary `alt` already describes, so
          // announcing it a second time would just be a duplicate in the a11y tree.
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className={hoverSrcClass}
          data-image-hover-src
        />
      ) : null}
    </span>
  );
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(ImageImpl, 'Image');
