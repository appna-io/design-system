import type { HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Stylistic family — describes how the **fallback tile** looks. When an `src` resolves the image
 * paints over the tile, so loaded avatars look identical across variants (modulo `outline`'s
 * border, which stays as a brand ring).
 */
export type AvatarVariant = 'solid' | 'outline' | 'soft';

/**
 * Six sizes — broader than Badge or Button because real product surfaces range from list-cell
 * glyphs (`xs`) to hero profile photos (`2xl`).
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Border-radius family. `circle` is the conventional avatar look; `rounded` and `square` exist
 * for product surfaces that opt for sharper geometry (Notion-style mention chips, gaming UIs).
 */
export type AvatarShape = 'circle' | 'rounded' | 'square';

/**
 * Palette roles the recipe understands. Includes the `'auto'` sentinel, which is resolved to one
 * of the seven hashable roles at render time by `hashColor(name)`.
 */
export type AvatarColor =
  | 'auto'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** Internal helper type — the palette roles `hashColor` can actually emit (no `'auto'`). */
export type AvatarHashableColor = Exclude<AvatarColor, 'auto'>;

/**
 * Accent ring outside the avatar's circle. Sits in the offset gap, distinct from `variant`'s
 * border. Useful for "active speaker" / "current user" patterns.
 */
export type AvatarRing =
  | 'none'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** Semantic presence status. Maps to palette roles internally (`online → success`, …). */
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

/** Corner the status dot occupies. Physical placements — they do *not* mirror in RTL on purpose. */
export type AvatarStatusPlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** Primary image source. Omit to render initials / icon fallback. */
  src?: string | undefined;
  /** Optional density set forwarded to the underlying `<img>`. */
  srcSet?: string | undefined;
  /**
   * Accessible label override. Defaults to `name` when omitted. The label sits on the wrapper
   * `<span role="img">`; the inner `<img>` always has `alt=""` to avoid double announcement.
   */
  alt?: string | undefined;
  /**
   * Person/entity name. Drives initials, the deterministic color hash (when `color="auto"`),
   * and the default `aria-label`.
   */
  name?: string | undefined;
  /** Stylistic family. @default 'solid' */
  variant?: ResponsiveValue<AvatarVariant> | undefined;
  /** Visual diameter + initials font size + status-dot/icon size. @default 'md' */
  size?: ResponsiveValue<AvatarSize> | undefined;
  /**
   * Palette role for the fallback tile. `'auto'` deterministically hashes `name` into one of the
   * seven roles so a person consistently lands on the same color across the app. @default 'auto'
   */
  color?: AvatarColor | undefined;
  /** Border-radius family. @default 'circle' */
  shape?: AvatarShape | undefined;
  /** Accent ring color (sits outside the circle in the offset gap). @default 'none' */
  ring?: AvatarRing | undefined;
  /** Custom fallback icon used when there is neither `src` nor a usable `name`. */
  fallbackIcon?: ReactNode;
  /**
   * Milliseconds to wait before painting the initials/icon fallback while an `src` is loading.
   * Avoids the "initials → image" flash on fast connections. Set to 0 to disable. @default 600
   */
  delayMs?: number | undefined;
  /** Optional presence status — renders a small colored dot in the chosen corner. */
  status?: AvatarStatus | undefined;
  /** Corner the status dot is anchored to. @default 'bottom-right' */
  statusPlacement?: AvatarStatusPlacement | undefined;
  /**
   * Radix-style polymorphism. When `true`, Avatar merges its props/className/ref onto the single
   * child element (e.g. wrap an `<a>` to render a clickable profile avatar).
   */
  asChild?: boolean | undefined;
  /**
   * Optional label rendered below the avatar. When provided, Avatar auto-wraps itself in a flex
   * column container with the label as a `<Typography variant="caption">` underneath. Omit to
   * render just the avatar (original behavior preserved). Incompatible with `asChild`.
   */
  label?: ReactNode | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Render at most this many child Avatars; collapse the rest into a single "+N" overflow tile.
   * Omit to render every child as-is.
   */
  max?: number | undefined;
  /** Propagates as the default `size` for every child Avatar. Per-child props still win. */
  size?: AvatarSize | undefined;
  /** Propagates as the default `shape`. */
  shape?: AvatarShape | undefined;
  /** Propagates as the default `variant`. */
  variant?: AvatarVariant | undefined;
  /**
   * Overlap amount in spacing-token units. Negative values overlap the avatars (default behavior
   * for stacked-faces). Positive values create a gap between them. @default -2
   */
  spacing?: number | undefined;
  /**
   * Whether the overflow tile shows the **remaining count** (`'count'`, default) or a literal
   * **ellipsis** (`'ellipsis'`). Consumers that don't want to expose group size pick `ellipsis`.
   * @default 'count'
   */
  overflowMode?: 'count' | 'ellipsis' | undefined;
  /**
   * Custom render for the overflow tile. Receives the overflow count; return any React node. Use
   * for "+12 more" patterns or to wrap the tile in a tooltip / popover.
   */
  renderOverflow?: ((overflow: number) => ReactNode) | undefined;
}

/** Context shape consumed by individual `<Avatar>` instances inside an `<AvatarGroup>`. */
export interface AvatarGroupContextValue {
  size?: AvatarSize | undefined;
  shape?: AvatarShape | undefined;
  variant?: AvatarVariant | undefined;
}