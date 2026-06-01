import { useState } from 'react';

import { Calendar, Div, Typography } from '@apx-ui/ds';

/**
 * Single-date selection with min/max constraints — shows the default calendar surface and
 * a realistic bounded booking window at a glance.
 */
export default function Overview() {
  const today = new Date();
  const min = new Date(today);
  min.setDate(today.getDate() + 3);
  const max = new Date(today);
  max.setDate(today.getDate() + 30);

  const [value, setValue] = useState<Date | null>(null);

  return (
    <Div display="flex" flexDirection="column" alignItems="start" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Pick a launch date within the next month (first three days unavailable).
      </Typography>
      <Calendar
        mode="single"
        value={value}
        onChange={(v) => setValue(v as Date | null)}
        min={min}
        max={max}
      />
      <Typography variant="caption" color="fg.muted">
        Selected: {value ? value.toLocaleDateString() : 'None yet'}
      </Typography>
    </Div>
  );
}