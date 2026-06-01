import { useState } from 'react';
import { Button, Div, Stepper, Typography, type StepperVariant } from '@apx-ui/ds';

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
    <Div display="flex" flexDirection="column" gap="6">
      <Div display="flex" gap="2">
        <Button onClick={() => setActive((i) => (i + 1) % STEPS.length)}>Advance</Button>
        <Button variant="ghost" onClick={() => setActive(0)}>
          Reset
        </Button>
      </Div>
      {VARIANTS.map((variant) => (
        <Div key={variant} display="flex" flexDirection="column" gap="2">
          <Typography variant="caption" color="fg.muted" className="uppercase tracking-wide">
            {variant}
          </Typography>
          <Stepper active={active} steps={STEPS} variant={variant} />
        </Div>
      ))}
    </Div>
  );
}