import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'date-picker',
  displayName: 'DatePicker',
  description:
    'Single-date picker — composes `<Input>` + `<Popover>` + `<Calendar>`. Typed input ' +
    '(with a permissive `MM/dd/yyyy`-style format parser), clearable, presets, locale + ' +
    'RTL aware, hidden ISO-8601 form field for posts. Ships alongside `<DateRangePicker>` ' +
    '(two-month variant with presets like "Last 7 days").',
  category: 'Inputs',
  tags: ['date-picker', 'date-range-picker', 'date', 'calendar', 'form'],
};
