import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DateRange, UseCalendarOptions } from '../src/Calendar/Calendar.types';
import { useCalendar } from '../src/Calendar/headless/useCalendar';

/** Local-time date. March 2024 is used throughout: it starts on a Friday and has 31 days. */
const d = (y: number, m: number, day: number): Date => new Date(y, m - 1, day, 0, 0, 0, 0);

const key = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const setup = (options: UseCalendarOptions = {}) => renderHook(() => useCalendar(options));

/** Every date in the rendered grids, flattened. */
const gridDays = (grids: ReturnType<typeof useCalendar>['monthGrids']) =>
  grids.flatMap((month) => month.flatMap((week) => week));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(d(2024, 3, 15));
});
afterEach(() => {
  vi.useRealTimers();
});

describe('defaults', () => {
  it('defaults to single mode with no value', () => {
    const { result } = setup();
    expect(result.current.mode).toBe('single');
    expect(result.current.value).toBeNull();
  });

  it('defaults to today’s month', () => {
    expect(key(setup().result.current.visibleMonths[0]!)).toBe('2024-03-01');
  });

  it('defaults to one month, outside days shown, fixed weeks', () => {
    const { result } = setup();
    expect(result.current.numberOfMonths).toBe(1);
    expect(result.current.showOutsideDays).toBe(true);
    expect(result.current.fixedWeeks).toBe(true);
  });

  it('renders six rows of seven days', () => {
    const [month] = setup().result.current.monthGrids;
    expect(month).toHaveLength(6);
    for (const week of month!) expect(week).toHaveLength(7);
  });

  it('exposes seven weekday names', () => {
    expect(setup().result.current.weekdays).toHaveLength(7);
  });

  it('marks today', () => {
    const today = gridDays(setup().result.current.monthGrids).filter((day) => day.isToday);
    expect(today).toHaveLength(1);
    expect(key(today[0]!.date)).toBe('2024-03-15');
  });

  it('marks days from adjacent months as outside', () => {
    const days = gridDays(setup().result.current.monthGrids);
    expect(days.find((day) => key(day.date) === '2024-02-26')!.isOutside).toBe(true);
    expect(days.find((day) => key(day.date) === '2024-03-15')!.isOutside).toBe(false);
  });

  it('clamps numberOfMonths to at least one', () => {
    expect(setup({ numberOfMonths: 0 }).result.current.visibleMonths).toHaveLength(1);
  });

  it('renders the requested number of consecutive months', () => {
    const { result } = setup({ numberOfMonths: 3 });
    expect(result.current.visibleMonths.map(key)).toEqual(['2024-03-01', '2024-04-01', '2024-05-01']);
    expect(result.current.monthGrids).toHaveLength(3);
  });
});

describe('initial month resolution', () => {
  it('prefers defaultMonth', () => {
    expect(key(setup({ defaultMonth: d(2025, 7, 20) }).result.current.visibleMonths[0]!)).toBe(
      '2025-07-01',
    );
  });

  it('falls back to the default value’s month in single mode', () => {
    expect(key(setup({ defaultValue: d(2025, 7, 20) }).result.current.visibleMonths[0]!)).toBe(
      '2025-07-01',
    );
  });

  it('falls back to the first selected date in multiple mode', () => {
    const { result } = setup({ mode: 'multiple', defaultValue: [d(2025, 7, 20), d(2025, 8, 1)] });
    expect(key(result.current.visibleMonths[0]!)).toBe('2025-07-01');
  });

  it('falls back to the range start in range mode', () => {
    const { result } = setup({
      mode: 'range',
      defaultValue: { start: d(2025, 7, 20), end: d(2025, 7, 25) },
    });
    expect(key(result.current.visibleMonths[0]!)).toBe('2025-07-01');
  });
});

describe('single mode', () => {
  it('selects a day', () => {
    const { result } = setup();
    act(() => result.current.selectDay(d(2024, 3, 20)));
    expect(key(result.current.value as Date)).toBe('2024-03-20');
  });

  it('replaces the previous selection', () => {
    const { result } = setup();
    act(() => result.current.selectDay(d(2024, 3, 20)));
    act(() => result.current.selectDay(d(2024, 3, 21)));
    expect(key(result.current.value as Date)).toBe('2024-03-21');
  });

  it('normalises the selection to local midnight', () => {
    const { result } = setup();
    act(() => result.current.selectDay(new Date(2024, 2, 20, 17, 42)));
    expect((result.current.value as Date).getHours()).toBe(0);
  });

  it('moves focus to the selected day', () => {
    const { result } = setup();
    act(() => result.current.selectDay(d(2024, 3, 20)));
    expect(key(result.current.focusedDay)).toBe('2024-03-20');
  });

  it('reports the selection on the grid', () => {
    const { result } = setup({ defaultValue: d(2024, 3, 20) });
    const selected = gridDays(result.current.monthGrids).filter((day) => day.isSelected);
    expect(selected.map((day) => key(day.date))).toEqual(['2024-03-20']);
  });

  it('calls onChange with the new value', () => {
    const onChange = vi.fn();
    const { result } = setup({ onChange });
    act(() => result.current.selectDay(d(2024, 3, 20)));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(key(onChange.mock.calls[0]![0] as Date)).toBe('2024-03-20');
  });
});

