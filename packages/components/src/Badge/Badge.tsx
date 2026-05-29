'use client';

import { forwardRef, Slot, Slottable, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { badgeRecipe } from './Badge.recipe';
import { XIcon } from './Badge.icons';
import type { BadgeProps, BadgeSize } from './Badge.types';

/**
 * The smallest stylistic primitive in apx-ds. Used for status labels ("New", "Beta", "Live"),
 * counts ("12"), and tag-like chips. Four variants × seven colors × three sizes × three shapes =
 * 252 visual cells — the **purest stress test of the variant matrix** in the DS.
 *
 * Badge is single-slot (no `useThemedClasses` `slot` argument) and pulls no Motion library — the
 * optional dot pulse is a pure CSS keyframe shipped via the Tailwind preset. Bundle delta target:
 * < 1.5 KB gzipped.
 *
 * @example
 *   <Badge>Beta</Badge>
 *   <Badge variant="solid" color="success" withDot dotPulse>Live</Badge>
 *   <Badge removable onRemove={() => remove(id)}>{tag}</Badge>
 *   <Badge asChild color="info"><a href="/inbox">3</a></Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const {
    variant,
    size,
    color,
    shape,
    withDot = false,
    dotPulse = false,
    leftIcon,
    rightIcon,
    removable = false,
    onRemove,
    removeLabel,
    asChild = false,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  const { className: themedClass, style: themedStyle } = useThemedClasses({
    recipe: badgeRecipe,
    componentName: 'Badge',
    props: { variant, size, color, shape, className, sx, style },
  });

  const effectiveSize = resolveBaseSize(size);
  const childrenIsString = typeof children === 'string';
  const resolvedRemoveLabel =
    removeLabel ?? (childrenIsString ? `Remove ${children}` : 'Remove');

  warn(
    !removable || childrenIsString || Boolean(removeLabel),
    '<Badge removable> needs an accessible name. Pass `removeLabel` when `children` is not a plain string.',
    'BADGE_REMOVABLE_NO_LABEL',
  );

  const styleProp = themedStyle ?? undefined;
  const showLeftIcon = !withDot && leftIcon != null;
  const showRightIcon = !removable && rightIcon != null;

  const leadingSlot = withDot ? (
    <Dot size={effectiveSize} pulse={dotPulse} />
  ) : showLeftIcon ? (
    <span aria-hidden="true">{leftIcon}</span>
  ) : null;
  const trailingSlot = showRightIcon ? (
    <span aria-hidden="true">{rightIcon}</span>
  ) : removable ? (
    <RemoveButton size={effectiveSize} label={resolvedRemoveLabel} onRemove={onRemove} />
  ) : null;

  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={themedClass}
        style={styleProp}
        data-variant={variant ?? 'soft'}
        data-color={color ?? 'primary'}
        {...rest}
      >
        {leadingSlot}
        <Slottable>{children}</Slottable>
        {trailingSlot}
      </Slot>
    );
  }

  return (
    <span
      ref={ref}
      className={themedClass}
      style={styleProp}
      data-variant={variant ?? 'soft'}
      data-color={color ?? 'primary'}
      {...rest}
    >
      {leadingSlot}
      {children}
      {trailingSlot}
    </span>
  );
}, 'Badge');

interface DotProps {
  size: BadgeSize;
  pulse: boolean;
}

const DOT_SIZE_CLASS: Record<BadgeSize, string> = {
  sm: 'size-1.5',
  md: 'size-2',
  lg: 'size-2',
};

function Dot({ size, pulse }: DotProps) {
  // `sds-badge-dot` is the hook the `subtle` variant uses to color the dot independently of the
  // muted text color (see `Badge.recipe.ts` compound rules).
  const sizeClass = DOT_SIZE_CLASS[size];
  const pulseClass = pulse ? 'animate-badge-pulse motion-reduce:animate-none' : '';
  return (
    <span
      aria-hidden="true"
      className={`sds-badge-dot inline-block shrink-0 rounded-full bg-current ${sizeClass} ${pulseClass}`.trim()}
    />
  );
}

interface RemoveButtonProps {
  size: BadgeSize;
  label: string;
  onRemove: (() => void) | undefined;
}

const REMOVE_BUTTON_SIZE_CLASS: Record<BadgeSize, string> = {
  sm: 'size-3 -me-0.5',
  md: 'size-3.5 -me-0.5',
  lg: 'size-4 -me-1',
};

function RemoveButton({ size, label, onRemove }: RemoveButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onRemove?.();
      }}
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-full',
        'text-current opacity-70 hover:opacity-100',
        'transition-opacity duration-fast ease-standard',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current',
        REMOVE_BUTTON_SIZE_CLASS[size],
      ].join(' ')}
    >
      <XIcon className="size-[0.75em]" />
    </button>
  );
}

/**
 * Pull the non-responsive `size` value used by the dot + remove-button sub-components. They read
 * the base value once on each render — the wrapper recipe already carries per-size height/padding,
 * so we don't need full responsive resolution at the leaf nodes.
 */
function resolveBaseSize(value: BadgeProps['size']): BadgeSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, BadgeSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}
