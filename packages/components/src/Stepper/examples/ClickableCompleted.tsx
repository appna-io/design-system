import { useState } from 'react';
import { Button, Div, Stepper, Typography } from '@apx-ui/ds';

const STEPS = [
  { id: 'a', label: 'Account' },
  { id: 'b', label: 'Profile' },
  { id: 'c', label: 'Plan' },
  { id: 'd', label: 'Review' },
];

export default function ClickableCompleted() {
  const [active, setActive] = useState(2);

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Stepper
        active={active}
        steps={STEPS}
        clickable="completed"
        onStepClick={({ index }) => setActive(index)}
      />
      <Div display="flex" gap="2">
        <Button onClick={() => setActive((i) => Math.min(STEPS.length - 1, i + 1))}>
          Advance
        </Button>
      </Div>
      <Typography variant="caption" color="fg.muted">
        Only <em>completed</em> steps are clickable — that lets the user jump back without
        skipping ahead.
      </Typography>
    </Div>
  );
}