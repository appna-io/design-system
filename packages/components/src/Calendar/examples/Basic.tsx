import { useState } from 'react';

import { Calendar } from 'apx-ds';

export default function Basic() {
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <div className="flex flex-col items-start gap-4">
      <Calendar mode="single" value={value} onChange={(v) => setValue(v as Date | null)} />
      <p className="text-sm text-fg-muted">
        Selected: {value ? value.toDateString() : '—'}
      </p>
    </div>
  );
}
