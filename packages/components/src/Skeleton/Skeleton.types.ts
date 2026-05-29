import type { HTMLAttributes } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Visual fill family. `solid` paints with the theme's neutral subtle background; `soft` tints with
 * the chosen `color` role's subtle. Two variants is enough — Skeleton is decorative chrome and
 * shouldn't compete with primary surfaces.
 */
export type SkeletonVariant = 'solid' | 'soft';

/**
 * Animation style. `shimmer` is the modern left-to-right gradient sweep, `pulse` is the classic
 * opacity blink, `none` is fully static (useful for nested compositions / reduced-motion-by-default
 * pages). `prefers-reduced-motion` halts all three automatically.
 */
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';

/** Corner radius family. `md` is the default — matches the body-text loading-rectangle convention. */
export type SkeletonRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';

/**
 * Semantic palette role driving the tint when `variant="soft"`. `neutral` is the universal default;
 * other roles are useful for brand-immersive splash screens.
 */
export type SkeletonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Avatar-aligned size tokens. The string keys map 1:1 to `<Avatar size>` so a skeleton-then-avatar
 * swap is a zero-jank operation. Numeric sizes drop straight to pixels.
 */
export type SkeletonAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** CSS width. Number coerces to px. Strings pass through (`'100%'`, `'24ch'`, etc.). */
  width?: string | number | undefined;
  /** CSS height. Number coerces to px. */
  height?: string | number | undefined;
  /** Corner radius family. @default 'md' */
  rounded?: SkeletonRounded | undefined;
  /** Animation style. @default 'shimmer' */
  animation?: SkeletonAnimation | undefined;
  /** Stylistic family. @default 'solid' */
  variant?: ResponsiveValue<SkeletonVariant> | undefined;
  /** Semantic palette role. Only visible when `variant="soft"`. @default 'neutral' */
  color?: ResponsiveValue<SkeletonColor> | undefined;
  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
}

export interface SkeletonTextProps extends Omit<SkeletonProps, 'width'> {
  /** Number of placeholder lines. @default 3 */
  lines?: number | undefined;
  /** Vertical gap between lines. @default 'md' */
  spacing?: 'sm' | 'md' | 'lg' | undefined;
  /**
   * Width of the **last** line. Typographic convention is to shorten the last line so the block
   * reads as natural prose rather than an obvious rectangle. @default '60%'
   */
  lastLineWidth?: string | number | undefined;
}

export interface SkeletonAvatarProps
  extends Omit<SkeletonProps, 'width' | 'height' | 'rounded'> {
  /**
   * Diameter. String keys map 1:1 to `<Avatar size>`; numeric values drop straight to pixels.
   * @default 'md'
   */
  size?: SkeletonAvatarSize | undefined;
}
