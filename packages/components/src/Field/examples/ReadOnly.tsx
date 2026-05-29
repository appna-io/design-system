import { useState } from 'react';
import { Button, Field, Input } from '@apx-ui/ds';

export default function ReadOnly() {
  const [readOnly, setReadOnly] = useState(true);

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Field
        label="Account ID"
        readOnly={readOnly}
        helperText="Account IDs are immutable. Edit only when you know what you're doing."
      >
        <Input name="accountId" defaultValue="acct_01H8AB12C3D4E5F6G7H8" readOnly={readOnly} />
      </Field>
      <Button variant="ghost" onClick={() => setReadOnly((value) => !value)}>
        {readOnly ? 'Allow editing' : 'Lock as read-only'}
      </Button>
    </div>
  );
}
