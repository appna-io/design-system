import { useState } from 'react';
import { Button, Div, Field, Input } from '@apx-ui/ds';

export default function Disabled() {
  const [disabled, setDisabled] = useState(true);

  return (
    <Div display="flex" flexDirection="column" gap="4" className="max-w-sm">
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
    </Div>
  );
}