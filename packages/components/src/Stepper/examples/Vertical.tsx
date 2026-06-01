import { useState } from 'react';
import { Button, Div, Stepper, VStack } from '@apx-ui/ds';

export default function Vertical() {
  const [active, setActive] = useState(1);
  const steps = [
    { id: 'cart', label: 'Cart', description: '3 items' },
    { id: 'shipping', label: 'Shipping', description: 'Address & method' },
    { id: 'payment', label: 'Payment', description: 'Card or bank' },
    { id: 'review', label: 'Review', description: 'Confirm and pay' },
  ];

  return (
    <Div display="flex" gap="6">
      <Stepper active={active} steps={steps} orientation="vertical" />
      <VStack gap={2} className="self-end">
        <Button onClick={() => setActive((i) => Math.min(steps.length - 1, i + 1))}>Next</Button>
        <Button variant="ghost" onClick={() => setActive((i) => Math.max(0, i - 1))}>
          Back
        </Button>
      </VStack>
    </Div>
  );
}