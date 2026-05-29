import { useState } from 'react';

import { Calendar } from 'apx-ds';

export default function WeekNumbers() {
  const [d, setD] = useState<Date>(new Date());

  return (
    <Calendar
      mode="single"
      value={d}
      onChange={(v) => setD(v as Date)}
      showWeekNumbers
      variant="outline"
    />
  );
}
