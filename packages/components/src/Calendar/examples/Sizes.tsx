import { useState } from 'react';

import { Calendar, Div, Typography } from '@apx-ui/ds';

export default function Sizes() {
  const [d, setD] = useState<Date>(new Date());

  return (
    <Div display="flex" flexWrap="wrap" alignItems="start" gap="6">
      <Div display="flex" flexDirection="column" gap="2">
        <Typography as="h3" variant="bodySmall" weight="semibold">
          Small
        </Typography>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} size="sm" />
      </Div>
      <Div display="flex" flexDirection="column" gap="2">
        <Typography as="h3" variant="bodySmall" weight="semibold">
          Medium
        </Typography>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} size="md" />
      </Div>
      <Div display="flex" flexDirection="column" gap="2">
        <Typography as="h3" variant="bodySmall" weight="semibold">
          Large
        </Typography>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} size="lg" />
      </Div>
    </Div>
  );
}