describe('controlled value', () => {
  it('reports the controlled value', () => {
    const { result } = setup({ value: d(2024, 3, 20) });
    expect(key(result.current.value as Date)).toBe('2024-03-20');
  });

  it('does not move on its own when controlled', () => {
    const { result } = setup({ value: d(2024, 3, 20), onChange: vi.fn() });
    act(() => result.current.selectDay(d(2024, 3, 21)));
    expect(key(result.current.value as Date)).toBe('2024-03-20');
  });

  it('still reports the intended change to onChange', () => {
    const onChange = vi.fn();
    const { result } = setup({ value: d(2024, 3, 20), onChange });
    act(() => result.current.selectDay(d(2024, 3, 21)));
    expect(key(onChange.mock.calls[0]![0] as Date)).toBe('2024-03-21');
  });
});

describe('multiple mode', () => {
  it('accumulates selections', () => {
    const { result } = setup({ mode: 'multiple' });
    act(() => result.current.selectDay(d(2024, 3, 20)));
    act(() => result.current.selectDay(d(2024, 3, 22)));
    expect((result.current.value as Date[]).map(key)).toEqual(['2024-03-20', '2024-03-22']);
  });

  it('toggles a day off when it is picked again', () => {
    const { result } = setup({ mode: 'multiple', defaultValue: [d(2024, 3, 20), d(2024, 3, 22)] });
    act(() => result.current.selectDay(d(2024, 3, 20)));
    expect((result.current.value as Date[]).map(key)).toEqual(['2024-03-22']);
  });

  it('coerces a non-array default to an empty selection', () => {
    expect(setup({ mode: 'multiple', defaultValue: d(2024, 3, 20) }).result.current.value).toEqual([]);
  });

  it('marks every selected day on the grid', () => {
    const { result } = setup({ mode: 'multiple', defaultValue: [d(2024, 3, 20), d(2024, 3, 22)] });
    const selected = gridDays(result.current.monthGrids).filter((day) => day.isSelected);
    expect(selected.map((day) => key(day.date))).toEqual(['2024-03-20', '2024-03-22']);
  });
});

