import { useState } from 'react';
import { Switch } from '@apx-ui/ds';

export default function Controlled() {
  const [controlled, setControlled] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">Uncontrolled</h4>
        <Switch defaultChecked>Has its own state</Switch>
        <p className="text-xs text-fg-muted">React owns it via the DOM.</p>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">Controlled</h4>
        <Switch checked={controlled} onCheckedChange={setControlled}>
          Driven by parent state
        </Switch>
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
