'use client';

import { forwardRef, useId } from '@apx-ui/engine';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useMemo, type ReactElement } from 'react';

import {
  calendarHeaderRecipe,
  calendarHeaderTitleRecipe,
  calendarMonthRecipe,
  calendarMonthsRowRecipe,
  calendarNavButtonRecipe,
  calendarRootRecipe,
} from './Calendar.recipe';
import type { CalendarProps } from './Calendar.types';
import {
  CalendarContext,
  useCalendarContext,
  type CalendarContextValue,
} from './CalendarContext';
import { useCalendar } from './headless/useCalendar';
import { useSlotClass } from './helpers/useSlotClass';
import { getMonthYearTitle } from './helpers/locale';
import { CalendarMonthGrid } from './parts/CalendarMonthGrid';

/**
 * The canonical date primitive. `<Calendar>` is the headless + DOM root for date selection —
 * it's the foundation for `<DatePicker>` (single date, popover-anchored), `<DateRangePicker>`
 * (range, two-month popover), and the Scheduler's `<Scheduler.MiniMonth>` sidebar widget.
 *
 *   <Calendar value={d} onChange={setD} mode="single" />
 *
 *   <Calendar
 *     mode="range"
 *     numberOfMonths={2}
 *     value={range}
 *     onChange={setRange}
 *   />
 *
 *   <Calendar
 *     mode="multiple"
 *     value={dates}
 *     onChange={setDates}
 *     isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
 *   />
 *
 * The component is fully controllable (`value` + `month`) and fully uncontrolled
 * (`defaultValue` + `defaultMonth`). Mode-aware selection lives in `useCalendar()`; the
 * top-level component is a thin layout that publishes context, renders the header, and
 * delegates the grid drawing to `<CalendarMonthGrid>` for each visible month.
 */
function CalendarImpl(
  props: CalendarProps,
  ref: React.ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    mode,
    value,
    defaultValue,
    onChange,
    month,
    defaultMonth,
    onMonthChange,
    numberOfMonths,
    min,
    max,
    isDateDisabled,
    locale,
    weekStartsOn,
    variant = 'solid',
    size = 'md',
    color = 'primary',
    showWeekNumbers = false,
    showOutsideDays = true,
    fixedWeeks = true,
    renderDay,
    renderWeekday,
    renderHeader,
    onDayHover,
    onDayLeave,
    translations,
    className,
    style,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props;

  const headless = useCalendar({
    mode,
    value,
    defaultValue,
    onChange,
    month,
    defaultMonth,
    onMonthChange,
    numberOfMonths,
    min,
    max,
    isDateDisabled,
    locale,
    weekStartsOn,
    fixedWeeks,
    showOutsideDays,
    translations,
  });

  const reactId = useId();
  const rootId = `calendar-${reactId}`;

  const ctxValue = useMemo<CalendarContextValue>(
    () => ({
      ...headless,
      variant: variant as 'solid' | 'outline' | 'soft' | 'minimal',
      size: size as 'sm' | 'md' | 'lg',
      color: color as
        | 'primary'
        | 'secondary'
        | 'success'
        | 'warning'
        | 'danger'
        | 'info'
        | 'neutral',
      showWeekNumbers,
      rootId,
    }),
    [headless, variant, size, color, showWeekNumbers, rootId],
  );

  const rootClass = useSlotClass('calendar.root', calendarRootRecipe, { variant, size });

  return (
    <CalendarContext.Provider value={ctxValue}>
      <div
        ref={ref}
        className={[rootClass, className].filter(Boolean).join(' ')}
        role="group"
        aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : ctxValue.t.calendarDialog)}
        aria-labelledby={ariaLabelledBy}
        style={style}
        {...rest}
      >
        {renderHeader ? (
          renderHeader({
            month: ctxValue.visibleMonths[0]!,
            numberOfMonths: ctxValue.numberOfMonths,
            goToPrevMonth: ctxValue.goToPrevMonth,
            goToNextMonth: ctxValue.goToNextMonth,
            goToPrevYear: ctxValue.goToPrevYear,
            goToNextYear: ctxValue.goToNextYear,
            jumpToMonth: ctxValue.jumpToMonth,
            jumpToYear: ctxValue.jumpToYear,
          })
        ) : (
          <DefaultCalendarHeader />
        )}

        <MonthsRow
          renderDay={renderDay}
          renderWeekday={renderWeekday}
          onDayHover={onDayHover}
          onDayLeave={onDayLeave}
        />
      </div>
    </CalendarContext.Provider>
  );
}

