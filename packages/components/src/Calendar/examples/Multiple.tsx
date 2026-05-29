import { useState } from 'react';

import { Calendar } from 'apx-ds';

export default function Multiple() {
  const [value, setValue] = useState<Date[]>([]);

  return (
    <div className="flex flex-col items-start gap-4">
      <Calendar
        mode="multiple"
        value={value}
        onChange={(v) => setValue(v as Date[])}
      />
      <p className="text-sm text-fg-muted">
        {value.length === 0
          ? 'No dates selected'
          : `${value.length} dates: ${value.map((d) => d.toLocaleDateString()).join(', ')}`}
      </p>
    </div>
  );
}
