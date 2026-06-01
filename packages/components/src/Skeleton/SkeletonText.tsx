'use client';

import { forwardRef } from '@apx-ui/engine';

import { Skeleton } from './Skeleton';
import type { SkeletonTextProps } from './Skeleton.types';

const SPACING_CLASS = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-3',
} as const;

/**
 * Multi-line text placeholder. Spawns N `<Skeleton>` lines vertically and shortens the last one
 * (default 60%) so the block reads as natural prose rather than an obvious rectangle. All visual
 * props (`rounded`, `animation`, `variant`, `color`, `height`) pass through to every line, so a
 * single `<SkeletonText animation="pulse" />` retunes the whole paragraph.
 *
 * Accessibility: only the outer wrapper carries `role="status" aria-label="Loading"`. Each inner
 * `<Skeleton>` line is `aria-hidden` so screen readers announce the loading state once.
 *
 * @example
 *   <SkeletonText lines={4} />
 *   <SkeletonText lines={2} spacing="lg" lastLineWidth="40%" height={20} />
 */
export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(function SkeletonText(
  props,
  ref,
) {
  const {
    lines = 3,
    spacing = 'md',
    lastLineWidth = '60%',
    height = 14,
    rounded,
    animation,
    variant,
    color,
    className,
    style,
    sx,
    'aria-label': ariaLabel,
    ...rest
  } = props;

  const safeLines = Math.max(1, Math.floor(lines));
  const gapClass = SPACING_CLASS[spacing] ?? SPACING_CLASS.md;
  const wrapperClass = ['flex flex-col', gapClass, className ?? ''].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      role="status"
      aria-label={ariaLabel ?? 'Loading'}
      className={wrapperClass}
      style={style}
      data-sds-skeleton-text=""
      {...rest}
    >
      {Array.from({ length: safeLines }, (_, i) => {
        const isLast = i === safeLines - 1;
        const lineWidth = isLast && safeLines > 1 ? lastLineWidth : '100%';
        return (
          <Skeleton
            key={i}
            width={lineWidth}
            height={height}
            rounded={rounded}
            animation={animation}
            variant={variant}
            color={color}
            sx={sx}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}, 'SkeletonText');