import { useState } from 'react';
import { Card, Div, Typography } from '@apx-ui/ds';

const PLANS = [
  { id: 'starter', name: 'Starter', price: '$0', tagline: 'For tinkering' },
  { id: 'pro', name: 'Pro', price: '$19', tagline: 'For day-to-day' },
  { id: 'team', name: 'Team', price: '$49', tagline: 'For small teams' },
];

export default function Selectable() {
  const [selected, setSelected] = useState('pro');

  return (
    <Div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          clickable
          selected={selected === plan.id}
          color="primary"
          onClick={() => setSelected(plan.id)}
        >
          <Card.Header title={plan.name} subtitle={plan.tagline} />
          <Card.Body>
            <Typography as="span" variant="h3" weight="semibold">
              {plan.price}
            </Typography>
            <Typography as="span" variant="bodySmall" color="fg.muted">
              {' '}
              / mo
            </Typography>
          </Card.Body>
        </Card>
      ))}
    </Div>
  );
}