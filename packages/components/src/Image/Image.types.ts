import type { CSSProperties, ImgHTMLAttributes, ReactNode, Ref } from 'react';
import type { Sx } from '@apx-ui/engine';

/** Object-fit behaviour inside the reserved box. */
export type ImageFit = 'cover' | 'contain';

/** Token-mapped corner radius scale. */
export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Token-mapped elevation scale. */
export type ImageShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'style' | 'className'> {
  /** Image source URL. */
  src: string;
  /**
   * Accessible description. REQUIRED so authors make an explicit call — pass an empty string
   * (`alt=""`) only for purely decorative imagery, which also removes it from the a11y tree.
   */
  alt: string;
  /**
   * CSS `aspect-ratio` (e.g. `'4/3'`, `'16/9'`, `'1/1'`). Reserves the box before the image
   * loads, so layout never shifts. Omit to use the intrinsic ratio.
   */
  aspectRatio?: string;
  /** @default 'cover' */
  fit?: ImageFit;
  /** @default 'none' */
  radius?: ImageRadius;
  /** @default 'none' */
  shadow?: ImageShadow;
  /** Stretch to the container's width. @default true */
  fullWidth?: boolean;
  /**
   * Rendered in place of the image when the source fails to load. Keeps the same box
   * (radius / shadow / aspect-ratio) so the layout holds.
   */
  fallback?: ReactNode;
  /** Native loading hint. @default 'lazy' */
  loading?: 'lazy' | 'eager';
  className?: string;
  style?: CSSProperties;
  /** Theme-aware inline style. */
  sx?: Sx;
  ref?: Ref<HTMLImageElement>;
}
