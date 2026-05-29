'use client';

import { Globe } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { Button } from '../../Button/Button';
import { Menu } from '../../Menu';
import { useSchedulerContext } from '../SchedulerContext';

export interface SchedulerHolidayRegionFilterProps {
  /** ISO region codes to surface. Defaults to a sensible global short-list. */
  regions?: readonly string[];
}

/** Default short-list — matches the 20-region built-in `getBuiltInHolidays` set. */
const DEFAULT_REGIONS: readonly string[] = [
  'US', 'GB', 'IL', 'AE', 'EG', 'SA', 'JP', 'DE', 'FR', 'ES',
  'IT', 'BR', 'IN', 'MX', 'AU', 'CA', 'CN', 'KR', 'RU', 'NL',
];

/**
 * Menu with one checkbox per region. Writes `state.filters.holidays.regions`; `undefined`
 * means "all regions". The trigger shows the active count when partial filtering is on.
 */
export function SchedulerHolidayRegionFilter(props: SchedulerHolidayRegionFilterProps) {
  const ctx = useSchedulerContext();
  const { t, state, setFilters } = ctx;
  const regions = props.regions ?? DEFAULT_REGIONS;
  const active = state.filters.holidays?.regions;
  const activeSet = useMemo(
    () => (active ? new Set(active) : null),
    [active],
  );

  const isOn = useCallback(
    (region: string) => (activeSet === null ? true : activeSet.has(region)),
    [activeSet],
  );

  const toggle = useCallback(
    (region: string, checked: boolean) => {
      setFilters((prev) => {
        const current = new Set(prev.holidays?.regions ?? regions);
        if (checked) current.add(region);
        else current.delete(region);
        const next = Array.from(current);
        return {
          ...prev,
          holidays: {
            ...(prev.holidays ?? {}),
            regions: next.length === regions.length ? undefined : next,
          },
        };
      });
    },
    [setFilters, regions],
  );

  const activeCount = activeSet ? activeSet.size : regions.length;
  const isFiltered = activeSet !== null && activeSet.size !== regions.length;

  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button variant="ghost" size="sm" aria-label={t.holidayRegions}>
          <Globe aria-hidden size={14} className="me-1.5" />
          {t.holidayRegions}
          {isFiltered ? (
            <span className="ms-1.5 text-xs text-fg-muted">({activeCount})</span>
          ) : null}
        </Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Label>{t.holidayRegions}</Menu.Label>
        <Menu.Separator />
        {regions.map((region) => (
          <Menu.CheckboxItem
            key={region}
            checked={isOn(region)}
            onCheckedChange={(checked) => toggle(region, checked)}
          >
            {region}
          </Menu.CheckboxItem>
        ))}
      </Menu.Content>
    </Menu>
  );
}

SchedulerHolidayRegionFilter.displayName = 'Scheduler.HolidayRegionFilter';
