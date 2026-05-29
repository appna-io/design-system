'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import {
  DEFAULT_CALENDAR_TRANSLATIONS,
  mergeCalendarTranslations,
} from '../Calendar.i18n';
import type {
  CalendarDay,
  CalendarMode,
  DateRange,
  UseCalendarOptions,
  UseCalendarReturn,
} from '../Calendar.types';
import {
  addMonths,
  addYears,
  clampDate,
  computeMonthGrid,
  isSameDay,
  isSameMonth,
  isWithin,
  startOfDay,
  startOfMonth,
} from '../helpers/dateMath';
import { getFirstDayOfWeek, getWeekdayNames, type Weekday } from '../helpers/locale';

/* -------------------------------------------------------------------------- */
/*  Headless `<Calendar>` state machine                                        */
/* -------------------------------------------------------------------------- */
/* Mode-aware (single / multiple / range), controlled-or-uncontrolled for both
 * `value` and `month`. The hook owns:
 *
 *   - the active selection (mode-dependent payload)
 *   - the visible month anchor (drives `monthGrids` + the header title)
 *   - the hover preview (range-mode UX during in-flight selection)
 *   - the focused day (roving tabindex for the W3C grid pattern)
 *
 * Everything derived (`monthGrids`, `weekdays`, predicates) is memoized on the
 * narrow set of inputs that matter; the hook re-renders consumers only when one
 * of those inputs changes, which is what keeps Calendar's perf budget tight.
 */

const EMPTY_RANGE: DateRange = { start: null, end: null };

function normaliseValue(
  mode: CalendarMode,
  raw: Date | Date[] | DateRange | null | undefined,
): Date | Date[] | DateRange | null {
  if (mode === 'single') {
    return raw instanceof Date ? raw : null;
  }
  if (mode === 'multiple') {
    return Array.isArray(raw) ? raw : [];
  }
  if (raw && typeof raw === 'object' && 'start' in raw && 'end' in raw) {
    return raw as DateRange;
  }
  return EMPTY_RANGE;
}

function pickInitialMonth(
  mode: CalendarMode,
  value: Date | Date[] | DateRange | null,
  defaultMonth?: Date,
): Date {
  if (defaultMonth) return startOfMonth(defaultMonth);
  if (mode === 'single' && value instanceof Date) return startOfMonth(value);
  if (mode === 'multiple' && Array.isArray(value) && value[0]) {
    return startOfMonth(value[0]);
  }
  if (mode === 'range' && value && 'start' in value && value.start) {
    return startOfMonth(value.start);
  }
  return startOfMonth(new Date());
}

function pickInitialFocusedDay(
  value: Date | Date[] | DateRange | null,
  visibleMonth: Date,
): Date {
  if (value instanceof Date) return startOfDay(value);
  if (Array.isArray(value) && value[0]) return startOfDay(value[0]);
  if (value && typeof value === 'object' && 'start' in value && value.start) {
    return startOfDay(value.start);
  }
  const today = startOfDay(new Date());
  if (isSameMonth(today, visibleMonth)) return today;
  return startOfDay(visibleMonth);
}

