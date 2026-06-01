import { useState } from 'react';
import { Div, Field, Input, Typography } from '@apx-ui/ds';

/**
 * Quick-review demo of `<Field />` — three common configurations side-by-side:
 * a standard text input with helper text, a password field, and a field in an error state.
 */
export default function Overview() {
  const [email, setEmail] = useState('jane@apx');

  return (
    <Div display="flex" alignItems="flex-start" gap="6" className="flex-wrap">
      <Div display="flex" flexDirection="column" gap="2" className="min-w-[200px] flex-1">
        <Field label="Display name" helperText="Shown on your profile and in comments.">
          <Input name="displayName" placeholder="Jane Doe" defaultValue="Jane Doe" />
        </Field>
        <Typography variant="caption" color="fg.muted">
          With helper text
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" gap="2" className="min-w-[200px] flex-1">
        <Field label="Password" required>
          <Input type="password" name="password" placeholder="••••••••" />
        </Field>
        <Typography variant="caption" color="fg.muted">
          Required
        </Typography>
      </Div>

      <Div display="flex" flexDirection="column" gap="2" className="min-w-[200px] flex-1">
        <Field
          label="Work email"
          helperText="We'll send a confirmation link."
          error={!/^.+@.+\..+$/.test(email) ? 'Enter a valid email address.' : undefined}
        >
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Typography variant="caption" color="fg.muted">
          Validation error
        </Typography>
      </Div>
    </Div>
  );
}