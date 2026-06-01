import { useState } from 'react';

import { Calendar, Div, Typography } from '@apx-ui/ds';

const today = new Date();
const inFiveDays = new Date(today);
inFiveDays.setDate(today.getDate() + 5);
const inTwentyDays = new Date(today);
inTwentyDays.setDate(today.getDate() + 20);

export default function MinMax() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <Div display="flex" flexDirection="column" alignItems="start" gap="4">
      <Typography variant="bodySmall" color="fg.muted">
        Allowed range: {inFiveDays.toLocaleDateString()} – {inTwentyDays.toLocaleDateString()}
      </Typography>
      <Calendar
        mode="single"
        value={value}
        onChange={(v) => setValue(v as Date | null)}
        min={inFiveDays}
        max={inTwentyDays}
      />
    </Div>
  );
}