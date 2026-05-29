import { useState } from 'react';
import { Button, Stepper } from 'apx-ds';

export default function WithErrorStep() {
  const [hasError, setHasError] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <Stepper
        active={2}
        steps={[
          { id: 'a', label: 'Account' },
          { id: 'b', label: 'Profile' },
          {
            id: 'c',
            label: 'Payment',
            description: hasError ? 'Card declined — try another method' : undefined,
            status: hasError ? 'error' : undefined,
          },
          { id: 'd', label: 'Review' },
        ]}
      />
      <Button variant="ghost" onClick={() => setHasError((v) => !v)}>
        {hasError ? 'Resolve error' : 'Re-introduce error'}
      </Button>
    </div>
  );
}
