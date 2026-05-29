import { useState } from 'react';

import { Button, Toaster, toast } from 'apx-ds';
import type { ToastPosition } from 'apx-ds';

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
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
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
      </div>
      <Toaster position={position} richColors />
    </div>
  );
}
