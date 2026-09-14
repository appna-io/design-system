import type { CSSProperties, ImgHTMLAttributes, ReactNode, Ref } from 'react';
import type { Sx } from '@apx-ui/engine';

/** Object-fit behaviour inside the reserved box. */
export type ImageFit = 'cover' | 'contain';

/** Token-mapped corner radius scale. */
export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Token-mapped elevation scale. */
export type ImageShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Hover treatment.
 *
 * - `'none'` — the default, and the only value that leaves the DOM as a bare `<img>`.
 * - `'zoom'` — the image scales to 1.04 *inside* a fixed frame, so the layout never moves.
 * - `'lift'` — the whole frame rises 4px and gains an elevation step.
 *
 * Both effects are inert on touch: `:hover` latches after a tap there and never releases, so an
 * uncorrected zoom would stay engaged for the rest of the session with no gesture to undo it.
 */
export type ImageHoverEffect = 'none' | 'zoom' | 'lift';

/**
 * Every optional prop is written `?: T | undefined` rather than bare `?: T`.
 *
 * The workspace compiles with `exactOptionalPropertyTypes`, under which a bare `?:` means the key
 * may be *absent* but may not be *present and undefined*. That makes the natural call site a type
 * error — `hoverSrc={product.media.hoverSrc}` where the content type has it optional — and pushes
 * consumers into conditional spreads for a prop that is optional by design. The rest of the DS
 * already writes props this way; `Image` and `ThemeProviderProps` were the two outliers.
 */
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
  aspectRatio?: string | undefined;
  /** @default 'cover' */
  fit?: ImageFit | undefined;
  /** @default 'none' */
  radius?: ImageRadius | undefined;
  /** @default 'none' */
  shadow?: ImageShadow | undefined;
  /** Stretch to the container's width. @default true */
  fullWidth?: boolean | undefined;
  /**
   * Rendered in place of the image when the source fails to load. Keeps the same box
   * (radius / shadow / aspect-ratio) so the layout holds.
   */
  fallback?: ReactNode | undefined;
  /** Native loading hint. @default 'lazy' */
  loading?: 'lazy' | 'eager' | undefined;
  /**
   * Hover treatment. Anything other than `'none'` wraps the image in a frame element that owns
   * the box (radius, shadow, aspect ratio) so a zoom can be clipped and cannot reflow the page.
   *
   * @default 'none'
   */
  hoverEffect?: ImageHoverEffect | undefined;
  /**
   * A second source that cross-fades in on hover — the product-grid "show the back of the shirt"
   * pattern.
   *
   * It is fetched on **first hover**, not on mount: a grid of 24 products would otherwise double
   * its image payload for an interaction most visitors never perform. Like `hoverEffect`, it does
   * nothing on touch.
   *
   * Purely presentational, so it takes no `alt` of its own — it is rendered `aria-hidden`, and the
   * `alt` on the primary source describes the subject for both.
   */
  hoverSrc?: string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  /** Theme-aware inline style. */
  sx?: Sx | undefined;
  ref?: Ref<HTMLImageElement> | undefined;
}
