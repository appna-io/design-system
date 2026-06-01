import { useState } from 'react';
import { Checkbox, Div, Typography } from '@apx-ui/ds';

export default function Controlled() {
  const [controlled, setControlled] = useState(false);

  return (
    <Div className="grid grid-cols-2 gap-6">
      <Div display="flex" flexDirection="column" gap="2">
        <Typography as="h4" variant="bodySmall" weight="medium">
          Uncontrolled
        </Typography>
        <Checkbox defaultChecked>Has its own state</Checkbox>
        <Typography variant="caption" color="fg.muted">
          React owns it via the DOM.
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" gap="2">
        <Typography as="h4" variant="bodySmall" weight="medium">
          Controlled
        </Typography>
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
      </Div>
    </Div>
  );
}