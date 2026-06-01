import { useState } from 'react';

import { Calendar, Div, Typography } from '@apx-ui/ds';

export default function Multiple() {
  const [value, setValue] = useState<Date[]>([]);

  return (
    <Div display="flex" flexDirection="column" alignItems="start" gap="4">
      <Calendar
        mode="multiple"
        value={value}
        onChange={(v) => setValue(v as Date[])}
      />
      <Typography variant="bodySmall" color="fg.muted">
        {value.length === 0
          ? 'No dates selected'
          : `${value.length} dates: ${value.map((d) => d.toLocaleDateString()).join(', ')}`}
      </Typography>
    </Div>
  );
}