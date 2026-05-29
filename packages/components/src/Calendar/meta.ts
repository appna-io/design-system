import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'calendar',
  displayName: 'Calendar',
  description:
    'Headless + DOM date primitive. Powers `<DatePicker>`, `<DateRangePicker>`, and the ' +
    'Scheduler sidebar mini-month. Supports single / multiple / range selection modes, ' +
    'one or two visible months, locale-aware weekday + month names + first-day-of-week, ' +
    'RTL via logical CSS, the full W3C Date Picker Dialog keyboard pattern (arrows, ' +
    'Home/End, PageUp/Down, Shift+PageUp/Down, Enter/Space), constraint props (min / max / ' +
    'isDateDisabled), week-number gutter, fixed-week layout to prevent inter-month jank, ' +
    'and custom day / weekday / header renderers. Pure date math (~12 helpers, no external ' +
    'date library) + `Intl.DateTimeFormat` for everything locale-shaped.',
  category: 'Inputs',
  tags: ['calendar', 'date', 'datepicker', 'date-range', 'aria-grid', 'rtl', 'i18n'],
};
