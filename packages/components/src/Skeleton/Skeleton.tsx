'use client';

import type { CSSProperties } from 'react';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { SKELETON_SHIMMER_STYLE, skeletonRecipe } from './Skeleton.recipe';
import type { SkeletonAnimation, SkeletonProps } from './Skeleton.types';

/**
 * The canonical loading placeholder primitive. Pair `width` + `height` to claim layout space; the
 * shimmer / pulse animation reads as "content is on the way" without needing a Motion library.
 *
 * - `<Skeleton />` is single-slot, decorative, and `aria-hidden` on each line of `<SkeletonText>`.
 *   The root carries `role="status"` + `aria-label="Loading"` so screen readers announce the
 *   loading state once per region.
 * - Animations halt automatically under `prefers-reduced-motion` (a static low-opacity placeholder
 *   takes over via the `motion-reduce:` Tailwind variant).
 * - Sibling exports `<SkeletonText>` and `<SkeletonAvatar>` are pure compositions over this base —
 *   they don't re-implement the visual layer.
 *
 * @example
 *   <Skeleton width={120} height={20} />
 *   <Skeleton width="100%" height={200} rounded="lg" animation="pulse" />
 *   <Skeleton variant="soft" color="primary" width={200} height={32} />
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(props, ref) {
  const {
    width,
    height,
    rounded,
    animation = 'shimmer',
    variant,
    color,
    className,
    style,
    sx,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    role: roleProp,
    ...rest
  } = props;

  const { className: themedClass, style: themedStyle } = useThemedClasses({
    recipe: skeletonRecipe,
    componentName: 'Skeleton',
    props: { variant, rounded, color, className, sx, style },
  });

  const animationClass = animationToClass(animation);
  const finalClassName = animationClass ? `${themedClass} ${animationClass}` : themedClass;

  // Build the merged inline style: size props + shimmer gradient (only when shimmer is active) +
  // the theme-derived `style/sx` payload last so overrides win.
  const dimensionStyle = toDimensionStyle(width, height);
  const shimmerStyle = animation === 'shimmer' ? (SKELETON_SHIMMER_STYLE as CSSProperties) : undefined;
  const mergedStyle: CSSProperties | undefined = mergeStyles(
    dimensionStyle,
    shimmerStyle,
    themedStyle,
  );

  // When a consumer explicitly sets `aria-hidden`, respect it — SkeletonText passes
  // `aria-hidden="true"` on each inner line so only the wrapper announces.
  const isHidden = ariaHidden === true || ariaHidden === 'true';
  const role = roleProp ?? (isHidden ? undefined : 'status');
  const resolvedAriaLabel = isHidden ? undefined : (ariaLabel ?? 'Loading');

  return (
    <div
      ref={ref}
      data-animation={animation}
      data-variant={(variant as string | undefined) ?? 'solid'}
      role={role}
      aria-label={resolvedAriaLabel}
      aria-hidden={ariaHidden}
      className={finalClassName}
      style={mergedStyle}
      {...rest}
    />
  );
}, 'Skeleton');

function animationToClass(animation: SkeletonAnimation): string {
  switch (animation) {
    case 'shimmer':
      return 'animate-skeleton-shimmer motion-reduce:animate-none motion-reduce:opacity-70';
    case 'pulse':
      return 'animate-skeleton-pulse motion-reduce:animate-none motion-reduce:opacity-70';
    case 'none':
    default:
      return '';
  }
}

function toDimensionStyle(
  width: string | number | undefined,
  height: string | number | undefined,
): CSSProperties | undefined {
  if (width === undefined && height === undefined) return undefined;
  const out: CSSProperties = {};
  if (width !== undefined) out.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) out.height = typeof height === 'number' ? `${height}px` : height;
  return out;
}

function mergeStyles(
  ...layers: Array<CSSProperties | undefined>
): CSSProperties | undefined {
  const present = layers.filter((layer): layer is CSSProperties => layer !== undefined);
  if (present.length === 0) return undefined;
  return Object.assign({}, ...present);
}