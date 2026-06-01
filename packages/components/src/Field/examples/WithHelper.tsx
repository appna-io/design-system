import { Div, Field, Input } from '@apx-ui/ds';

export default function WithHelper() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="max-w-sm">
      <Field label="Username" helperText="Lowercase letters, numbers, and hyphens only.">
        <Input name="username" placeholder="jane-doe" />
      </Field>
      <Field label="Display name" helperText="Shown next to your avatar across the app.">
        <Input name="display" placeholder="Jane Doe" />
      </Field>
    </Div>
  );
}