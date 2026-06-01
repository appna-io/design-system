import { createContext, useContext } from 'react';

import type {
  CalendarColor,
  CalendarSize,
  CalendarVariant,
  UseCalendarReturn,
} from './Calendar.types';

/**
 * Internal context shared by the root, the day cells, and the header. Composes the headless
 * `UseCalendarReturn` with the resolved variant axes so subparts don't redo the responsive
 * lookup.
 */
export interface CalendarContextValue extends UseCalendarReturn {
  variant: CalendarVariant;
  size: CalendarSize;
  color: CalendarColor;
  showWeekNumbers: boolean;
  /** ID assigned to the grid for `aria-labelledby` wiring on the title element. */
  rootId: string;
}

export const CalendarContext = createContext<CalendarContextValue | null>(null);

export function useCalendarContext(): CalendarContextValue {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error(
      '[apx-ds] <Calendar> subparts must be rendered inside a <Calendar> root.',
    );
  }
  return ctx;
}

export function useOptionalCalendarContext(): CalendarContextValue | null {
  return useContext(CalendarContext);
}