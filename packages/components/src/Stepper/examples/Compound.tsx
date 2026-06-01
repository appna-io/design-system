import { useState } from 'react';
import { Button, Div, Stepper } from '@apx-ui/ds';

export default function Compound() {
  const [active, setActive] = useState(1);

  return (
    <Div display="flex" flexDirection="column" gap="4">
      <Stepper active={active}>
        <Stepper.Step id="a" label="Account" />
        <Stepper.Step id="b" label="Profile" />
        <Stepper.Step id="c" label="Plan" />
        <Stepper.Step id="d" label="Review" />
      </Stepper>
      <Div display="flex" gap="2">
        <Button onClick={() => setActive((i) => Math.min(3, i + 1))}>Next</Button>
        <Button variant="ghost" onClick={() => setActive((i) => Math.max(0, i - 1))}>
          Back
        </Button>
      </Div>
    </Div>
  );
}