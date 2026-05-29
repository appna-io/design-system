import { useState } from 'react';
import { Button, Field, Input } from 'apx-ds';

export default function WithError() {
  const [value, setValue] = useState('not-an-email');
  const isInvalid = !/^.+@.+\..+$/.test(value);

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <Field
        label="Email"
        helperText="We'll never share this with anyone."
        error={isInvalid ? 'Please enter a valid email address.' : undefined}
      >
        <Input
          type="email"
          name="email"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setValue('jane@apx.dev')}>
          Set valid value
        </Button>
        <Button variant="ghost" onClick={() => setValue('')}>
          Clear
        </Button>
      </div>
    </div>
  );
}
