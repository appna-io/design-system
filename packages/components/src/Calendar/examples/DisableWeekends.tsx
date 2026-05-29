import { useState } from 'react';

import { Calendar } from '@apx-ui/ds';

export default function DisableWeekends() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-sm text-fg-muted">Weekends are disabled.</p>
      <Calendar
        mode="single"
        value={value}
        onChange={(v) => setValue(v as Date | null)}
        isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
      />
    </div>
  );
}
