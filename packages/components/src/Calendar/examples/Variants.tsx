import { useState } from 'react';

import { Calendar, Div, Typography } from '@apx-ui/ds';

export default function Variants() {
  const [d, setD] = useState<Date>(new Date());

  return (
    <Div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Div display="flex" flexDirection="column" gap="2">
        <Typography as="h3" variant="bodySmall" weight="semibold">
          Solid (default)
        </Typography>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} variant="solid" />
      </Div>
      <Div display="flex" flexDirection="column" gap="2">
        <Typography as="h3" variant="bodySmall" weight="semibold">
          Outline
        </Typography>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} variant="outline" />
      </Div>
      <Div display="flex" flexDirection="column" gap="2">
        <Typography as="h3" variant="bodySmall" weight="semibold">
          Soft
        </Typography>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} variant="soft" />
      </Div>
      <Div display="flex" flexDirection="column" gap="2">
        <Typography as="h3" variant="bodySmall" weight="semibold">
          Minimal
        </Typography>
        <Calendar mode="single" value={d} onChange={(v) => setD(v as Date)} variant="minimal" />
      </Div>
    </Div>
  );
}