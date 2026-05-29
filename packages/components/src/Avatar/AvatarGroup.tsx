'use client';

import { Children, isValidElement, type CSSProperties } from 'react';

import { Avatar } from './Avatar';
import { AvatarGroupContext } from './AvatarGroupContext';
import type { AvatarGroupProps } from './Avatar.types';

/**
 * Horizontal stack of `<Avatar>` children with optional overflow tile. Owns three concerns the
 * individual avatar does not:
 *
 *  1. **Propagation** — pushes its `size` / `shape` / `variant` defaults into context so every
 *     child Avatar picks them up unless explicitly overridden. Same pattern as RadioGroup.
 *  2. **Layout** — applies the overlap (negative `margin-inline-start`) on every tile after the
 *     first via a logical-property style so the stack flips correctly in RTL.
 *  3. **Overflow** — when `max` is set and children exceed it, the surplus is collapsed into a
 *     single `+N` Avatar. The overflow tile is just another `<Avatar>` instance (the initials
 *     helper passes "+N" through verbatim), so the rendered DOM has one consistent shape.
 *
 * The overflow tile carries its own `aria-label="N more"` so screen readers don't announce the
 * literal string "+3".
 */
export function AvatarGroup({
  max,
  size,
  shape,
  variant,
  spacing = -2,
  overflowMode = 'count',
  renderOverflow,
  children,
  style,
  className,
  ...rest
}: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const visible = max != null ? items.slice(0, max) : items;
  const overflowCount = max != null ? Math.max(items.length - visible.length, 0) : 0;

  // Tailwind's spacing scale is 0.25rem per unit; mirror that so consumers can think in tokens.
  const overlapPx = spacing * 4;

  return (
    <AvatarGroupContext.Provider value={{ size, shape, variant }}>
      <div
        className={['inline-flex items-center', className].filter(Boolean).join(' ')}
        style={style}
        {...rest}
      >
        {visible.map((child, i) => (
          <span
            key={(child as { key?: string | number | null }).key ?? i}
            className="relative inline-flex shrink-0 ring-2 ring-bg rounded-full"
            style={tileStyle(i, overlapPx)}
          >
            {child}
          </span>
        ))}
        {overflowCount > 0 ? (
          <span
            className="relative inline-flex shrink-0 ring-2 ring-bg rounded-full"
            style={tileStyle(visible.length, overlapPx)}
          >
            {renderOverflow ? (
              renderOverflow(overflowCount)
            ) : (
              <Avatar
                name={overflowMode === 'ellipsis' ? '…' : `+${overflowCount}`}
                color="neutral"
                variant={variant ?? 'soft'}
                size={size ?? 'md'}
                shape={shape ?? 'circle'}
                aria-label={`${overflowCount} more`}
              />
            )}
          </span>
        ) : null}
      </div>
    </AvatarGroupContext.Provider>
  );
}

AvatarGroup.displayName = 'AvatarGroup';

/**
 * Style for one tile inside the stack. We use `marginInlineStart` (logical property) instead of
 * `margin-left` so the overlap direction flips automatically in RTL layouts — Arabic, Hebrew, and
 * other RTL scripts get the same "stacked-faces" look mirrored across the vertical axis.
 *
 * The wrapping `<span>` carries the ring (visual separator between tiles); the inner Avatar
 * keeps its own rounded shell behind it.
 */
function tileStyle(index: number, overlapPx: number): CSSProperties {
  if (index === 0) return {};
  return { marginInlineStart: `${overlapPx}px` };
}
