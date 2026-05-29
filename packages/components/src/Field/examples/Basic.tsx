import { Field, Input } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Field label="Email" helperText="We'll never share this with anyone.">
      <Input type="email" name="email" placeholder="you@example.com" />
    </Field>
  );
}
