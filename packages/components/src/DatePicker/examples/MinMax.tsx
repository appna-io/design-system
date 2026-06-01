import { useState } from 'react';

import { DatePicker, Div, Typography } from '@apx-ui/ds';

const today = new Date();
const inFive = new Date(today);
inFive.setDate(today.getDate() + 5);
const inThirty = new Date(today);
inThirty.setDate(today.getDate() + 30);

export default function MinMax() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3" className="max-w-sm">
      <Typography variant="bodySmall" color="fg.muted">
        Allowed: {inFive.toLocaleDateString()} – {inThirty.toLocaleDateString()}
      </Typography>
      <DatePicker value={value} onChange={setValue} min={inFive} max={inThirty} />
    </Div>
  );
}