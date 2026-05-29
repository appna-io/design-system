import { useState } from 'react';
import { Stepper } from 'apx-ds';

const STEPS = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'plan', label: 'Plan' },
  { id: 'review', label: 'Review' },
];

export default function Clickable() {
  const [active, setActive] = useState(1);

  return (
    <div className="flex flex-col gap-3">
      <Stepper
        active={active}
        steps={STEPS}
        clickable
        onStepClick={({ index }) => setActive(index)}
      />
      <p className="text-xs text-fg-muted">
        Every indicator is a button — click any step to jump there. <strong>Active step:</strong>{' '}
        {STEPS[active]?.label}.
      </p>
    </div>
  );
}
