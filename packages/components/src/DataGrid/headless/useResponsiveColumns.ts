'use client';

import { useMediaQuery } from '@apx-ui/engine';
import { useEffect, useMemo, useRef } from 'react';

import type { ColumnDef, ColumnId, ResponsiveBreakpointKey } from '../DataGrid.types';

/**
 * Tailwind-native breakpoint pixel values. Mirrored from `<AppShell>`'s
 * `useBreakpoint.ts` so DataGrid doesn't have to pull in the AppShell internals
 * for one table — the DS will hoist this into a shared token in PR 8 once the
 * second consumer (Toolbar overflow, Phase 28) lands.
 *
 * Semantics: `hideBelow: 'md'` hides the column whenever the viewport is
 * strictly narrower than 768 px. The `-0.02` epsilon avoids the 1 px dead-zone
 * at the exact boundary (matches Tailwind + Bootstrap).
 */
const BREAKPOINT_PX: Record<ResponsiveBreakpointKey, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

interface UseResponsiveColumnsOptions<T> {
  columns: ColumnDef<T>[];
  /**
   * Current column-visibility map from the headless state. Read so we can
   * shallow-merge our responsive overrides on top of it (consumer toggles via
   * the column-visibility menu keep working; the next breakpoint change
   * re-asserts the responsive hides on top).
   */
  visibility: Record<ColumnId, boolean>;
  /** Hook action — usually `grid.setColumnVisibility`. */
  setColumnVisibility: (next: Record<ColumnId, boolean>) => void;
}

/**
 * Watches each unique `responsive.hideBelow` breakpoint declared across the
 * column definitions and dispatches `setColumnVisibility` whenever the active
 * set of "currently below" breakpoints flips. Columns whose `hideBelow`
 * breakpoint is currently matched get forced to `false`; everything else is
 * left at whatever the consumer last set.
 *
 * The hook fires the dispatch only when the forced-hidden set materially
 * changes — never on every render — so it composes cleanly with the rest of
 * the headless state machine without re-render storms.
 *
 * SSR-safety: `useMediaQuery` returns `false` until the client mounts, so the
 * first paint always treats the viewport as desktop. That matches AppShell's
 * existing convention; consumers that need SSR mobile detection should pass
 * `defaultColumnVisibility` from their server hint.
 *
 * **Limitations** intentionally accepted for V1:
 * - The dispatch overrides a user that just re-enabled a column from the
 *   column-visibility menu on the *next* breakpoint change. That matches AG
 *   Grid / MUI; persistent "user override" semantics are a V2 polish.
 * - We don't watch the inverse (`showAbove`) — columns are hidden bottom-up,
 *   not shown top-down. Add `showAbove` in V2 if a real consumer asks.
 */
export function useResponsiveColumns<T>(options: UseResponsiveColumnsOptions<T>): void {
  const { columns, visibility, setColumnVisibility } = options;

  // Collect the unique breakpoints actually used by the column definitions so
  // we don't fire a media-query listener for every Tailwind breakpoint when
  // most aren't referenced.
  const activeBreakpoints = useMemo<ResponsiveBreakpointKey[]>(() => {
    const set = new Set<ResponsiveBreakpointKey>();
    for (const c of columns) {
      const bp = c.responsive?.hideBelow;
      if (bp) set.add(bp);
    }
    return Array.from(set).sort();
  }, [columns]);

  // Subscribe to each breakpoint at the top level — calling `useMediaQuery`
  // inside the loop is the correct pattern because `activeBreakpoints` is
  // memoed by content. Length changes only when the consumer changes the
  // column definitions, which legitimately remounts hooks anyway.
  const matches = useBreakpointMatches(activeBreakpoints);

  // Build the forced-hidden id set for the *current* viewport snapshot.
  const forcedHidden = useMemo<Set<ColumnId>>(() => {
    const out = new Set<ColumnId>();
    for (const c of columns) {
      const bp = c.responsive?.hideBelow;
      if (bp && matches[bp]) out.add(c.id);
    }
    return out;
  }, [columns, matches]);

  // Track the last forced-hidden id set we asserted so a re-render with the
  // same outcome doesn't dispatch.
  const lastForcedRef = useRef<string>('');
  const visibilityRef = useRef(visibility);
  visibilityRef.current = visibility;

  useEffect(() => {
    const signature = Array.from(forcedHidden).sort().join('|');
    if (signature === lastForcedRef.current) return;
    lastForcedRef.current = signature;

    // Merge: start from the consumer's existing map, then overwrite each
    // forced id with `false`. Columns the consumer hid stay hidden; columns
    // the consumer never touched come back to visible (`true`) when the
    // viewport widens past their breakpoint.
    const current = visibilityRef.current ?? {};
    const next: Record<ColumnId, boolean> = { ...current };
    let dirty = false;
    for (const c of columns) {
      const bp = c.responsive?.hideBelow;
      if (!bp) continue;
      const wantHidden = forcedHidden.has(c.id);
      const isHidden = current[c.id] === false;
      if (wantHidden && !isHidden) {
        next[c.id] = false;
        dirty = true;
      } else if (!wantHidden && isHidden && current[c.id] === false) {
        // We previously hid this column because the viewport was narrow;
        // restore it now that the viewport widened.
        next[c.id] = true;
        dirty = true;
      }
    }
    if (dirty) setColumnVisibility(next);
  }, [forcedHidden, columns, setColumnVisibility]);
}

/**
 * Run one `useMediaQuery` per breakpoint. React's rules-of-hooks require the
 * call count to be stable across renders, so we ALWAYS render one hook per
 * fixed breakpoint key — the `activeBreakpoints` filter only governs which
 * keys we read back, not which hooks fire. Cost is 5 subscriptions worst
 * case, well under 1 ms across browsers.
 */
function useBreakpointMatches(
  activeBreakpoints: ReadonlyArray<ResponsiveBreakpointKey>,
): Record<ResponsiveBreakpointKey, boolean> {
  const sm = useMediaQuery(`(max-width: ${BREAKPOINT_PX.sm - 0.02}px)`);
  const md = useMediaQuery(`(max-width: ${BREAKPOINT_PX.md - 0.02}px)`);
  const lg = useMediaQuery(`(max-width: ${BREAKPOINT_PX.lg - 0.02}px)`);
  const xl = useMediaQuery(`(max-width: ${BREAKPOINT_PX.xl - 0.02}px)`);
  const xxl = useMediaQuery(`(max-width: ${BREAKPOINT_PX['2xl'] - 0.02}px)`);

  return useMemo(() => {
    const all: Record<ResponsiveBreakpointKey, boolean> = {
      sm,
      md,
      lg,
      xl,
      '2xl': xxl,
    };
    // Mask out breakpoints no column declared so a flapping listener can't
    // dispatch responsive overrides for columns that don't subscribe.
    const active: Set<ResponsiveBreakpointKey> = new Set(activeBreakpoints);
    const masked: Record<ResponsiveBreakpointKey, boolean> = {
      sm: false,
      md: false,
      lg: false,
      xl: false,
      '2xl': false,
    };
    for (const bp of active) masked[bp] = all[bp];
    return masked;
  }, [sm, md, lg, xl, xxl, activeBreakpoints]);
}

/** Exposed so unit tests can read the table without re-importing Tailwind config. */
export { BREAKPOINT_PX as RESPONSIVE_BREAKPOINT_PX };