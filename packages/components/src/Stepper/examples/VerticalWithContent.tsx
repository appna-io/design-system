import { useState } from 'react';
import { Button, Stepper } from '@apx-ui/ds';

export default function VerticalWithContent() {
  const [active, setActive] = useState(1);

  return (
    <Stepper active={active} orientation="vertical">
      <Stepper.Step id="account" label="Account" description="Email + password">
        <div className="flex flex-col gap-2 p-3 bg-bg-subtle rounded-md">
          <p className="text-sm">Pretend there&rsquo;s a form here.</p>
          <Button size="sm" onClick={() => setActive(1)}>
            Continue to profile
          </Button>
        </div>
      </Stepper.Step>
      <Stepper.Step id="profile" label="Profile" description="Name + photo">
        <div className="flex flex-col gap-2 p-3 bg-bg-subtle rounded-md">
          <p className="text-sm">Pretend there&rsquo;s another form here.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setActive(0)}>
              Back
            </Button>
            <Button size="sm" onClick={() => setActive(2)}>
              Continue to plan
            </Button>
          </div>
        </div>
      </Stepper.Step>
      <Stepper.Step id="plan" label="Plan" description="Pick a plan">
        <div className="flex flex-col gap-2 p-3 bg-bg-subtle rounded-md">
          <p className="text-sm">The active step expands inline. Inactive ones stay collapsed.</p>
          <Button size="sm" variant="ghost" onClick={() => setActive(0)}>
            Start over
          </Button>
        </div>
      </Stepper.Step>
    </Stepper>
  );
}
