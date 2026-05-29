import { Field, Input } from 'apx-ds';

export default function WithDescription() {
  return (
    <Field
      label="API key"
      description="Issued from your account settings. Treat it like a password — don't share it or commit it to source control."
      helperText="Press Cmd+V to paste."
    >
      <Input type="password" name="apiKey" placeholder="sk_live_…" />
    </Field>
  );
}
