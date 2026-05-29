import { useState } from 'react';
import { Button, Stepper } from 'apx-ds';

const STEPS = [
  { id: 'a', label: 'Account' },
  { id: 'b', label: 'Profile' },
  { id: 'c', label: 'Plan' },
  { id: 'd', label: 'Review' },
];

export default function LinearMode() {
  const [active, setActive] = useState(1);

  return (
    <div className="flex flex-col gap-3">
      <Stepper
        active={active}
        steps={STEPS}
        clickable
        linear
        onStepClick={({ index }) => setActive(index)}
      />
      <div className="flex gap-2">
        <Button onClick={() => setActive((i) => Math.min(STEPS.length - 1, i + 1))}>Next</Button>
        <Button variant="ghost" onClick={() => setActive((i) => Math.max(0, i - 1))}>
          Back
        </Button>
      </div>
      <p className="text-xs text-fg-muted">
        Linear mode: you can return to a completed step but can&rsquo;t skip ahead to a pending
        one.
      </p>
    </div>
  );
}
