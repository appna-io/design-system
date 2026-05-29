import { useState } from 'react';
import { Checkbox } from 'apx-ds';

export default function Controlled() {
  const [controlled, setControlled] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">Uncontrolled</h4>
        <Checkbox defaultChecked>Has its own state</Checkbox>
        <p className="text-xs text-fg-muted">React owns it via the DOM.</p>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">Controlled</h4>
        <Checkbox checked={controlled} onCheckedChange={setControlled}>
          Driven by parent state
        </Checkbox>
        <button
          type="button"
          onClick={() => setControlled((c) => !c)}
          className="self-start text-xs text-primary underline"
        >
          Toggle externally ({String(controlled)})
        </button>
      </div>
    </div>
  );
}
