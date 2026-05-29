'use client';

import { forwardRef, useId } from '@apx-ui/engine';
import { useSlotClass } from './helpers/useSlotClass';
import { useEffect, useMemo, useRef, type ReactElement } from 'react';

import {
  schedulerBodyRecipe,
  schedulerEmptyRecipe,
  schedulerRootRecipe,
  schedulerScrollerRecipe,
} from './Scheduler.recipe';
import type { Holiday, SchedulerProps, SchedulerView } from './Scheduler.types';
import {
  SchedulerContext,
  useSchedulerContext,
  type SchedulerChromeFlags,
  type SchedulerContextValue,
} from './SchedulerContext';
import { eachDayKeyInRange, parseHHMM } from './helpers/dateMath';
import { useScheduler } from './headless/useScheduler';
import { SchedulerHolidayBanner } from './parts/SchedulerHolidayBanner';
import { SchedulerQuickPopover } from './parts/SchedulerQuickPopover';
import { SchedulerSidebar } from './parts/SchedulerSidebar';
import { SchedulerToolbar } from './parts/SchedulerToolbar';
import { AgendaView } from './views/AgendaView';
import { MonthView } from './views/MonthView';
import { ResourceViewStub, YearViewStub } from './views/StubViews';
import { TimeGridView } from './views/TimeGridView';

/**
 * The top-level `<Scheduler />` — the Tier-3 sibling to `<DataGrid />`.
 *
 * Composition over inheritance:
 *
 *   <Scheduler>                  ← drives state via `useScheduler` + publishes context
 *   ├── <Scheduler.Toolbar>      ← prev/next/today/title/view-switcher
 *   ├── <Scheduler.HolidayBanner /> ← optional banner across week/day
 *   ├── view (Month | TimeGrid | Agenda | …) ← picks renderer by `state.view`
 *   └── <Scheduler.QuickPopover>  ← portal-anchored quick-create overlay
 *
 * Every subpart is independently importable from `'@apx-ui/components'`, so consumers
 * who want to bring their own toolbar can skip the default by setting `toolbar={false}`
 * and rendering `<Scheduler.Toolbar leading={…} trailing={…} />` themselves at the top of
 * the page.
 *
 * The `Object.assign` compound assembly is in `./index.ts` so the runtime shape stays
 * single-instance.
 */
