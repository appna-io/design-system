import { useState } from 'react';
import { Alert, Div, Input, Typography } from '@apx-ui/ds';

export default function FormValidation() {
  const [value, setValue] = useState('');
  const invalid = value.length > 0 && value.length < 3;

  return (
    <Div display="flex" flexDirection="column" className="gap-1.5">
      <Typography as="label" htmlFor="form-validation-username" variant="bodySmall" weight="medium" color="fg.default">
        Username
      </Typography>
      <Input
        id="form-validation-username"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        invalid={invalid}
        placeholder="Pick a username"
        aria-describedby={invalid ? 'form-validation-error' : undefined}
      />
      {invalid ? (
        <Alert
          id="form-validation-error"
          variant="inline"
          color="danger"
          size="sm"
        >
          Username must be at least 3 characters.
        </Alert>
      ) : null}
    </Div>
  );
}