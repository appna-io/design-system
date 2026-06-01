import { Div, Field, Input } from '@apx-ui/ds';

export default function Required() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="max-w-sm">
      <Field label="Full name" required>
        <Input name="name" />
      </Field>
      <Field label="Email" required helperText="Used to send invoices and password resets.">
        <Input type="email" name="email" />
      </Field>
    </Div>
  );
}