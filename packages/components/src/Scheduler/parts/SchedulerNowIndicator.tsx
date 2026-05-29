'use client';

import { useSlotClass } from '../helpers/useSlotClass';
import { useEffect, useState } from 'react';

import {
  schedulerNowDotRecipe,
  schedulerNowIndicatorRecipe,
  schedulerNowLabelRecipe,
  schedulerNowLineRecipe,
} from '../Scheduler.recipe';
import { useSchedulerContext } from '../SchedulerContext';
import { isSameDay, minutesSinceMidnight } from '../helpers/dateMath';
import { formatTime } from '../helpers/formatTime';
import { minuteToTop } from '../helpers/eventLayout';

export interface SchedulerNowIndicatorProps {
  day: Date;
  showLabel?: boolean;
}

/**
 * Red current-time line + dot. CSS-only animation is impractical here because the offset
 * depends on the live clock — we tick every minute via `setInterval` and rely on React's
 * reconciler to schedule the repaint. 60 s is plenty given that the line moves ~0.83 px
 * per minute at the default `hourHeight: 48`.
 */
export function SchedulerNowIndicator({ day, showLabel = false }: SchedulerNowIndicatorProps) {
  const ctx = useSchedulerContext();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    // Align the first tick to the next minute boundary so all consumers tick together,
    // then run on a 60 s interval.
    const ms = 60_000 - (Date.now() % 60_000);
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timeoutId = setTimeout(() => {
      setNow(new Date());
      intervalId = setInterval(() => setNow(new Date()), 60_000);
    }, ms);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const indicatorClasses = useSlotClass(
    'scheduler.now.indicator',
    schedulerNowIndicatorRecipe,
    {},
  );
  const lineClasses = useSlotClass('scheduler.now.line', schedulerNowLineRecipe, {});
  const dotClasses = useSlotClass('scheduler.now.dot', schedulerNowDotRecipe, {});
  const labelClasses = useSlotClass('scheduler.now.label', schedulerNowLabelRecipe, {});

  if (!isSameDay(day, now)) return null;
  if (ctx.nowIndicator === 'none') return null;

  const minute = minutesSinceMidnight(now);
  const top = minuteToTop(minute, ctx.hourHeight);

  return (
    <div className={indicatorClasses} style={{ top }} aria-hidden>
      <span className={dotClasses} />
      <span className={lineClasses} />
      {(showLabel || ctx.nowIndicator === 'lineAndLabel') && (
        <span className={labelClasses}>{formatTime(now, ctx.locale, ctx.timeFormat)}</span>
      )}
    </div>
  );
}

SchedulerNowIndicator.displayName = 'Scheduler.NowIndicator';
