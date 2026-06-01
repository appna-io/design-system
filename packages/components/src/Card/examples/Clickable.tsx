import { useState } from 'react';
import { Card } from '@apx-ui/ds';

export default function Clickable() {
  const [clicks, setClicks] = useState(0);

  return (
    <Card
      clickable
      hoverable
      color="primary"
      className="max-w-sm"
      onClick={() => setClicks((c) => c + 1)}
    >
      <Card.Header title="Clickable Card" subtitle="Try the keyboard too" />
      <Card.Body>
        `clickable` turns the whole surface into a single click target — Enter / Space activate
        when focused, the focus ring tints by `color`, and `aria-disabled` blocks pointer events
        when `disabled` is true. Clicks: {clicks}.
      </Card.Body>
    </Card>
  );
}