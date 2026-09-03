import { DirectionProvider } from '@apx-ui/engine';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { KeyboardEvent, ReactNode } from 'react';

import type { CalendarContextValue } from '../src/Calendar/CalendarContext';
import { CalendarContext } from '../src/Calendar/CalendarContext';
import type { UseCalendarOptions } from '../src/Calendar/Calendar.types';
import { useCalendar } from '../src/Calendar/headless/useCalendar';
import { useCalendarKeyboard } from '../src/Calendar/headless/useCalendarKeyboard';

const d = (y: number, m: number, day: number): Date => new Date(y, m - 1, day, 0, 0, 0, 0);

const key = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

/** A keyboard event stub carrying only what the handler reads. */
const press = (
  keyName: string,
  modifiers: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } = {},
) =>
  ({
    key: keyName,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...modifiers,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }) as unknown as KeyboardEvent & { preventDefault: ReturnType<typeof vi.fn> };

/**
 * Drives the real `useCalendar` behind the real context, so the handler is exercised against
 * the same state machine the component wires up — not a hand-built stub that could drift.
 */
const withKeyboard = (options: UseCalendarOptions = {}, dir: 'ltr' | 'rtl' = 'ltr') => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DirectionProvider dir={dir}>{children}</DirectionProvider>
  );

  const harness = renderHook(
    () => {
      const calendar = useCalendar(options);
      const ctx = {
        ...calendar,
        variant: 'solid',
        size: 'md',
        color: 'primary',
        showWeekNumbers: false,
        rootId: 'cal',
      } as CalendarContextValue;
      return { calendar, ctx };
    },
    { wrapper },
  );

  const keyboard = renderHook(() => useCalendarKeyboard(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <DirectionProvider dir={dir}>
        <CalendarContext.Provider value={harness.result.current.ctx}>
          {children}
        </CalendarContext.Provider>
      </DirectionProvider>
    ),
  });

  const send = (
    keyName: string,
    modifiers: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } = {},
  ) => {
    const event = press(keyName, modifiers);
    act(() => keyboard.result.current(event));
    keyboard.rerender();
    return event;
  };

  return {
    send,
    focusedDay: () => key(harness.result.current.calendar.focusedDay),
    visibleMonth: () => key(harness.result.current.calendar.visibleMonths[0]!),
    value: () => harness.result.current.calendar.value,
  };
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(d(2024, 3, 15));
});
afterEach(() => {
  vi.useRealTimers();
});

describe('day movement', () => {
  it('ArrowLeft steps back a day', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('ArrowLeft');
    expect(cal.focusedDay()).toBe('2024-03-14');
  });

  it('ArrowRight steps forward a day', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('ArrowRight');
    expect(cal.focusedDay()).toBe('2024-03-16');
  });

  it('ArrowUp steps back a week', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('ArrowUp');
    expect(cal.focusedDay()).toBe('2024-03-08');
  });

  it('ArrowDown steps forward a week', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('ArrowDown');
    expect(cal.focusedDay()).toBe('2024-03-22');
  });
});

describe('direction awareness', () => {
  it('mirrors the horizontal arrows under RTL', () => {
    // Regression: the handler read `document.documentElement.dir` directly — the only place in
    // the package that did — so a scoped `<DirectionProvider dir="rtl">` (or `<ThemeProvider
    // dir>`) never reached it and arrow keys ran backwards inside an RTL subtree.
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) }, 'rtl');
    cal.send('ArrowLeft');
    expect(cal.focusedDay()).toBe('2024-03-16');
    cal.send('ArrowRight');
    expect(cal.focusedDay()).toBe('2024-03-15');
  });

  it('leaves the vertical arrows unmirrored under RTL', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) }, 'rtl');
    cal.send('ArrowUp');
    expect(cal.focusedDay()).toBe('2024-03-08');
  });

  it('is unaffected by document.dir when a provider is present', () => {
    document.documentElement.dir = 'rtl';
    try {
      const cal = withKeyboard({ defaultValue: d(2024, 3, 15) }, 'ltr');
      cal.send('ArrowLeft');
      expect(cal.focusedDay()).toBe('2024-03-14');
    } finally {
      document.documentElement.dir = '';
    }
  });
});

