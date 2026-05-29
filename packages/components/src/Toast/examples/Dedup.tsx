import { useState } from 'react';

import { Button, Toaster, toast } from '@apx-ui/ds';

export default function Dedup() {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-3">
      <Button
        onClick={() => {
          const next = count + 1;
          setCount(next);
          toast(`You\u2019ve clicked ${next} times`, {
            id: 'click-counter',
            description: 'Same id, updates in place.',
          });
        }}
      >
        Click me ({count})
      </Button>
      <p className="text-sm text-fg-muted">
        Each click reuses the same toast id, so the existing toast updates instead of stacking.
      </p>
      <Toaster />
    </div>
  );
}