CalendarImpl.displayName = 'Calendar';

export const Calendar = forwardRef(CalendarImpl);

/* -------------------------------------------------------------------------- */
/*  Default header                                                             */
/* -------------------------------------------------------------------------- */

function DefaultCalendarHeader() {
  const ctx = useCalendarContextStrict();
  const { visibleMonths, locale, t, numberOfMonths, size, rootId } = ctx;
  const leadingMonth = visibleMonths[0]!;
  const trailingMonth = visibleMonths[visibleMonths.length - 1]!;
  const headerClass = useSlotClass('calendar.header', calendarHeaderRecipe, {});
  const titleClass = useSlotClass('calendar.headerTitle', calendarHeaderTitleRecipe, { size });
  const navClass = useSlotClass('calendar.navButton', calendarNavButtonRecipe, { size });

  const title = useMemo(() => {
    if (numberOfMonths === 1) return getMonthYearTitle(leadingMonth, locale);
    return `${getMonthYearTitle(leadingMonth, locale)} – ${getMonthYearTitle(trailingMonth, locale)}`;
  }, [leadingMonth, trailingMonth, locale, numberOfMonths]);

  return (
    <div className={headerClass}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={navClass}
          onClick={ctx.goToPrevYear}
          aria-label={t.previousYear}
        >
          <ChevronsLeft aria-hidden size={iconSize(size)} />
        </button>
        <button
          type="button"
          className={navClass}
          onClick={ctx.goToPrevMonth}
          aria-label={t.previousMonth}
        >
          <ChevronLeft aria-hidden size={iconSize(size)} />
        </button>
      </div>

      <span id={`${rootId}-title`} className={titleClass} aria-live="polite">
        {title}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={navClass}
          onClick={ctx.goToNextMonth}
          aria-label={t.nextMonth}
        >
          <ChevronRight aria-hidden size={iconSize(size)} />
        </button>
        <button
          type="button"
          className={navClass}
          onClick={ctx.goToNextYear}
          aria-label={t.nextYear}
        >
          <ChevronsRight aria-hidden size={iconSize(size)} />
        </button>
      </div>
    </div>
  );
}

function iconSize(size: 'sm' | 'md' | 'lg'): number {
  if (size === 'sm') return 14;
  if (size === 'lg') return 18;
  return 16;
}

/* -------------------------------------------------------------------------- */
/*  Months row                                                                 */
/* -------------------------------------------------------------------------- */

interface MonthsRowProps {
  renderDay?: CalendarProps['renderDay'];
  renderWeekday?: CalendarProps['renderWeekday'];
  onDayHover?: CalendarProps['onDayHover'];
  onDayLeave?: CalendarProps['onDayLeave'];
}

function MonthsRow(props: MonthsRowProps) {
  const ctx = useCalendarContextStrict();
  const { visibleMonths } = ctx;
  const rowClass = useSlotClass('calendar.monthsRow', calendarMonthsRowRecipe, {});
  const monthClass = useSlotClass('calendar.month', calendarMonthRecipe, {});

  return (
    <div className={rowClass}>
      {visibleMonths.map((monthAnchor, index) => (
        <div key={monthAnchor.toISOString()} className={monthClass}>
          <CalendarMonthGrid
            monthAnchor={monthAnchor}
            monthIndex={index}
            renderDay={props.renderDay}
            renderWeekday={props.renderWeekday}
            onDayHover={props.onDayHover}
            onDayLeave={props.onDayLeave}
          />
        </div>
      ))}
    </div>
  );
}

const useCalendarContextStrict = useCalendarContext;
