import { useState } from 'react';
import { Div, Stepper, Typography } from '@apx-ui/ds';

const STEPS = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'plan', label: 'Plan' },
  { id: 'review', label: 'Review' },
];

export default function Clickable() {
  const [active, setActive] = useState(1);

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Stepper
        active={active}
        steps={STEPS}
        clickable
        onStepClick={({ index }) => setActive(index)}
      />
      <Typography variant="caption" color="fg.muted">
        Every indicator is a button — click any step to jump there. <strong>Active step:</strong>{' '}
        {STEPS[active]?.label}.
      </Typography>
    </Div>
  );
}