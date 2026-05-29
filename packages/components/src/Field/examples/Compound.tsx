import { Field, Input } from '@apx-ui/ds';

export default function Compound() {
  return (
    <Field required>
      <Field.Label>Email address</Field.Label>
      <Field.Description>Used for billing notifications and password resets.</Field.Description>
      <Input type="email" name="email" placeholder="you@example.com" />
      <Field.Helper>Lowercase letters only.</Field.Helper>
    </Field>
  );
}