describe('week and month boundaries', () => {
  it('Home moves to the first day of the week', () => {
    // 2024-03-15 is a Friday; a Sunday-first week starts on the 10th.
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('Home');
    expect(cal.focusedDay()).toBe('2024-03-10');
  });

  it('End moves to the last day of the week', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('End');
    expect(cal.focusedDay()).toBe('2024-03-16');
  });

  it('Home honours a Monday-first week', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15), weekStartsOn: 1 });
    cal.send('Home');
    expect(cal.focusedDay()).toBe('2024-03-11');
  });

  it('Ctrl+Home moves to the first day of the month', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('Home', { ctrlKey: true });
    expect(cal.focusedDay()).toBe('2024-03-01');
  });

  it('Cmd+End moves to the last day of the month', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('End', { metaKey: true });
    expect(cal.focusedDay()).toBe('2024-03-31');
  });
});

describe('paging', () => {
  it('PageUp moves back a month', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('PageUp');
    expect(cal.focusedDay()).toBe('2024-02-15');
  });

  it('PageDown moves forward a month', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('PageDown');
    expect(cal.focusedDay()).toBe('2024-04-15');
  });

  it('Shift+PageUp moves back a year', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('PageUp', { shiftKey: true });
    expect(cal.focusedDay()).toBe('2023-03-15');
  });

  it('Shift+PageDown moves forward a year', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('PageDown', { shiftKey: true });
    expect(cal.focusedDay()).toBe('2025-03-15');
  });
});

describe('keeping the focused day in view', () => {
  it('scrolls back a month when focus leaves the top of the grid', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 1) });
    cal.send('ArrowUp');
    expect(cal.focusedDay()).toBe('2024-02-23');
    expect(cal.visibleMonth()).toBe('2024-02-01');
  });

  it('scrolls forward a month when focus leaves the bottom', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 31) });
    cal.send('ArrowDown');
    expect(cal.focusedDay()).toBe('2024-04-07');
    expect(cal.visibleMonth()).toBe('2024-04-01');
  });

  it('follows a PageUp into the previous month', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('PageUp');
    expect(cal.visibleMonth()).toBe('2024-02-01');
  });

  it('scrolls a whole YEAR for Shift+PageUp, not a single month', () => {
    // Regression: the view stepped by one month whatever the jump, so a year jump left the
    // focused day off-screen — the roving tabindex then pointed at a cell that was not in the
    // DOM and keyboard focus was lost entirely.
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('PageUp', { shiftKey: true });
    expect(cal.focusedDay()).toBe('2023-03-15');
    expect(cal.visibleMonth()).toBe('2023-03-01');
  });

  it('scrolls a whole year for Shift+PageDown', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('PageDown', { shiftKey: true });
    expect(cal.focusedDay()).toBe('2025-03-15');
    expect(cal.visibleMonth()).toBe('2025-03-01');
  });

  it('always leaves the focused day inside the rendered grid', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    for (const [keyName, modifiers] of [
      ['PageUp', { shiftKey: true }],
      ['PageDown', { shiftKey: true }],
      ['PageDown', { shiftKey: true }],
      ['ArrowUp', {}],
      ['PageUp', {}],
    ] as const) {
      cal.send(keyName, modifiers);
      const focused = cal.focusedDay();
      const visible = cal.visibleMonth();
      expect(focused.slice(0, 7)).toBe(visible.slice(0, 7));
    }
  });

  it('does not scroll while focus stays inside the month', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('ArrowRight');
    expect(cal.visibleMonth()).toBe('2024-03-01');
  });

  it('does not scroll a multi-month view while the target stays visible', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15), numberOfMonths: 3 });
    cal.send('PageDown');
    expect(cal.focusedDay()).toBe('2024-04-15');
    expect(cal.visibleMonth()).toBe('2024-03-01');
  });
});

describe('selection', () => {
  it('Enter selects the focused day', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('ArrowRight');
    cal.send('Enter');
    expect(key(cal.value() as Date)).toBe('2024-03-16');
  });

  it('Space selects the focused day', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('ArrowLeft');
    cal.send(' ');
    expect(key(cal.value() as Date)).toBe('2024-03-14');
  });

  it('does not move focus on Enter', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    cal.send('Enter');
    expect(cal.focusedDay()).toBe('2024-03-15');
  });
});

describe('event handling', () => {
  it('consumes the keys it handles', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    for (const keyName of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', ' ']) {
      const event = cal.send(keyName);
      expect(event.preventDefault).toHaveBeenCalled();
    }
  });

  it('leaves keys it does not handle alone', () => {
    const cal = withKeyboard({ defaultValue: d(2024, 3, 15) });
    for (const keyName of ['Tab', 'Escape', 'a', 'F5']) {
      const event = cal.send(keyName);
      expect(event.preventDefault).not.toHaveBeenCalled();
    }
    expect(cal.focusedDay()).toBe('2024-03-15');
  });
});
