import { useState } from 'react';

import { Calendar, Div, Typography } from '@apx-ui/ds';

export default function DisableWeekends() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <Div display="flex" flexDirection="column" alignItems="start" gap="4">
      <Typography variant="bodySmall" color="fg.muted">Weekends are disabled.</Typography>
      <Calendar
        mode="single"
        value={value}
        onChange={(v) => setValue(v as Date | null)}
        isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
      />
    </Div>
  );
}