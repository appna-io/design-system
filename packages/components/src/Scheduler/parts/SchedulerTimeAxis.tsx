'use client';

import { useSlotClass } from '../helpers/useSlotClass';

import {
  schedulerTimeAxisLabelRecipe,
  schedulerTimeAxisRecipe,
} from '../Scheduler.recipe';
import { useSchedulerContext } from '../SchedulerContext';
import { withTime } from '../helpers/dateMath';
import { formatTime } from '../helpers/formatTime';

/**
 * 24-hour vertical axis rendered to the left of the time-grid views. Labels are positioned
 * absolutely at each hour so the column itself can be a regular flex/grid child without
 * having to know about hour pitch.
 */
export function SchedulerTimeAxis() {
  const ctx = useSchedulerContext();
  const axisClasses = useSlotClass('scheduler.timeAxis', schedulerTimeAxisRecipe, {});
  const labelClasses = useSlotClass(
    'scheduler.timeAxis.label',
    schedulerTimeAxisLabelRecipe,
    {},
  );

  const today = ctx.state.date;
  const totalHeight = 24 * ctx.hourHeight;

  return (
    <div className={axisClasses} style={{ height: totalHeight }} aria-hidden>
      {Array.from({ length: 24 }, (_, hour) => {
        if (hour === 0) return null;
        const date = withTime(today, hour, 0);
        return (
          <div
            key={hour}
            className={labelClasses}
            style={{ top: hour * ctx.hourHeight }}
          >
            {formatTime(date, ctx.locale, ctx.timeFormat, ctx.timeFormat === '24h')}
          </div>
        );
      })}
    </div>
  );
}

SchedulerTimeAxis.displayName = 'Scheduler.TimeAxis';