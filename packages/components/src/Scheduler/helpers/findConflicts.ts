import type { SchedulerEvent } from '../Scheduler.types';

import { intervalsOverlap } from './dateMath';

/**
 * Find every event in `pool` that overlaps the proposed `(start, end, resourceId?)` of
 * `candidate`. Used by `useScheduler.commitDrag` and the public `onConflict` callback.
 *
 * Same-resource semantics: events on different resources don't conflict; if the candidate
 * has `resourceId == null`, it conflicts with any event on the same calendar day window.
 */
export interface FindConflictsOptions {
  candidate: SchedulerEvent;
  pool: readonly SchedulerEvent[];
  ignoreIds?: readonly string[];
  respectResource?: boolean;
}

export function findConflicts(opts: FindConflictsOptions): SchedulerEvent[] {
  const { candidate, pool, ignoreIds = [], respectResource = true } = opts;
  const ignore = new Set([candidate.id, ...ignoreIds]);
  const conflicts: SchedulerEvent[] = [];
  for (const event of pool) {
    if (ignore.has(event.id)) continue;
    if (event.status === 'cancelled') continue;
    if (
      respectResource &&
      candidate.resourceId != null &&
      event.resourceId != null &&
      candidate.resourceId !== event.resourceId
    ) {
      continue;
    }
    if (intervalsOverlap(candidate.start, candidate.end, event.start, event.end)) {
      conflicts.push(event);
    }
  }
  return conflicts;
}
