import { Field, Input } from '@apx-ui/ds';

export default function Required() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Field label="Full name" required>
        <Input name="name" />
      </Field>
      <Field label="Email" required helperText="Used to send invoices and password resets.">
        <Input type="email" name="email" />
      </Field>
    </div>
  );
}
