import { useState } from 'react';
import { Div, Rating, Typography } from '@apx-ui/ds';

export default function AllowClear() {
  const [value, setValue] = useState(3);
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Rating value={value} onChange={(next) => setValue(next)} allowClear ariaLabel="Clearable rating" />
      <Typography as="span" variant="caption" color="fg.muted">
        Click the current value (or press <kbd>Home</kbd>) to clear. Value: <strong>{value}</strong>
      </Typography>
    </Div>
  );
}