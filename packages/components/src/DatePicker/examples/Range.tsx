import { useState } from 'react';

import { DateRangePicker, Div, Typography, type DateRange } from '@apx-ui/ds';

export default function Range() {
  const [value, setValue] = useState<DateRange>({ start: null, end: null });

  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3">
      <DateRangePicker value={value} onChange={setValue} />
      <Typography variant="bodySmall" color="fg.muted">
        {value.start && value.end
          ? `${value.start.toLocaleDateString()} – ${value.end.toLocaleDateString()}`
          : 'No range selected'}
      </Typography>
    </Div>
  );
}