export function useCalendar(options: UseCalendarOptions = {}): UseCalendarReturn {
  const mode: CalendarMode = options.mode ?? 'single';
  const locale = options.locale ?? 'en-US';
  const weekStartsOn: Weekday =
    (options.weekStartsOn as Weekday | undefined) ?? getFirstDayOfWeek(locale);
  const numberOfMonths = Math.max(1, options.numberOfMonths ?? 1);
  const showOutsideDays = options.showOutsideDays ?? true;
  const fixedWeeks = options.fixedWeeks ?? true; // Calendar defaults to fixed; less jank.

  /* ---------------- controlled / uncontrolled VALUE ----------------------- */

  const isValueControlled = options.value !== undefined;
  const [internalValue, setInternalValue] = useState<Date | Date[] | DateRange | null>(
    () => normaliseValue(mode, options.defaultValue ?? null),
  );
  const value = isValueControlled ? normaliseValue(mode, options.value) : internalValue;

  const onChangeRef = useRef(options.onChange);
  onChangeRef.current = options.onChange;

  const setValue = useCallback(
    (next: Date | Date[] | DateRange | null) => {
      const normalised = normaliseValue(mode, next);
      if (!isValueControlled) setInternalValue(normalised);
      onChangeRef.current?.(normalised);
    },
    [mode, isValueControlled],
  );

  /* ---------------- controlled / uncontrolled MONTH ----------------------- */

  const isMonthControlled = options.month !== undefined;
  const [internalMonth, setInternalMonth] = useState<Date>(() =>
    pickInitialMonth(mode, normaliseValue(mode, options.defaultValue ?? null), options.defaultMonth),
  );
  const visibleMonth = isMonthControlled
    ? startOfMonth(options.month as Date)
    : internalMonth;

  const onMonthChangeRef = useRef(options.onMonthChange);
  onMonthChangeRef.current = options.onMonthChange;

  const setMonth = useCallback(
    (next: Date) => {
      const normalised = startOfMonth(next);
      if (!isMonthControlled) setInternalMonth(normalised);
      onMonthChangeRef.current?.(normalised);
    },
    [isMonthControlled],
  );

  /* ---------------- hover preview (range only) ---------------------------- */

  const [hoverPreview, setHoverPreviewState] = useState<Date | null>(null);
  const setHoverPreview = useCallback((d: Date | null) => {
    setHoverPreviewState(d ? startOfDay(d) : null);
  }, []);

  /* ---------------- focused day (roving tabindex) ------------------------- */

  const [focusedDay, setFocusedDayState] = useState<Date>(() =>
    pickInitialFocusedDay(normaliseValue(mode, options.defaultValue ?? null), visibleMonth),
  );
  const setFocusedDay = useCallback((d: Date) => {
    setFocusedDayState(startOfDay(d));
  }, []);

  /* ---------------- predicates -------------------------------------------- */

  const isDateDisabledFn = useCallback(
    (d: Date): boolean => {
      const day = startOfDay(d);
      if (options.min && day.getTime() < startOfDay(options.min).getTime()) return true;
      if (options.max && day.getTime() > startOfDay(options.max).getTime()) return true;
      return options.isDateDisabled?.(day) ?? false;
    },
    [options.min, options.max, options.isDateDisabled],
  );

  const isDateSelected = useCallback(
    (d: Date): boolean => {
      const day = startOfDay(d);
      if (value instanceof Date) return isSameDay(day, value);
      if (Array.isArray(value)) return value.some((v) => isSameDay(day, v));
      if (value && 'start' in value) {
        return (
          (value.start ? isSameDay(day, value.start) : false) ||
          (value.end ? isSameDay(day, value.end) : false)
        );
      }
      return false;
    },
    [value],
  );

  const isDateInRange = useCallback(
    (d: Date): boolean => {
      if (mode !== 'range' || !value || !('start' in value)) return false;
      if (!value.start || !value.end) return false;
      return isWithin(startOfDay(d), startOfDay(value.start), startOfDay(value.end));
    },
    [mode, value],
  );

  const isDateRangeStart = useCallback(
    (d: Date): boolean => {
      if (mode !== 'range' || !value || !('start' in value) || !value.start) return false;
      return isSameDay(startOfDay(d), value.start);
    },
    [mode, value],
  );

  const isDateRangeEnd = useCallback(
    (d: Date): boolean => {
      if (mode !== 'range' || !value || !('start' in value) || !value.end) return false;
      return isSameDay(startOfDay(d), value.end);
    },
    [mode, value],
  );

  const isDateInPreview = useCallback(
    (d: Date): boolean => {
      if (mode !== 'range' || !hoverPreview || !value || !('start' in value)) return false;
      // Only show preview after the first endpoint is picked but before the second.
      if (!value.start || value.end) return false;
      const day = startOfDay(d).getTime();
      const lo = Math.min(value.start.getTime(), hoverPreview.getTime());
      const hi = Math.max(value.start.getTime(), hoverPreview.getTime());
      return day >= lo && day <= hi;
    },
    [mode, value, hoverPreview],
  );

  /* ---------------- selection action --------------------------------------- */

  const selectDay = useCallback(
    (d: Date) => {
      if (isDateDisabledFn(d)) return;
      const day = startOfDay(d);

      if (mode === 'single') {
        setValue(day);
        setFocusedDay(day);
        return;
      }

      if (mode === 'multiple') {
        const current = Array.isArray(value) ? value : [];
        const exists = current.some((v) => isSameDay(v, day));
        const next = exists ? current.filter((v) => !isSameDay(v, day)) : [...current, day];
        setValue(next);
        setFocusedDay(day);
        return;
      }

      /* range */
      const current: DateRange = value && 'start' in value ? value : EMPTY_RANGE;
      const { start, end } = current;
      if (!start || (start && end)) {
        // Begin a new range — pick first endpoint, clear second.
        setValue({ start: day, end: null });
      } else {
        // Second endpoint — order may need swapping.
        if (day.getTime() < start.getTime()) {
          setValue({ start: day, end: start });
        } else {
          setValue({ start, end: day });
        }
        // Clear hover preview after committing the second endpoint.
        setHoverPreview(null);
      }
      setFocusedDay(day);
    },
    [mode, value, setValue, isDateDisabledFn, setFocusedDay, setHoverPreview],
  );

  /* ---------------- nav actions -------------------------------------------- */

  const goToPrevMonth = useCallback(() => setMonth(addMonths(visibleMonth, -1)), [
    setMonth,
    visibleMonth,
  ]);
  const goToNextMonth = useCallback(() => setMonth(addMonths(visibleMonth, 1)), [
    setMonth,
    visibleMonth,
  ]);
  const goToPrevYear = useCallback(() => setMonth(addYears(visibleMonth, -1)), [
    setMonth,
    visibleMonth,
  ]);
  const goToNextYear = useCallback(() => setMonth(addYears(visibleMonth, 1)), [
    setMonth,
    visibleMonth,
  ]);
  const jumpToMonth = useCallback(
    (m: number) => setMonth(new Date(visibleMonth.getFullYear(), m, 1)),
    [setMonth, visibleMonth],
  );
  const jumpToYear = useCallback(
    (y: number) => setMonth(new Date(y, visibleMonth.getMonth(), 1)),
    [setMonth, visibleMonth],
  );

  /* ---------------- visible months + grids -------------------------------- */

  const visibleMonths = useMemo<Date[]>(() => {
    const out: Date[] = [];
    for (let i = 0; i < numberOfMonths; i++) {
      out.push(startOfMonth(addMonths(visibleMonth, i)));
    }
    return out;
  }, [visibleMonth, numberOfMonths]);

  const weekdays = useMemo(
    () => getWeekdayNames(locale, weekStartsOn),
    [locale, weekStartsOn],
  );

  const today = useMemo(() => startOfDay(new Date()), []);

  const monthGrids = useMemo<CalendarDay[][][]>(() => {
    return visibleMonths.map((monthAnchor) => {
      const flat = computeMonthGrid(monthAnchor, weekStartsOn);
      const rows: CalendarDay[][] = [];
      // 42 cells → 6 weeks of 7. If `fixedWeeks` is false and the last row is fully outside,
      // we'll drop it after composing the descriptors.
      for (let row = 0; row < 6; row++) {
        const week: CalendarDay[] = [];
        for (let col = 0; col < 7; col++) {
          const date = flat[row * 7 + col]!;
          const isOutside = !isSameMonth(date, monthAnchor);
          const isToday = isSameDay(date, today);
          const isSelected = isDateSelected(date);
          const inRange = isDateInRange(date);
          const isRangeStart = isDateRangeStart(date);
          const isRangeEnd = isDateRangeEnd(date);
          const inPreview = isDateInPreview(date);
          const isDisabled = isDateDisabledFn(date);
          if (!showOutsideDays && isOutside) {
            week.push({
              date,
              isOutside: true,
              isToday: false,
              isSelected: false,
              isInRange: false,
              isRangeStart: false,
              isRangeEnd: false,
              isInPreview: false,
              isDisabled: true,
            });
            continue;
          }
          week.push({
            date,
            isOutside,
            isToday,
            isSelected,
            isInRange: inRange,
            isRangeStart,
            isRangeEnd,
            isInPreview: inPreview,
            isDisabled,
          });
        }
        rows.push(week);
      }
      if (!fixedWeeks) {
        while (rows.length > 0 && rows[rows.length - 1]!.every((c) => c.isOutside)) {
          rows.pop();
        }
      }
      return rows;
    });
  }, [
    visibleMonths,
    weekStartsOn,
    today,
    isDateSelected,
    isDateInRange,
    isDateRangeStart,
    isDateRangeEnd,
    isDateInPreview,
    isDateDisabledFn,
    showOutsideDays,
    fixedWeeks,
  ]);

  /* ---------------- translations ------------------------------------------ */

  const t = useMemo(
    () => mergeCalendarTranslations(DEFAULT_CALENDAR_TRANSLATIONS, undefined, options.translations),
    [options.translations],
  );

  /* ---------------- return ------------------------------------------------- */

  // Keep min/max-clamped focused day in sync.
  const clampedFocusedDay = useMemo(
    () => clampDate(focusedDay, options.min, options.max),
    [focusedDay, options.min, options.max],
  );

  return {
    mode,
    value,
    visibleMonths,
    weekdays,
    monthGrids,
    hoverPreview,
    focusedDay: clampedFocusedDay,
    setValue,
    selectDay,
    goToPrevMonth,
    goToNextMonth,
    goToPrevYear,
    goToNextYear,
    jumpToMonth,
    jumpToYear,
    setHoverPreview,
    setFocusedDay,
    isDateInRange,
    isDateRangeStart,
    isDateRangeEnd,
    isDateSelected,
    isDateDisabledFn,
    isDateInPreview,
    t,
    locale,
    weekStartsOn,
    numberOfMonths,
    showOutsideDays,
    fixedWeeks,
  };
}