describe('range mode', () => {
  const range = (value: unknown) => value as DateRange;

  it('starts a range with the first pick', () => {
    const { result } = setup({ mode: 'range' });
    act(() => result.current.selectDay(d(2024, 3, 10)));
    expect(key(range(result.current.value).start!)).toBe('2024-03-10');
    expect(range(result.current.value).end).toBeNull();
  });

  it('closes the range with the second pick', () => {
    const { result } = setup({ mode: 'range' });
    act(() => result.current.selectDay(d(2024, 3, 10)));
    act(() => result.current.selectDay(d(2024, 3, 15)));
    expect([key(range(result.current.value).start!), key(range(result.current.value).end!)]).toEqual([
      '2024-03-10',
      '2024-03-15',
    ]);
  });

  it('swaps the endpoints when the second pick is earlier', () => {
    const { result } = setup({ mode: 'range' });
    act(() => result.current.selectDay(d(2024, 3, 15)));
    act(() => result.current.selectDay(d(2024, 3, 10)));
    expect([key(range(result.current.value).start!), key(range(result.current.value).end!)]).toEqual([
      '2024-03-10',
      '2024-03-15',
    ]);
  });

  it('a third pick begins a new range', () => {
    const { result } = setup({ mode: 'range' });
    act(() => result.current.selectDay(d(2024, 3, 10)));
    act(() => result.current.selectDay(d(2024, 3, 15)));
    act(() => result.current.selectDay(d(2024, 3, 20)));
    expect(key(range(result.current.value).start!)).toBe('2024-03-20');
    expect(range(result.current.value).end).toBeNull();
  });

  it('marks the interior days as in-range', () => {
    const { result } = setup({
      mode: 'range',
      defaultValue: { start: d(2024, 3, 10), end: d(2024, 3, 13) },
    });
    const inRange = gridDays(result.current.monthGrids).filter((day) => day.isInRange);
    expect(inRange.map((day) => key(day.date))).toEqual([
      '2024-03-10',
      '2024-03-11',
      '2024-03-12',
      '2024-03-13',
    ]);
  });

  it('marks the endpoints distinctly', () => {
    const { result } = setup({
      mode: 'range',
      defaultValue: { start: d(2024, 3, 10), end: d(2024, 3, 13) },
    });
    const days = gridDays(result.current.monthGrids);
    expect(key(days.find((day) => day.isRangeStart)!.date)).toBe('2024-03-10');
    expect(key(days.find((day) => day.isRangeEnd)!.date)).toBe('2024-03-13');
  });

  it('previews between the open endpoint and the hovered day', () => {
    const { result } = setup({ mode: 'range' });
    act(() => result.current.selectDay(d(2024, 3, 10)));
    act(() => result.current.setHoverPreview(d(2024, 3, 12)));
    const preview = gridDays(result.current.monthGrids).filter((day) => day.isInPreview);
    expect(preview.map((day) => key(day.date))).toEqual(['2024-03-10', '2024-03-11', '2024-03-12']);
  });

  it('previews backwards from the open endpoint too', () => {
    const { result } = setup({ mode: 'range' });
    act(() => result.current.selectDay(d(2024, 3, 12)));
    act(() => result.current.setHoverPreview(d(2024, 3, 10)));
    const preview = gridDays(result.current.monthGrids).filter((day) => day.isInPreview);
    expect(preview.map((day) => key(day.date))).toEqual(['2024-03-10', '2024-03-11', '2024-03-12']);
  });

  it('shows no preview before the first endpoint is picked', () => {
    const { result } = setup({ mode: 'range' });
    act(() => result.current.setHoverPreview(d(2024, 3, 12)));
    expect(gridDays(result.current.monthGrids).some((day) => day.isInPreview)).toBe(false);
  });

  it('clears the preview once the range is closed', () => {
    const { result } = setup({ mode: 'range' });
    act(() => result.current.selectDay(d(2024, 3, 10)));
    act(() => result.current.setHoverPreview(d(2024, 3, 12)));
    act(() => result.current.selectDay(d(2024, 3, 14)));
    expect(result.current.hoverPreview).toBeNull();
  });

  it('never previews in single mode', () => {
    const { result } = setup({ defaultValue: d(2024, 3, 10) });
    act(() => result.current.setHoverPreview(d(2024, 3, 12)));
    expect(gridDays(result.current.monthGrids).some((day) => day.isInPreview)).toBe(false);
  });
});

describe('navigation', () => {
  it('steps back and forward a month', () => {
    const { result } = setup();
    act(() => result.current.goToPrevMonth());
    expect(key(result.current.visibleMonths[0]!)).toBe('2024-02-01');
    act(() => result.current.goToNextMonth());
    expect(key(result.current.visibleMonths[0]!)).toBe('2024-03-01');
  });

  it('steps across a year boundary', () => {
    const { result } = setup({ defaultMonth: d(2024, 1, 1) });
    act(() => result.current.goToPrevMonth());
    expect(key(result.current.visibleMonths[0]!)).toBe('2023-12-01');
  });

  it('steps back and forward a year', () => {
    const { result } = setup();
    act(() => result.current.goToPrevYear());
    expect(key(result.current.visibleMonths[0]!)).toBe('2023-03-01');
    act(() => result.current.goToNextYear());
    expect(key(result.current.visibleMonths[0]!)).toBe('2024-03-01');
  });

  it('jumps to a month within the visible year', () => {
    const { result } = setup();
    act(() => result.current.jumpToMonth(11));
    expect(key(result.current.visibleMonths[0]!)).toBe('2024-12-01');
  });

  it('jumps to a year keeping the month', () => {
    const { result } = setup();
    act(() => result.current.jumpToYear(2030));
    expect(key(result.current.visibleMonths[0]!)).toBe('2030-03-01');
  });

  it('calls onMonthChange with the normalised month', () => {
    const onMonthChange = vi.fn();
    const { result } = setup({ onMonthChange });
    act(() => result.current.goToNextMonth());
    expect(key(onMonthChange.mock.calls[0]![0] as Date)).toBe('2024-04-01');
  });

  it('does not move a controlled month, but still reports the intent', () => {
    const onMonthChange = vi.fn();
    const { result } = setup({ month: d(2024, 3, 1), onMonthChange });
    act(() => result.current.goToNextMonth());
    expect(key(result.current.visibleMonths[0]!)).toBe('2024-03-01');
    expect(key(onMonthChange.mock.calls[0]![0] as Date)).toBe('2024-04-01');
  });

  it('normalises a controlled month to its first day', () => {
    expect(key(setup({ month: d(2024, 3, 20) }).result.current.visibleMonths[0]!)).toBe('2024-03-01');
  });
});

