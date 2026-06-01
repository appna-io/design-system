import { useState } from 'react';

import { DateRangePicker, Div, Typography, type DateRange } from '@apx-ui/ds';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

const PRESETS = [
  { id: 'today', label: 'Today', range: () => ({ start: daysAgo(0), end: daysAgo(0) }) },
  { id: 'last-7', label: 'Last 7 days', range: () => ({ start: daysAgo(6), end: daysAgo(0) }) },
  { id: 'last-30', label: 'Last 30 days', range: () => ({ start: daysAgo(29), end: daysAgo(0) }) },
  {
    id: 'this-month',
    label: 'This month',
    range: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }),
  },
  {
    id: 'last-month',
    label: 'Last month',
    range: () => {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return { start: startOfMonth(d), end: endOfMonth(d) };
    },
  },
];

export default function Presets() {
  const [value, setValue] = useState<DateRange>({ start: daysAgo(6), end: daysAgo(0) });

  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3">
      <DateRangePicker value={value} onChange={setValue} presets={PRESETS} />
      <Typography variant="bodySmall" color="fg.muted">
        {value.start && value.end
          ? `${value.start.toLocaleDateString()} – ${value.end.toLocaleDateString()}`
          : 'No range selected'}
      </Typography>
    </Div>
  );
}