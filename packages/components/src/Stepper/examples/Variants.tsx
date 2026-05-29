import { useState } from 'react';
import { Button, Stepper, type StepperVariant } from 'apx-ds';

const STEPS = [
  { id: 'a', label: 'Account' },
  { id: 'b', label: 'Profile' },
  { id: 'c', label: 'Plan' },
  { id: 'd', label: 'Review' },
];

const VARIANTS: StepperVariant[] = ['numbered', 'dots', 'progress'];

export default function Variants() {
  const [active, setActive] = useState(2);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <Button onClick={() => setActive((i) => (i + 1) % STEPS.length)}>Advance</Button>
        <Button variant="ghost" onClick={() => setActive(0)}>
          Reset
        </Button>
      </div>
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-fg-muted">{variant}</span>
          <Stepper active={active} steps={STEPS} variant={variant} />
        </div>
      ))}
    </div>
  );
}