describe('disabled days', () => {
  it('disables days before min', () => {
    const { result } = setup({ min: d(2024, 3, 10) });
    const days = gridDays(result.current.monthGrids);
    expect(days.find((day) => key(day.date) === '2024-03-09')!.isDisabled).toBe(true);
    expect(days.find((day) => key(day.date) === '2024-03-10')!.isDisabled).toBe(false);
  });

  it('disables days after max', () => {
    const { result } = setup({ max: d(2024, 3, 20) });
    const days = gridDays(result.current.monthGrids);
    expect(days.find((day) => key(day.date) === '2024-03-21')!.isDisabled).toBe(true);
    expect(days.find((day) => key(day.date) === '2024-03-20')!.isDisabled).toBe(false);
  });

  it('compares min and max by day, not by instant', () => {
    const { result } = setup({ min: new Date(2024, 2, 10, 17, 42) });
    const days = gridDays(result.current.monthGrids);
    expect(days.find((day) => key(day.date) === '2024-03-10')!.isDisabled).toBe(false);
  });

  it('honours a custom predicate', () => {
    const { result } = setup({ isDateDisabled: (day) => day.getDay() === 0 });
    const disabled = gridDays(result.current.monthGrids).filter((day) => day.isDisabled);
    expect(disabled.every((day) => day.date.getDay() === 0)).toBe(true);
    expect(disabled.length).toBeGreaterThan(0);
  });

  it('refuses to select a disabled day', () => {
    const onChange = vi.fn();
    const { result } = setup({ min: d(2024, 3, 10), onChange });
    act(() => result.current.selectDay(d(2024, 3, 5)));
    expect(result.current.value).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clamps the focused day into the min/max window', () => {
    const { result } = setup({ min: d(2024, 3, 10), max: d(2024, 3, 20) });
    act(() => result.current.setFocusedDay(d(2024, 3, 25)));
    expect(key(result.current.focusedDay)).toBe('2024-03-20');
  });
});

describe('outside days and fixed weeks', () => {
  it('disables outside days when they are hidden', () => {
    const { result } = setup({ showOutsideDays: false });
    const outside = gridDays(result.current.monthGrids).filter((day) => day.isOutside);
    expect(outside.length).toBeGreaterThan(0);
    expect(outside.every((day) => day.isDisabled && !day.isSelected && !day.isToday)).toBe(true);
  });

  it('always renders six rows with fixedWeeks', () => {
    // February 2026 starts on a Sunday and has 28 days — exactly four weeks.
    expect(setup({ defaultMonth: d(2026, 2, 1), fixedWeeks: true }).result.current.monthGrids[0]).toHaveLength(6);
  });

  it('drops trailing all-outside rows without fixedWeeks', () => {
    const { result } = setup({ defaultMonth: d(2026, 2, 1), fixedWeeks: false });
    expect(result.current.monthGrids[0]!.length).toBeLessThan(6);
  });

  it('keeps a row that contains any in-month day', () => {
    const { result } = setup({ defaultMonth: d(2024, 3, 1), fixedWeeks: false });
    const lastRow = result.current.monthGrids[0]!.at(-1)!;
    expect(lastRow.some((day) => !day.isOutside)).toBe(true);
  });
});

describe('locale', () => {
  it('defaults to a Sunday-first week for en-US', () => {
    expect(setup().result.current.weekStartsOn).toBe(0);
  });

  it('honours an explicit weekStartsOn', () => {
    const { result } = setup({ weekStartsOn: 1 });
    expect(result.current.weekStartsOn).toBe(1);
    expect(result.current.monthGrids[0]![0]![0]!.date.getDay()).toBe(1);
  });

  it('names weekdays in the requested locale', () => {
    expect(setup({ locale: 'fr-FR' }).result.current.weekdays).toHaveLength(7);
    expect(setup({ locale: 'fr-FR' }).result.current.weekdays).not.toEqual(
      setup({ locale: 'en-US' }).result.current.weekdays,
    );
  });

  it('exposes merged translations', () => {
    const { result } = setup({ translations: { nextMonth: 'Suivant' } });
    expect(result.current.t.nextMonth).toBe('Suivant');
    expect(result.current.t.previousMonth).toBe('Previous month');
  });
});
