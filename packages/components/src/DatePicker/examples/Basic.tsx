import { useState } from 'react';

import { DatePicker } from 'apx-ds';

export default function Basic() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <div className="flex flex-col items-start gap-3">
      <DatePicker value={value} onChange={setValue} />
      <p className="text-sm text-fg-muted">
        Value: {value ? value.toISOString().slice(0, 10) : 'null'}
      </p>
    </div>
  );
}
