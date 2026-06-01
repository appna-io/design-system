import { useState } from 'react';

import { Button, Div, Toaster, Typography, toast } from '@apx-ui/ds';

export default function Dedup() {
  const [count, setCount] = useState(0);

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Button
        onClick={() => {
          const next = count + 1;
          setCount(next);
          toast(`You've clicked ${next} times`, {
            id: 'click-counter',
            description: 'Same id, updates in place.',
          });
        }}
      >
        Click me ({count})
      </Button>
      <Typography variant="bodySmall" color="fg.muted">
        Each click reuses the same toast id, so the existing toast updates instead of stacking.
      </Typography>
      <Toaster />
    </Div>
  );
}