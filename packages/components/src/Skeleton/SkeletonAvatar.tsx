'use client';

import { forwardRef } from '@apx-ui/engine';

import { Skeleton } from './Skeleton';
import type { SkeletonAvatarProps, SkeletonAvatarSize } from './Skeleton.types';

/**
 * Diameter table mirrored 1:1 from `<Avatar>` (Phase 13). The pixel values come from Tailwind's
 * `size-*` utilities so `<SkeletonAvatar size="md">` is byte-identical in space to
 * `<Avatar size="md">` — replacing one with the other on data arrival is a zero-jank swap.
 *
 * Numeric `size` drops straight to px; tokens go through this map.
 */
export const SKELETON_AVATAR_SIZE_PX: Record<Exclude<SkeletonAvatarSize, number>, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 96,
};

/**
 * Circular placeholder sized to match `<Avatar>` exactly. Pure composition over `<Skeleton>` with
 * `rounded="full"` and `<Avatar>`-aligned dimensions.
 *
 * @example
 *   <SkeletonAvatar />            // size="md" → 40×40
 *   <SkeletonAvatar size="xl" />  // 64×64, matches <Avatar size="xl">
 *   <SkeletonAvatar size={48} />  // 48×48, numeric escape hatch
 */
export const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  function SkeletonAvatar(props, ref) {
    const { size = 'md', ...rest } = props;
    const diameter = typeof size === 'number' ? size : SKELETON_AVATAR_SIZE_PX[size];
    return <Skeleton ref={ref} width={diameter} height={diameter} rounded="full" {...rest} />;
  },
  'SkeletonAvatar',
);