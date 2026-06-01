import { useState } from 'react';

import { DatePicker, Div, Typography } from '@apx-ui/ds';

export default function Basic() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3">
      <DatePicker value={value} onChange={setValue} />
      <Typography variant="bodySmall" color="fg.muted">
        Value: {value ? value.toISOString().slice(0, 10) : 'null'}
      </Typography>
    </Div>
  );
}