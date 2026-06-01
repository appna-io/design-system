'use client';

import { useSlotClass } from '../helpers/useSlotClass';

import {
  schedulerHolidayBadgeRecipe,
  schedulerHolidayBannerRecipe,
} from '../Scheduler.recipe';
import type { Holiday } from '../Scheduler.types';

export interface SchedulerHolidayBannerProps {
  holidays: readonly Holiday[];
  variant?: 'banner' | 'badge';
}

/**
 * Two render modes:
 *
 *  - `variant="banner"`: full-width strip above a day / week view, listing every holiday
 *    in the visible range.
 *  - `variant="badge"`: inline chip (used inside month cells).
 */
export function SchedulerHolidayBanner(props: SchedulerHolidayBannerProps) {
  const { holidays, variant = 'banner' } = props;
  const bannerClasses = useSlotClass(
    'scheduler.holiday.banner',
    schedulerHolidayBannerRecipe,
    {},
  );
  const badgeClasses = useSlotClass(
    'scheduler.holiday.badge',
    schedulerHolidayBadgeRecipe,
    {},
  );

  if (holidays.length === 0) return null;

  if (variant === 'badge') {
    return (
      <span className={badgeClasses} title={holidays[0]!.name}>
        {holidays[0]!.name}
        {holidays.length > 1 ? ` +${holidays.length - 1}` : ''}
      </span>
    );
  }

  return (
    <div className={bannerClasses} role="note">
      {holidays.map((h) => (
        <span key={h.id} className={badgeClasses}>
          {h.name}
        </span>
      ))}
    </div>
  );
}

SchedulerHolidayBanner.displayName = 'Scheduler.HolidayBanner';