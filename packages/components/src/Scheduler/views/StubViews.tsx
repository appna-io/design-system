'use client';

import { useSlotClass } from '../helpers/useSlotClass';

import { schedulerEmptyRecipe } from '../Scheduler.recipe';
import { useSchedulerContext } from '../SchedulerContext';

/**
 * Resource swimlane view + Year heatmap are scaffolded but not implemented in PR 1. The
 * pure helpers + types are shipped; the rendering layer lands in PR 2 + PR 3 of the
 * Scheduler split (see `plans/pending/components/58-scheduler.md` §"Suggested PR split").
 *
 * Rendering a clear "coming soon" placeholder is preferable to either crashing or
 * silently falling back to another view — consumers who depend on these views will see
 * the gap immediately.
 */
export function ResourceViewStub() {
  const ctx = useSchedulerContext();
  const cls = useSlotClass('scheduler.empty', schedulerEmptyRecipe, {});
  return (
    <div className={cls} role="status">
      <strong>{ctx.t.views.resource}</strong>
      <span>
        Resource swimlane view ships in the next Scheduler PR.
      </span>
    </div>
  );
}

export function YearViewStub() {
  const ctx = useSchedulerContext();
  const cls = useSlotClass('scheduler.empty', schedulerEmptyRecipe, {});
  return (
    <div className={cls} role="status">
      <strong>{ctx.t.views.year}</strong>
      <span>
        Year heatmap view ships in the next Scheduler PR.
      </span>
    </div>
  );
}
