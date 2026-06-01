import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'scheduler',
  displayName: 'Scheduler',
  description:
    'Google-Calendar-parity scheduling primitive — sibling Tier-3 component to `<DataGrid />`. ' +
    'Ships month / week / workWeek / day / multiDay / agenda views (year + resource swimlanes ' +
    'are scaffolded for the next PR), an hour-grid timeline with drag-to-create + snap-to-grid + ' +
    'overlap-packing + now-indicator + all-day band, a Google-Calendar-style quick-create popover ' +
    '(composes `<Popover>` + `<Input>` + `<Button>` + `<ToggleGroup>`), holidays via list / ' +
    'provider / built-in ~20-locale defaults, calendar / resource / search / dateRange / custom ' +
    'filters, CRUD via `readOnly` / per-event `editable` predicate + optimistic patches, ' +
    'RRULE-lite recurrence expansion, locale + RTL first-class via `<I18nProvider>`. Pure helpers ' +
    '(dateMath / eventLayout / recurrence / holidays / dragMath / viewportRange / splitAtMidnight ' +
    '/ findConflicts) are exposed for consumers rolling bespoke UIs. **No external date or ' +
    'scheduling library** — pure `Intl` + ~200 LoC of pure helpers.',
  category: 'Data Display',
  tags: [
    'scheduler',
    'calendar',
    'timeline',
    'event',
    'agenda',
    'gantt',
    'time-grid',
    'aria-grid',
  ],
};