import { useState } from 'react';

import { Calendar } from '@apx-ui/ds';

const today = new Date();
const inFiveDays = new Date(today);
inFiveDays.setDate(today.getDate() + 5);
const inTwentyDays = new Date(today);
inTwentyDays.setDate(today.getDate() + 20);

export default function MinMax() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-sm text-fg-muted">
        Allowed range: {inFiveDays.toLocaleDateString()} – {inTwentyDays.toLocaleDateString()}
      </p>
      <Calendar
        mode="single"
        value={value}
        onChange={(v) => setValue(v as Date | null)}
        min={inFiveDays}
        max={inTwentyDays}
      />
    </div>
  );
}
