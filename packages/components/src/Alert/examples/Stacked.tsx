import { useState } from 'react';
import { Alert, Button, Div } from '@apx-ui/ds';

interface Item {
  id: number;
  color: 'info' | 'success' | 'warning' | 'danger';
  text: string;
}

const SEED: readonly Item[] = [
  { id: 1, color: 'info', text: 'We pushed a new build. Refresh when convenient.' },
  { id: 2, color: 'success', text: 'Your invoice was paid.' },
  { id: 3, color: 'warning', text: 'Your trial ends in 5 days.' },
];

export default function Stacked() {
  const [items, setItems] = useState<readonly Item[]>(SEED);

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Div display="flex" flexDirection="column" gap="2">
        {items.map((item) => (
          <Alert
            key={item.id}
            color={item.color}
            closable
            onClose={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
          >
            {item.text}
          </Alert>
        ))}
      </Div>
      {items.length === 0 ? (
        <Button size="sm" variant="outline" onClick={() => setItems(SEED)}>
          Restore alerts
        </Button>
      ) : null}
    </Div>
  );
}