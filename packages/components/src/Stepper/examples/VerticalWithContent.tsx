import { useState } from 'react';
import { Button, Div, Stepper, Typography } from '@apx-ui/ds';

export default function VerticalWithContent() {
  const [active, setActive] = useState(1);

  return (
    <Stepper active={active} orientation="vertical">
      <Stepper.Step id="account" label="Account" description="Email + password">
        <Div display="flex" flexDirection="column" gap="2" className="rounded-md bg-bg-subtle p-3">
          <Typography variant="bodySmall">Pretend there&rsquo;s a form here.</Typography>
          <Button size="sm" onClick={() => setActive(1)}>
            Continue to profile
          </Button>
        </Div>
      </Stepper.Step>
      <Stepper.Step id="profile" label="Profile" description="Name + photo">
        <Div display="flex" flexDirection="column" gap="2" className="rounded-md bg-bg-subtle p-3">
          <Typography variant="bodySmall">Pretend there&rsquo;s another form here.</Typography>
          <Div display="flex" gap="2">
            <Button size="sm" variant="ghost" onClick={() => setActive(0)}>
              Back
            </Button>
            <Button size="sm" onClick={() => setActive(2)}>
              Continue to plan
            </Button>
          </Div>
        </Div>
      </Stepper.Step>
      <Stepper.Step id="plan" label="Plan" description="Pick a plan">
        <Div display="flex" flexDirection="column" gap="2" className="rounded-md bg-bg-subtle p-3">
          <Typography variant="bodySmall">
            The active step expands inline. Inactive ones stay collapsed.
          </Typography>
          <Button size="sm" variant="ghost" onClick={() => setActive(0)}>
            Start over
          </Button>
        </Div>
      </Stepper.Step>
    </Stepper>
  );
}