function SchedulerImpl(
  props: SchedulerProps,
  ref: React.ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    variant,
    size,
    color,
    density: densityProp,
    stickyHeader = true,
    bordered,
    roundedCorners,
    elevation,
    eventShape = 'rect',
    nowIndicator = 'lineAndLabel',
    showBusinessHours = true,
    dimOffHours = true,
    showWeekNumbers = false,
    toolbar = true,
    filters = false,
    miniMonth = false,
    sidebar = false,
    loading = false,
    emptyState,
    errorState,
    className,
    style,
    sx,
    renderEvent: _renderEvent,
    renderQuickPopover: _renderQuickPopover,
    renderEventModal: _renderEventModal,
    renderHolidayCell: _renderHolidayCell,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props as SchedulerProps & {
    [k: string]: unknown;
  };

  // Touch unused render-slot props so consumers can pass them; they're wired in PR 2.
  void _renderEvent;
  void _renderQuickPopover;
  void _renderEventModal;
  void _renderHolidayCell;
  // `miniMonth` is consumed by `<SchedulerSidebar>` directly via context — we accept the
  // prop here so the public API surface stays stable, but the default sidebar already
  // renders a mini-month so passing `miniMonth={true}` alone (without `sidebar`) is a no-op.
  void miniMonth;

  const headlessOptions = { ...(props as SchedulerProps) };
  if (densityProp !== undefined) headlessOptions.density = densityProp;
  const headless = useScheduler(headlessOptions);

  const rootId = useId();

  /* `filters={true}` opts into the default trio (search + filter menu + density). Passing a
   *  `ReactNode` turns OFF the default toolbar parts so the consumer can render their own
   *  layout — they get full control of placement in exchange. `false` (default) hides
   *  everything. The sidebar flag is independent. */
  const chrome = useMemo<SchedulerChromeFlags>(() => {
    const filtersBool = filters === true;
    const sidebarBool = sidebar === true;
    return {
      search: filtersBool,
      filters: filtersBool,
      density: filtersBool,
      sidebar: sidebarBool,
    };
  }, [filters, sidebar]);

  const ctx = useMemo<SchedulerContextValue>(
    () => ({
      ...headless,
      variant: (variant as SchedulerContextValue['variant']) ?? 'solid',
      size: (size as SchedulerContextValue['size']) ?? 'md',
      color: (color as SchedulerContextValue['color']) ?? 'primary',
      eventShape,
      nowIndicator,
      stickyHeader,
      showBusinessHours,
      dimOffHours,
      showWeekNumbers,
      chrome,
      rootId,
    }),
    [
      headless,
      variant,
      size,
      color,
      eventShape,
      nowIndicator,
      stickyHeader,
      showBusinessHours,
      dimOffHours,
      showWeekNumbers,
      chrome,
      rootId,
    ],
  );

  const rootClasses = useSlotClass('scheduler.root', schedulerRootRecipe, {
    variant,
    size,
    bordered,
    roundedCorners,
    elevation,
  });
  const bodyClasses = useSlotClass('scheduler.body', schedulerBodyRecipe, {});
  const scrollerClasses = useSlotClass(
    'scheduler.scroller',
    schedulerScrollerRecipe,
    {},
  );
  const emptyClasses = useSlotClass('scheduler.empty', schedulerEmptyRecipe, {});

  const view = ctx.state.view;

  // RTL: rely on the host page's `dir`. Our `start` / `end` Tailwind utilities (`ps-*`,
  // `me-*`, `border-e-*`) already flip — no manual `transform: scaleX(-1)` needed.

  /**
   * Auto-scroll the time grid to the start of working hours (or close to "now" if today
   * is in the visible range) on mount and on view / density changes. Otherwise the user
   * lands on midnight, which hides the morning entirely.
   */
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const isTimeGridView =
    view === 'day' || view === 'week' || view === 'workWeek' || view === 'multiDay';
  useEffect(() => {
    if (!isTimeGridView) return;
    const node = scrollerRef.current;
    if (!node) return;
    const workingStartMin = parseHHMM(ctx.workingHours.start);
    // Land 30 minutes before working start so the first hour-row has a little breathing room.
    const targetMin = Math.max(0, workingStartMin - 30);
    const top = (targetMin / 60) * ctx.hourHeight;
    // Defer one frame so the inner grid has finished layout (sticky header + body height).
    const raf = requestAnimationFrame(() => {
      node.scrollTo({ top, behavior: 'auto' });
    });
    return () => cancelAnimationFrame(raf);
  }, [isTimeGridView, ctx.hourHeight, ctx.workingHours.start, view, ctx.state.density]);

  let renderedView: ReactElement;
  if (loading) {
    renderedView = (
      <div className={emptyClasses} aria-busy>
        {ctx.t.loading}
      </div>
    );
  } else if (ctx.visibleEvents.length === 0 && !ctx.state.filters.search && view !== 'month') {
    renderedView =
      (emptyState as ReactElement | undefined) ??
      (((): ReactElement => {
        if (view === 'agenda') return <AgendaView />;
        return <TimeGridViewByName view={view} />;
      })());
  } else {
    renderedView = <TimeGridViewByName view={view} />;
  }

  return (
    <SchedulerContext.Provider value={ctx}>
      <div
        ref={ref}
        className={[rootClasses, className].filter(Boolean).join(' ')}
        style={{ ...((sx as unknown) as React.CSSProperties), ...style }}
        role="application"
        aria-label={ariaLabel ?? ctx.t.calendarApplication}
        aria-labelledby={ariaLabelledBy}
        data-view={view}
        data-density={ctx.state.density}
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
      >
        {toolbar !== false && (
          <SchedulerToolbar variant={toolbar === 'minimal' ? 'minimal' : 'full'} />
        )}
        {/* Optional holiday banner — only shown in non-month views to avoid duplication */}
        {ctx.showHolidays && view !== 'month' && (
          <HolidaysForVisible />
        )}
        <div className={bodyClasses}>
          {chrome.sidebar ? <SchedulerSidebar /> : null}
          {sidebar && sidebar !== true && sidebar !== false ? (sidebar as React.ReactNode) : null}
          <div ref={scrollerRef} className={scrollerClasses}>
            {renderedView}
          </div>
        </div>
        {/* Quick-popover lives at the root so it portals out of the scroller. */}
        <SchedulerQuickPopover />
        {errorState && ctx.state.errors.length > 0 ? errorState : null}
      </div>
    </SchedulerContext.Provider>
  );
}

function TimeGridViewByName({ view }: { view: SchedulerView | undefined }) {
  switch (view) {
    case 'month':
      return <MonthView />;
    case 'agenda':
      return <AgendaView />;
    case 'year':
      return <YearViewStub />;
    case 'resource':
      return <ResourceViewStub />;
    case 'day':
    case 'week':
    case 'workWeek':
    case 'multiDay':
    default:
      return (
        <TimeGridView
          variant={
            view === 'workWeek'
              ? 'workWeek'
              : view === 'day'
              ? 'day'
              : view === 'multiDay'
              ? 'multiDay'
              : 'week'
          }
        />
      );
  }
}

function HolidaysForVisible() {
  const ctx = useSchedulerContext();
  const all = useMemo(() => {
    const out: Holiday[] = [];
    const seen = new Set<string>();
    const keys = eachDayKeyInRange(ctx.state.visibleRange.start, ctx.state.visibleRange.end);
    for (const key of keys) {
      const bucket = ctx.visibleHolidays.get(key);
      if (!bucket) continue;
      for (const h of bucket) {
        if (seen.has(h.id)) continue;
        seen.add(h.id);
        out.push(h);
      }
    }
    return out;
  }, [ctx.visibleHolidays, ctx.state.visibleRange]);
  if (all.length === 0) return null;
  return <SchedulerHolidayBanner holidays={all} variant="banner" />;
}

export const Scheduler = forwardRef<HTMLDivElement, SchedulerProps>(SchedulerImpl);
Scheduler.displayName = 'Scheduler';
