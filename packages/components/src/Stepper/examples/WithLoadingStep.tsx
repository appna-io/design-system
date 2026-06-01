import { useState } from 'react';
import { Button, Div, Stepper } from '@apx-ui/ds';

export default function WithLoadingStep() {
  const [loading, setLoading] = useState(false);

  const trigger = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 2200);
  };

  return (
    <Div display="flex" flexDirection="column" gap="4">
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
    </Div>
  );
}