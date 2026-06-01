import { useState } from 'react';

import { Button, Div, Toaster, toast } from '@apx-ui/ds';
import type { ToastPosition } from '@apx-ui/ds';

const POSITIONS: ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

export default function Positions() {
  const [position, setPosition] = useState<ToastPosition>('bottom-right');

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Div display="flex" flexWrap="wrap" gap="2">
        {POSITIONS.map((p) => (
          <Button
            key={p}
            variant={p === position ? 'solid' : 'outline'}
            onClick={() => {
              setPosition(p);
              toast(`Position: ${p}`);
            }}
          >
            {p}
          </Button>
        ))}
      </Div>
      <Toaster position={position} richColors />
    </Div>
  );
}