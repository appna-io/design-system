'use client';

import { Slot, Slottable, forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { Children, isValidElement, type ReactNode } from 'react';

import { avatarRecipes } from './Avatar.recipe';
import { UserIcon } from './Avatar.icons';
import { useAvatarGroup } from './AvatarGroupContext';
import { hashColor } from './hashColor';
import { getInitials } from './initials';
import { useAvatarImage } from './useAvatarImage';
import { useFallbackDelay } from './useFallbackDelay';
import type {
  AvatarHashableColor,
  AvatarProps,
  AvatarSize,
  AvatarStatus,
} from './Avatar.types';

/**
 * User-identity glyph — the **first DS component whose rendered tree depends on async state**.
 * Three rendering branches live inside one component, gated by a tiny state machine
 * (`useAvatarImage`) and a debounce (`useFallbackDelay`) so the React tree stays simple:
 *
 *  - `'loaded'`  → paint the `<img>` (covers the fallback tile)
 *  - `'idle' | 'loading' | 'error'` + debounce elapsed → paint initials / icon
 *  - `'loading'` before the debounce → paint nothing (avoids initials-flicker on fast networks)
 *
 * `<Avatar>` doubles as the **stack tile** for `<AvatarGroup>`: the overflow "+N" indicator is
 * just `<Avatar name="+3" color="neutral" />`, so the entire group composition has one render
 * path. The `getInitials` helper handles the "+N" pass-through so this stays DRY.
 *
 * @example
 *   <Avatar src="…/me.jpg" name="Ada Lovelace" />
 *   <Avatar name="Ada Lovelace" variant="soft" /> // initials only
 *   <Avatar src="broken.jpg" name="Ada" /> // shows initials after onerror
 *   <Avatar name="Ada" status="online" ring="primary" />
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(props, ref) {
  const group = useAvatarGroup();

  const {
    src,
    srcSet,
    alt,
    name,
    variant = group?.variant ?? 'solid',
    size = group?.size ?? 'md',
    color = 'auto',
    shape = group?.shape ?? 'circle',
    ring = 'none',
    fallbackIcon,
    delayMs = 600,
    status,
    statusPlacement = 'bottom-right',
    asChild = false,
    label,
    className,
    style,
    sx,
    children,
    'aria-label': ariaLabel,
    ...rest
  } = props;

  // Resolve `'auto'` → palette role before the recipe sees it so compound rules match a real key.
  const resolvedColor: AvatarHashableColor = color === 'auto' ? hashColor(name) : color;
  const initials = getInitials(name);

  const imageState = useAvatarImage(src);
  // Only debounce the fallback while we're *actually* waiting on an image. Without `src`, or once
  // the image has errored, the fallback is the final state — paint it immediately.
  const isWaitingForImage = Boolean(src) && imageState === 'loading';
  const canShowFallback = useFallbackDelay(isWaitingForImage ? delayMs : 0);

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: avatarRecipes.root,
    componentName: 'Avatar',
    slot: 'root',
    props: {
      variant,
      size,
      color: resolvedColor,
      shape,
      ring,
      className,
      sx,
      style,
    },
  });

  const effectiveSize = resolveBaseSize(size);
  const accessibleLabel = alt ?? name ?? 'avatar';

  // Render rules: image once loaded, fallback once delay has elapsed, never both at once. The
  // `<img>` keeps `alt=""` because the wrapper carries the accessible name (avoids double SR
  // announcement of the same person).
  const showImage = Boolean(src) && imageState === 'loaded';
  const showFallback = !showImage && canShowFallback;

  const fallbackNode = showFallback ? (
    <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {renderFallbackContent(initials, fallbackIcon, effectiveSize)}
    </span>
  ) : null;

  const imageNode = showImage ? (
    <img
      src={src}
      srcSet={srcSet}
      alt=""
      className="absolute inset-0 size-full rounded-[inherit] object-cover transition-opacity duration-fast ease-standard motion-reduce:transition-none"
    />
  ) : null;

  const statusNode = status ? (
    <StatusDot size={effectiveSize} placement={statusPlacement} tone={status} />
  ) : null;

  const styleProp = rootStyle ?? undefined;

  if (asChild) {
    // Slot pattern: the user-provided element (passed via `children`) becomes the rendered
    // outer node; everything wrapped in `<Slottable>` is replaced inline with that element, and
    // the remaining siblings (image / fallback / status) end up *inside* it. The final DOM is
    // therefore `<a><img? /><fallback? /><status? /></a>` — same as the non-asChild branch but
    // with `<span>` swapped for whatever the consumer passed.
    //
    // **No `role="img"` here.** The wrapped element (e.g. `<a>`, `<button>`) already carries its
    // own native role and forcing `role="img"` would fail axe's `aria-allowed-role`. The
    // `aria-label` we copy across still gives the link/button a meaningful accessible name.
    
    // Filter to get only the valid React element (ignores whitespace text nodes from JSX)
    const slotChild = Children.toArray(children).find(isValidElement);
    
    return (
      <Slot
        ref={ref}
        className={rootClass}
        style={styleProp}
        aria-label={ariaLabel ?? accessibleLabel}
        data-variant={typeof variant === 'string' ? variant : 'solid'}
        data-color={resolvedColor}
        data-loaded={showImage ? 'true' : undefined}
        {...rest}
      >
        <Slottable>{slotChild}</Slottable>
        <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
          {imageNode}
          {fallbackNode}
        </span>
        {statusNode}
      </Slot>
    );
  }

  const avatarElement = (
    <span
      ref={ref}
      className={rootClass}
      style={styleProp}
      role="img"
      aria-label={ariaLabel ?? accessibleLabel}
      data-variant={typeof variant === 'string' ? variant : 'solid'}
      data-color={resolvedColor}
      data-loaded={showImage ? 'true' : undefined}
      {...rest}
    >
      <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
        {imageNode}
        {fallbackNode}
        {children}
      </span>
      {statusNode}
    </span>
  );

  // Optional label wrapper. When `label` is provided, render the avatar inside a flex column
  // with the label as a caption underneath. Without `label`, return the avatar as-is so existing
  // call sites and layouts are untouched.
  if (label !== undefined && label !== null && label !== false && label !== '') {
    return (
      <span className="inline-flex flex-col items-center gap-2 align-middle">
        {avatarElement}
        <span className="text-xs text-fg-muted text-center leading-snug">{label}</span>
      </span>
    );
  }

  return avatarElement;
}, 'Avatar');

interface StatusDotProps {
  size: AvatarSize;
  placement: NonNullable<AvatarProps['statusPlacement']>;
  tone: AvatarStatus;
}

function StatusDot({ size, placement, tone }: StatusDotProps) {
  const { className } = useThemedClasses({
    recipe: avatarRecipes.status,
    componentName: 'Avatar',
    slot: 'status',
    props: { size, placement, tone },
  });
  return <span aria-hidden="true" className={className} data-status={tone} />;
}

const FALLBACK_ICON_SIZE: Record<AvatarSize, string> = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
  '2xl': 'size-12',
};

function renderFallbackContent(
  initials: string,
  custom: ReactNode | undefined,
  size: AvatarSize,
): ReactNode {
  if (initials) return initials;
  if (custom != null) return custom;
  return <UserIcon className={`${FALLBACK_ICON_SIZE[size]} text-current opacity-80`} />;
}

/**
 * Resolve a responsive `size` value to its non-responsive base. The status dot and fallback-icon
 * sizing both need a single concrete size token per render — we don't pay for a media-query-aware
 * resolution here because the wrapper recipe already covers responsive sizing of the *avatar*
 * itself, and the dot+icon ride along visually via the wrapper's box dimensions on each
 * breakpoint.
 */
function resolveBaseSize(value: AvatarProps['size']): AvatarSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, AvatarSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? obj.xl ?? obj['2xl'] ?? 'md';
  }
  return 'md';
}