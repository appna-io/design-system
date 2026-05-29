'use client';

import {
  forwardRef,
  isResponsiveObject,
  resolveResponsive,
  type ResponsiveValue,
} from '@apx-ui/engine';
import { type ReactElement, type ReactNode, isValidElement } from 'react';

import { Divider } from '../Divider/Divider';
import { Stack } from '../Stack/Stack';
import type { StatGroupDirection, StatGroupProps } from './Stat.types';

/**
 * Resolve the "primary" axis for a (possibly responsive) `direction` value. Used to choose the
 * default Divider orientation when the consumer passes `divider` as a plain boolean. The
 * default Divider for a row-direction StatGroup is **vertical** (slim line between tiles);
 * for column-direction it's **horizontal** (full-width line between tiles).
 *
 * For responsive directions we pick the `base` breakpoint's value — the orientation is fixed at
 * runtime, so we can't change it per-breakpoint without a media-query CSS trick. Consumers who
 * need per-breakpoint orientation can pass a custom divider node themselves.
 */
function primaryDirection(
  direction: ResponsiveValue<StatGroupDirection> | undefined,
): StatGroupDirection {
  if (direction === undefined) return 'row';
  if (typeof direction === 'string') return direction;
  if (isResponsiveObject(direction)) {
    for (const [bp, value] of resolveResponsive(direction)) {
      if (bp === 'base') return value;
    }
    // Fallback: take the first entry the iterator yields if there's no explicit `base`.
    for (const [, value] of resolveResponsive(direction)) return value;
  }
  return 'row';
}

/**
 * `<StatGroup />` — horizontal (or column) layout of `<Stat>` tiles with optional auto-inserted
 * dividers. Thin orchestration over `<Stack>` so we inherit all the responsive layout magic
 * (`direction`, `gap`, `align`, `justify`) without duplicating the recipe.
 *
 * When `divider` is `true`, StatGroup synthesises a `<Divider>` with orientation **opposite**
 * to the layout direction (row layout → vertical dividers, column layout → horizontal). Pass a
 * `ReactNode` to override the divider entirely (e.g. a custom decorated rule).
 *
 * @example
 *   <StatGroup divider gap={6}>
 *     <Stat label="Revenue" value="$12.4k" />
 *     <Stat label="Orders" value={47} />
 *   </StatGroup>
 *
 *   <StatGroup direction={{ base: 'column', md: 'row' }} divider gap={4}>
 *     {stats}
 *   </StatGroup>
 */
export const StatGroup = forwardRef<HTMLElement, StatGroupProps>(function StatGroup(
  props,
  ref,
): ReactElement {
  const {
    direction = 'row',
    gap = 4,
    divider = false,
    align = 'stretch',
    justify = 'start',
    children,
    className,
    style,
    sx,
    ...rest
  } = props;

  // Resolve the divider node. `true` → auto-orient based on primary direction. ReactNode → use
  // it verbatim. `false` / `undefined` → no divider.
  let dividerNode: ReactNode | undefined;
  if (divider === true) {
    const dir = primaryDirection(direction);
    const orientation = dir === 'row' ? 'vertical' : 'horizontal';
    dividerNode = <Divider orientation={orientation} data-stat-group-divider />;
  } else if (isValidElement(divider) || (divider !== false && divider !== undefined)) {
    dividerNode = divider as ReactNode;
  }

  return (
    <Stack
      ref={ref as React.ForwardedRef<HTMLElement>}
      direction={direction}
      gap={gap}
      align={align}
      justify={justify}
      divider={dividerNode}
      className={className}
      style={style}
      sx={sx}
      data-stat-group=""
      {...rest}
    >
      {children}
    </Stack>
  );
}, 'StatGroup');
