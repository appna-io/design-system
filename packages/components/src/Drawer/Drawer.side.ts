import { isResponsiveObject, type BreakpointKey, type Direction, type ResponsiveValue } from '@apx-ui/engine';

import type { DrawerLogicalSide, DrawerPhysicalSide, DrawerSide } from './Drawer.types';

/**
 * Logical → physical side resolution, kept out of `DrawerContent` because it is pure and worth
 * testing on its own (same split as `Drawer.motion.ts`).
 *
 * Everything downstream of `DrawerContent` — the backdrop / content recipes, `drawerContentMotion`,
 * the `data-side` attribute — speaks physical edges only. Resolving once at the top of Content
 * means the 20-row `side` × `size` compound matrix in the recipe stays exactly as it was, and RTL
 * support costs one hook read rather than a second set of variant rows.
 */

const PHYSICAL_BY_DIRECTION: Record<Direction, Record<DrawerLogicalSide, DrawerPhysicalSide>> = {
  ltr: { start: 'left', end: 'right' },
  rtl: { start: 'right', end: 'left' },
};

/** Resolve a single side. Physical values pass through untouched. */
export function resolveDrawerSide(side: DrawerSide, dir: Direction): DrawerPhysicalSide {
  if (side === 'start' || side === 'end') return PHYSICAL_BY_DIRECTION[dir][side];
  return side;
}

/**
 * Resolve a side that may be responsive. A per-breakpoint object is mapped entry by entry, so
 * `{ base: 'bottom', md: 'end' }` stays responsive and only its logical entries flip.
 */
export function resolveResponsiveDrawerSide(
  side: ResponsiveValue<DrawerSide> | undefined,
  dir: Direction,
): ResponsiveValue<DrawerPhysicalSide> | undefined {
  if (side === undefined) return undefined;
  if (!isResponsiveObject(side)) return resolveDrawerSide(side, dir);

  const resolved: Partial<Record<BreakpointKey, DrawerPhysicalSide>> = {};
  for (const breakpoint of Object.keys(side) as BreakpointKey[]) {
    const value = side[breakpoint];
    if (value !== undefined) resolved[breakpoint] = resolveDrawerSide(value, dir);
  }
  return resolved;
}
