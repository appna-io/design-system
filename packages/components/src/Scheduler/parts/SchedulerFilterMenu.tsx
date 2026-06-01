'use client';

import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '../../Button/Button';
import { Menu } from '../../Menu';
import { Popover } from '../../Popover';
import { useSlotClass } from '../helpers/useSlotClass';
import { schedulerFilterCountBadgeRecipe } from '../Scheduler.recipe';
import { useSchedulerContext } from '../SchedulerContext';
import { SchedulerCalendarList } from './SchedulerCalendarList';
import { SchedulerHolidayToggle } from './SchedulerHolidayToggle';

export interface SchedulerFilterMenuProps {
  /** Replace the default content (calendars + holiday toggle) — render any filter parts you want. */
  children?: React.ReactNode;
}

/**
 * Toolbar entry-point for filtering. Opens a `<Popover>` (not a `<Menu>` — the body needs
 * arbitrary form widgets like `<Checkbox>` and `<Switch>` that don't sit cleanly inside
 * `<Menu.Item>` slots). Active-filter count rides the trigger as a badge.
 */
export function SchedulerFilterMenu(props: SchedulerFilterMenuProps) {
  const ctx = useSchedulerContext();
  const { t, state, setFilters } = ctx;
  const calendars = ctx.calendars;

  const activeCount = useMemo(() => {
    let n = 0;
    const f = state.filters;
    if (f.calendarIds && calendars.length > 0 && f.calendarIds.length !== calendars.length) {
      n += 1;
    }
    if (f.search) n += 1;
    if (f.holidays?.show === false) n += 1;
    if (f.holidays?.regions && f.holidays.regions.length > 0) n += 1;
    if (f.resourceIds && f.resourceIds.length > 0) n += 1;
    if (f.dateRange) n += 1;
    if (f.custom) n += 1;
    return n;
  }, [state.filters, calendars.length]);

  const badgeClasses = useSlotClass(
    'scheduler.filterMenu.badge',
    schedulerFilterCountBadgeRecipe,
    {},
  );

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="sm" aria-label={t.filters}>
          <Filter aria-hidden size={14} className="me-1.5" />
          {t.filters}
          {activeCount > 0 ? (
            <span className={badgeClasses} aria-label={t.filterActiveCount(activeCount)}>
              {activeCount}
            </span>
          ) : null}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-[280px] p-3">
        {props.children ?? (
          <div className="flex flex-col gap-3">
            <SchedulerCalendarList />
            <Menu.Separator />
            <div className="flex items-center justify-between">
              <SchedulerHolidayToggle />
            </div>
            {activeCount > 0 ? (
              <button
                type="button"
                className="self-start text-xs font-medium text-primary hover:underline"
                onClick={() =>
                  setFilters(() => ({
                    calendarIds: undefined,
                    resourceIds: undefined,
                    search: undefined,
                    dateRange: undefined,
                    holidays: undefined,
                    custom: undefined,
                  }))
                }
              >
                {t.filterClearAll}
              </button>
            ) : null}
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}

SchedulerFilterMenu.displayName = 'Scheduler.FilterMenu';