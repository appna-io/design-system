'use client';

import { useCallback } from 'react';

import { Switch } from '../../Switch/Switch';
import { useSchedulerContext } from '../SchedulerContext';

export interface SchedulerHolidayToggleProps {
  /** Override the inline label. @default `t.holidayShow` */
  label?: React.ReactNode;
}

/**
 * Compact `<Switch>` that flips `state.filters.holidays.show` on and off. Defaults to ON
 * when the consumer hasn't passed any explicit holiday filter — matching the rendering
 * default in `deriveFilteredHolidays`.
 */
export function SchedulerHolidayToggle(props: SchedulerHolidayToggleProps) {
  const ctx = useSchedulerContext();
  const { t, state, setFilters } = ctx;

  const show = state.filters.holidays?.show ?? true;

  const handleChange = useCallback(
    (next: boolean) => {
      setFilters((prev) => ({
        ...prev,
        holidays: { ...(prev.holidays ?? {}), show: next },
      }));
    },
    [setFilters],
  );

  return (
    <Switch
      size="sm"
      checked={show}
      onCheckedChange={handleChange}
      aria-label={t.holidayShow}
    >
      {props.label ?? t.holidayShow}
    </Switch>
  );
}

SchedulerHolidayToggle.displayName = 'Scheduler.HolidayToggle';