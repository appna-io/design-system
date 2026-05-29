import { Field, Input } from 'apx-ds';

export default function Optional() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Field label="Full name" required>
        <Input name="name" />
      </Field>
      <Field label="Phone" optional helperText="We'll only call about urgent account issues.">
        <Input name="phone" type="tel" />
      </Field>
    </div>
  );
}
