import { useState } from 'react';

import { DatePicker } from '@apx-ui/ds';

const today = new Date();
const inFive = new Date(today);
inFive.setDate(today.getDate() + 5);
const inThirty = new Date(today);
inThirty.setDate(today.getDate() + 30);

export default function MinMax() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <div className="flex flex-col items-start gap-3 max-w-sm">
      <p className="text-sm text-fg-muted">
        Allowed: {inFive.toLocaleDateString()} – {inThirty.toLocaleDateString()}
      </p>
      <DatePicker value={value} onChange={setValue} min={inFive} max={inThirty} />
    </div>
  );
}
