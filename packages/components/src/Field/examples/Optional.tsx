import { Div, Field, Input } from '@apx-ui/ds';

export default function Optional() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="max-w-sm">
      <Field label="Full name" required>
        <Input name="name" />
      </Field>
      <Field label="Phone" optional helperText="We'll only call about urgent account issues.">
        <Input name="phone" type="tel" />
      </Field>
    </Div>
  );
}