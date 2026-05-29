import { useState } from 'react';
import { Button, Stepper } from 'apx-ds';

export default function Basic() {
  const [active, setActive] = useState(1);

  const steps = [
    { id: 'account', label: 'Account', description: 'Email + password' },
    { id: 'profile', label: 'Profile', description: 'Name + photo' },
    { id: 'plan', label: 'Plan', description: 'Pick a plan' },
    { id: 'review', label: 'Review', description: 'Confirm details' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Stepper active={active} steps={steps} />
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => setActive((i) => Math.max(0, i - 1))}
          disabled={active === 0}
        >
          Back
        </Button>
        <Button
          onClick={() => setActive((i) => Math.min(steps.length - 1, i + 1))}
          disabled={active === steps.length - 1}
        >
          Next
        </Button>
        <Button variant="ghost" onClick={() => setActive(0)}>
          Reset
        </Button>
      </div>
    </div>
  );
}
