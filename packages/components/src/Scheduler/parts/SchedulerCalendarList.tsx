'use client';

import { useCallback, useMemo } from 'react';

import { Checkbox } from '../../Checkbox/Checkbox';
import { useSlotClass } from '../helpers/useSlotClass';
import {
  schedulerCalendarListItemRecipe,
  schedulerCalendarListRecipe,
  schedulerCalendarListSwatchRecipe,
} from '../Scheduler.recipe';
import { useSchedulerContext } from '../SchedulerContext';
import type { CalendarSource } from '../Scheduler.types';

export interface SchedulerCalendarListProps {
  /** Title rendered above the list. Pass `null` to omit. @default `t.calendars` */
  title?: React.ReactNode;
  /** Override the list of calendars to render. Defaults to `props.calendars` from the root. */
  calendars?: readonly CalendarSource[];
}

/**
 * Checkbox list of consumer-supplied calendars with their accent swatch. Writes the visible
 * set into `state.filters.calendarIds`; the renderer's `deriveFilteredEvents` reads the same
 * key. When `state.filters.calendarIds` is `undefined`, all calendars are considered visible.
 */
export function SchedulerCalendarList(props: SchedulerCalendarListProps) {
  const ctx = useSchedulerContext();
  const { t, state, setFilters } = ctx;
  const calendars: readonly CalendarSource[] = props.calendars ?? ctx.calendars;

  const visibleSet = useMemo(() => {
    if (state.filters.calendarIds) return new Set(state.filters.calendarIds);
    return new Set(calendars.map((c) => c.id));
  }, [state.filters.calendarIds, calendars]);

  const toggle = useCallback(
    (id: string, checked: boolean) => {
      setFilters((prev) => {
        const next = new Set(
          prev.calendarIds ?? calendars.map((c) => c.id),
        );
        if (checked) next.add(id);
        else next.delete(id);
        return { ...prev, calendarIds: Array.from(next) };
      });
    },
    [setFilters, calendars],
  );

  const listClasses = useSlotClass(
    'scheduler.calendarList',
    schedulerCalendarListRecipe,
    {},
  );
  const itemClasses = useSlotClass(
    'scheduler.calendarList.item',
    schedulerCalendarListItemRecipe,
    {},
  );
  const swatchClasses = useSlotClass(
    'scheduler.calendarList.swatch',
    schedulerCalendarListSwatchRecipe,
    {},
  );

  if (calendars.length === 0) return null;
  const titleNode =
    props.title === undefined ? t.filterCalendars : props.title;

  return (
    <div className={listClasses}>
      {titleNode != null && (
        <div className="ps-1 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          {titleNode}
        </div>
      )}
      <ul className="flex flex-col gap-0.5">
        {calendars.map((cal) => {
          const checked = visibleSet.has(cal.id);
          return (
            <li key={cal.id} className={itemClasses}>
              <Checkbox
                size="sm"
                color={resolveCheckboxColor(cal.color)}
                checked={checked}
                onCheckedChange={(next) => toggle(cal.id, next)}
              />
              <span
                aria-hidden
                className={swatchClasses}
                style={{ background: resolveSwatchColor(cal.color) }}
              />
              <span className="truncate text-sm text-fg-default">{cal.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

SchedulerCalendarList.displayName = 'Scheduler.CalendarList';

/* ------------------------------------------------------------------ helpers ---- */

const NAMED: ReadonlySet<string> = new Set([
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
]);

/** Map a CalendarSource color into a `<Checkbox color>` slot when it's a named role. */
function resolveCheckboxColor(color: string) {
  if (NAMED.has(color)) {
    return color as
      | 'primary'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'danger'
      | 'info'
      | 'neutral';
  }
  return 'primary';
}

/** Inline background — for raw hex codes we use as-is; for named roles we resolve to the
 *  theme's role-solid CSS variable. */
function resolveSwatchColor(color: string): string {
  if (NAMED.has(color)) return `var(--sds-palette-${color}-solid)`;
  return color;
}