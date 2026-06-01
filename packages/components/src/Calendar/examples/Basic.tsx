import { useState } from 'react';

import { Calendar, Div, Typography } from '@apx-ui/ds';

export default function Basic() {
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <Div display="flex" flexDirection="column" alignItems="start" gap="4">
      <Calendar mode="single" value={value} onChange={(v) => setValue(v as Date | null)} />
      <Typography variant="bodySmall" color="fg.muted">
        Selected: {value ? value.toDateString() : '—'}
      </Typography>
    </Div>
  );
}