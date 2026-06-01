import { createContext, useContext } from 'react';

import type {
  SchedulerColor,
  SchedulerDensity,
  SchedulerEventShape,
  SchedulerNowIndicatorStyle,
  SchedulerSize,
  SchedulerVariant,
  UseSchedulerReturn,
} from './Scheduler.types';

/**
 * Internal context shared by the root, the views, and every part. Holds the resolved
 * variant axes (so subparts don't re-resolve responsive values) plus the
 * `UseSchedulerReturn` value object so views and parts can dispatch actions without
 * prop-drilling.
 *
 * Exported so consumers building bespoke subparts can read the same context — e.g. a
 * custom toolbar can call `useSchedulerContext().setView('week')` directly.
 */
/**
 * Toolbar/body chrome toggles resolved at the root from `<Scheduler>` props and stashed on
 * context so any subpart (default toolbar, custom toolbar, sidebar) can read them without
 * re-deriving from props. Each is a plain boolean — consumers who pass a `ReactNode` for the
 * matching prop get it rendered directly at the root level instead.
 */
export interface SchedulerChromeFlags {
  /** Render the default `<SchedulerSearchInput>` in the toolbar trailing slot. */
  search: boolean;
  /** Render the default `<SchedulerFilterMenu>` in the toolbar trailing slot. */
  filters: boolean;
  /** Render the default `<SchedulerDensitySelect>` in the toolbar trailing slot. */
  density: boolean;
  /** Render the default `<SchedulerSidebar>` on the leading edge of the body. */
  sidebar: boolean;
}

export interface SchedulerContextValue extends UseSchedulerReturn {
  variant: SchedulerVariant;
  size: SchedulerSize;
  color: SchedulerColor;
  eventShape: SchedulerEventShape;
  nowIndicator: SchedulerNowIndicatorStyle;
  stickyHeader: boolean;
  showBusinessHours: boolean;
  dimOffHours: boolean;
  showWeekNumbers: boolean;
  chrome: SchedulerChromeFlags;
  rootId: string;
}

export const SchedulerContext = createContext<SchedulerContextValue | null>(null);

export function useSchedulerContext(): SchedulerContextValue {
  const ctx = useContext(SchedulerContext);
  if (!ctx) {
    throw new Error(
      '[apx-ds] <Scheduler> subparts must be rendered inside a <Scheduler> root.',
    );
  }
  return ctx;
}

export function useOptionalSchedulerContext(): SchedulerContextValue | null {
  return useContext(SchedulerContext);
}

/**
 * Resolve a density string into the hour-row height in pixels. Used by the views to lay
 * out the time grid. The numbers match the spec for `compact` / `standard` / `comfortable`
 * and feed the same `hourHeight` argument that consumers can override per Scheduler root.
 */
export function resolveDefaultHourHeight(density: SchedulerDensity): number {
  switch (density) {
    case 'compact':
      return 36;
    case 'comfortable':
      return 64;
    default:
      return 48;
  }
}