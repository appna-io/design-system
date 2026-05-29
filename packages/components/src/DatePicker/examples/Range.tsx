import { useState } from 'react';

import { DateRangePicker, type DateRange } from '@apx-ui/ds';

export default function Range() {
  const [value, setValue] = useState<DateRange>({ start: null, end: null });

  return (
    <div className="flex flex-col items-start gap-3">
      <DateRangePicker value={value} onChange={setValue} />
      <p className="text-sm text-fg-muted">
        {value.start && value.end
          ? `${value.start.toLocaleDateString()} – ${value.end.toLocaleDateString()}`
          : 'No range selected'}
      </p>
    </div>
  );
}
