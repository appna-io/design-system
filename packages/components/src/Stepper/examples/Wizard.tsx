import { useState } from 'react';
import { Button, Card, Input, Stepper } from '@apx-ui/ds';

const STEPS = [
  { id: 'account', label: 'Account', description: 'Email + password' },
  { id: 'profile', label: 'Profile', description: 'Name + photo' },
  { id: 'plan', label: 'Plan', description: 'Pick a plan' },
  { id: 'review', label: 'Review', description: 'Confirm details' },
];

export default function Wizard() {
  const [active, setActive] = useState(0);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const total = STEPS.length;
  const isLast = active === total - 1;

  if (submitted) {
    return (
      <Card>
        <Card.Body>
          <p className="font-medium">All done!</p>
          <p className="text-sm text-fg-muted">
            Pretend your form just got POSTed. Click reset to play again.
          </p>
          <div className="mt-3">
            <Button
              variant="ghost"
              onClick={() => {
                setSubmitted(false);
                setActive(0);
                setName('');
              }}
            >
              Reset
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Body>
        <Stepper
          active={active}
          steps={STEPS}
          clickable
          linear
          onStepClick={({ index }) => setActive(index)}
        />
        <div className="mt-6 flex flex-col gap-3">
          {active === 0 && (
            <div className="flex flex-col gap-1">
              <label htmlFor="wizard-name" className="text-sm font-medium">
                Display name
              </label>
              <Input
                id="wizard-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sakura"
              />
            </div>
          )}
          {active === 1 && (
            <p className="text-sm text-fg-muted">
              Pretend there&rsquo;s a profile form here, {name || 'friend'}.
            </p>
          )}
          {active === 2 && (
            <p className="text-sm text-fg-muted">Pretend there&rsquo;s a plan picker here.</p>
          )}
          {active === 3 && (
            <p className="text-sm">
              Ready to ship, <strong>{name || 'friend'}</strong>?
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setActive((i) => Math.max(0, i - 1))}>
              Back
            </Button>
            {isLast ? (
              <Button color="success" onClick={() => setSubmitted(true)}>
                Submit
              </Button>
            ) : (
              <Button onClick={() => setActive((i) => Math.min(total - 1, i + 1))}>Next</Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
