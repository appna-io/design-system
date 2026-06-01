import { useState } from 'react';

import { Calendar, Div, Typography, type DateRange } from '@apx-ui/ds';

export default function Range() {
  const [value, setValue] = useState<DateRange>({ start: null, end: null });

  return (
    <Div display="flex" flexDirection="column" alignItems="start" gap="4">
      <Calendar
        mode="range"
        value={value}
        onChange={(v) => setValue(v as DateRange)}
        numberOfMonths={2}
      />
      <Typography variant="bodySmall" color="fg.muted">
        Start: {value.start?.toDateString() ?? '—'} · End: {value.end?.toDateString() ?? '—'}
      </Typography>
    </Div>
  );
}