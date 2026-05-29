import { useState } from 'react';
import { Button, Field, Input, Stack } from 'apx-ds';

/**
 * Placeholder for the eventual `<Form>` (Phase 50) integration. Today Field reads its values
 * from props; when Phase 50 lands, Field will additionally read from FormContext, so this same
 * example will keep working but with `name` driving `value` / `onChange` automatically.
 *
 * The mini-form below uses local `useState` to demonstrate the pattern end-to-end without
 * waiting on Phase 50.
 */
export default function InForm() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!/^.+@.+\..+$/.test(values.email)) nextErrors.email = 'Invalid email.';
    if (values.password.length < 8) nextErrors.password = 'At least 8 characters required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(`Signed in as ${values.email}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <Stack gap={4}>
        <Field
          label="Email"
          required
          error={errors.email}
          helperText="Used for password resets."
        >
          <Input
            type="email"
            value={values.email}
            onChange={(event) => setValues((v) => ({ ...v, email: event.target.value }))}
          />
        </Field>
        <Field label="Password" required error={errors.password}>
          <Input
            type="password"
            value={values.password}
            onChange={(event) => setValues((v) => ({ ...v, password: event.target.value }))}
          />
        </Field>
        <div className="flex gap-2">
          <Button type="submit">Sign in</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setValues({ email: '', password: '' });
              setErrors({});
              setSubmitted(null);
            }}
          >
            Reset
          </Button>
        </div>
        {submitted ? <p className="text-sm text-success">{submitted}</p> : null}
      </Stack>
    </form>
  );
}
