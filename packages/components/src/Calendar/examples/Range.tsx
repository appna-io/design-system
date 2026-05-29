import { useState } from 'react';

import { Calendar, type DateRange } from '@apx-ui/ds';

export default function Range() {
  const [value, setValue] = useState<DateRange>({ start: null, end: null });

  return (
    <div className="flex flex-col items-start gap-4">
      <Calendar
        mode="range"
        value={value}
        onChange={(v) => setValue(v as DateRange)}
        numberOfMonths={2}
      />
      <p className="text-sm text-fg-muted">
        Start: {value.start?.toDateString() ?? '—'} · End: {value.end?.toDateString() ?? '—'}
      </p>
    </div>
  );
}
