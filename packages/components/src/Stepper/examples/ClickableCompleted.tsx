import { useState } from 'react';
import { Button, Stepper } from '@apx-ui/ds';

const STEPS = [
  { id: 'a', label: 'Account' },
  { id: 'b', label: 'Profile' },
  { id: 'c', label: 'Plan' },
  { id: 'd', label: 'Review' },
];

export default function ClickableCompleted() {
  const [active, setActive] = useState(2);

  return (
    <div className="flex flex-col gap-3">
      <Stepper
        active={active}
        steps={STEPS}
        clickable="completed"
        onStepClick={({ index }) => setActive(index)}
      />
      <div className="flex gap-2">
        <Button onClick={() => setActive((i) => Math.min(STEPS.length - 1, i + 1))}>
          Advance
        </Button>
      </div>
      <p className="text-xs text-fg-muted">
        Only <em>completed</em> steps are clickable — that lets the user jump back without
        skipping ahead.
      </p>
    </div>
  );
}
