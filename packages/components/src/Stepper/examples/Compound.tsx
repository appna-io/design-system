import { useState } from 'react';
import { Button, Stepper } from 'apx-ds';

export default function Compound() {
  const [active, setActive] = useState(1);

  return (
    <div className="flex flex-col gap-4">
      <Stepper active={active}>
        <Stepper.Step id="a" label="Account" />
        <Stepper.Step id="b" label="Profile" />
        <Stepper.Step id="c" label="Plan" />
        <Stepper.Step id="d" label="Review" />
      </Stepper>
      <div className="flex gap-2">
        <Button onClick={() => setActive((i) => Math.min(3, i + 1))}>Next</Button>
        <Button variant="ghost" onClick={() => setActive((i) => Math.max(0, i - 1))}>
          Back
        </Button>
      </div>
    </div>
  );
}
