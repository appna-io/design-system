'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  addMonths,
  computeMonthGrid,
  isSameDay,
  startOfMonth,
} from '../helpers/dateMath';
import { useSlotClass } from '../helpers/useSlotClass';
import {
  schedulerMiniMonthDayRecipe,
  schedulerMiniMonthDowRecipe,
  schedulerMiniMonthGridRecipe,
  schedulerMiniMonthHeaderRecipe,
  schedulerMiniMonthNavBtnRecipe,
  schedulerMiniMonthRecipe,
} from '../Scheduler.recipe';
import { useSchedulerContext } from '../SchedulerContext';

export interface SchedulerMiniMonthProps {
  /** Override the anchor (uncontrolled). Defaults to `state.date`. */
  defaultMonth?: Date;
}

/**
 * Compact month grid for the sidebar. Local-state month anchor (so navigating the mini
 * month doesn't move the main view) — clicking a day calls `ctx.setDate(day)` to jump.
 *
 * Uses the same `computeMonthGrid` helper as `MonthView`, keeping the date math in one
 * place and ready for promotion to the future `<Calendar>` primitive.
 */
export function SchedulerMiniMonth(props: SchedulerMiniMonthProps) {
  const ctx = useSchedulerContext();
  const { t, state, locale, weekStartsOn } = ctx;
  const [anchor, setAnchor] = useState<Date>(
    () => props.defaultMonth ?? startOfMonth(state.date),
  );

  const today = useMemo(() => new Date(), []);
  const cells = useMemo(
    () => computeMonthGrid(anchor, weekStartsOn),
    [anchor, weekStartsOn],
  );

  const monthTitle = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(anchor),
    [anchor, locale],
  );

  /* Day-of-week initials, rotated to the active `weekStartsOn`. */
  const dowLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
    const ref = new Date(2024, 0, 7); // a known Sunday
    const out: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(ref);
      d.setDate(ref.getDate() + ((i + weekStartsOn) % 7));
      out.push(fmt.format(d));
    }
    return out;
  }, [locale, weekStartsOn]);

  const rootClasses = useSlotClass('scheduler.miniMonth', schedulerMiniMonthRecipe, {});
  const headerClasses = useSlotClass(
    'scheduler.miniMonth.header',
    schedulerMiniMonthHeaderRecipe,
    {},
  );
  const navClasses = useSlotClass(
    'scheduler.miniMonth.nav',
    schedulerMiniMonthNavBtnRecipe,
    {},
  );
  const gridClasses = useSlotClass(
    'scheduler.miniMonth.grid',
    schedulerMiniMonthGridRecipe,
    {},
  );
  const dowClasses = useSlotClass(
    'scheduler.miniMonth.dow',
    schedulerMiniMonthDowRecipe,
    {},
  );

  return (
    <div className={rootClasses}>
      <div className={headerClasses}>
        <button
          type="button"
          className={navClasses}
          onClick={() => setAnchor((m) => addMonths(m, -1))}
          aria-label={t.prev}
        >
          <ChevronLeft aria-hidden size={14} />
        </button>
        <span className="text-xs font-semibold">{monthTitle}</span>
        <button
          type="button"
          className={navClasses}
          onClick={() => setAnchor((m) => addMonths(m, 1))}
          aria-label={t.next}
        >
          <ChevronRight aria-hidden size={14} />
        </button>
      </div>

      <div className={gridClasses}>
        {dowLabels.map((label, i) => (
          <div key={`dow-${i}`} className={dowClasses} aria-hidden>
            {label}
          </div>
        ))}

        {cells.map((day) => {
          const isCurrentMonth = day.getMonth() === anchor.getMonth();
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, state.date);
          return (
            <MiniDay
              key={day.toISOString()}
              day={day}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isSelected={isSelected}
              onPick={() => {
                ctx.setDate(day);
                setAnchor(startOfMonth(day));
              }}
              label={day.getDate()}
            />
          );
        })}
      </div>
    </div>
  );
}

SchedulerMiniMonth.displayName = 'Scheduler.MiniMonth';

interface MiniDayProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onPick: () => void;
  label: number;
}

function MiniDay(p: MiniDayProps) {
  const classes = useSlotClass(
    'scheduler.miniMonth.day',
    schedulerMiniMonthDayRecipe,
    {
      isCurrentMonth: p.isCurrentMonth,
      isToday: p.isToday,
      isSelected: p.isSelected,
    },
  );
  return (
    <button
      type="button"
      className={classes}
      onClick={p.onPick}
      aria-pressed={p.isSelected}
      aria-current={p.isToday ? 'date' : undefined}
      aria-label={p.day.toDateString()}
    >
      {p.label}
    </button>
  );
}