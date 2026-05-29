import { useState } from 'react';
import { Card } from 'apx-ds';

const PLANS = [
  { id: 'starter', name: 'Starter', price: '$0', tagline: 'For tinkering' },
  { id: 'pro', name: 'Pro', price: '$19', tagline: 'For day-to-day' },
  { id: 'team', name: 'Team', price: '$49', tagline: 'For small teams' },
];

export default function Selectable() {
  const [selected, setSelected] = useState('pro');

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
            <span className="text-2xl font-semibold">{plan.price}</span>
            <span className="text-fg-muted"> / mo</span>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
