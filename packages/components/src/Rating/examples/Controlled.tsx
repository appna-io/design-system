import { useState } from 'react';
import { Div, Rating, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [value, setValue] = useState(2);
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Rating value={value} onChange={(next) => setValue(next)} ariaLabel="Controlled rating" />
      <Typography as="span" variant="caption" color="fg.muted">
        Current value: <strong>{value}</strong>
      </Typography>
    </Div>
  );
}