import { useState } from 'react';
import { Button, Stepper } from 'apx-ds';

export default function WithLoadingStep() {
  const [loading, setLoading] = useState(false);

  const trigger = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 2200);
  };

  return (
    <div className="flex flex-col gap-4">
      <Stepper
        active={2}
        steps={[
          { id: 'a', label: 'Account' },
          { id: 'b', label: 'Profile' },
          {
            id: 'c',
            label: 'Verifying',
            description: loading ? 'Checking your card...' : 'Click below to simulate verification',
            status: loading ? 'loading' : undefined,
          },
          { id: 'd', label: 'Done' },
        ]}
      />
      <Button onClick={trigger} disabled={loading}>
        {loading ? 'Verifying...' : 'Start verification'}
      </Button>
    </div>
  );
}
