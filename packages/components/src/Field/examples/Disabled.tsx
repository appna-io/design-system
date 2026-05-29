import { useState } from 'react';
import { Button, Field, Input } from 'apx-ds';

export default function Disabled() {
  const [disabled, setDisabled] = useState(true);

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Field
        label="API endpoint"
        disabled={disabled}
        helperText="Locked while the deployment is in progress."
      >
        <Input name="endpoint" defaultValue="https://api.apx.dev/v1" />
      </Field>
      <Button variant="ghost" onClick={() => setDisabled((value) => !value)}>
        {disabled ? 'Unlock field' : 'Lock field'}
      </Button>
    </div>
  );
}
