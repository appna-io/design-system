import { useState } from 'react';
import { Button, Div, Field, Input } from '@apx-ui/ds';

export default function WithError() {
  const [value, setValue] = useState('not-an-email');
  const isInvalid = !/^.+@.+\..+$/.test(value);

  return (
    <Div display="flex" flexDirection="column" gap="3" className="max-w-sm">
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
      <Div display="flex" gap="2">
        <Button variant="ghost" onClick={() => setValue('jane@apx.dev')}>
          Set valid value
        </Button>
        <Button variant="ghost" onClick={() => setValue('')}>
          Clear
        </Button>
      </Div>
    </Div>
  );
}