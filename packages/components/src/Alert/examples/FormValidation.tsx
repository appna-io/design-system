import { useState } from 'react';
import { Alert, Input } from '@apx-ui/ds';

export default function FormValidation() {
  const [value, setValue] = useState('');
  const invalid = value.length > 0 && value.length < 3;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="form-validation-username" className="text-sm font-medium text-fg">
        Username
      </label>
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
    </div>
  );
}
