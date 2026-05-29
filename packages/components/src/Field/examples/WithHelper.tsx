import { Field, Input } from 'apx-ds';

export default function WithHelper() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Field label="Username" helperText="Lowercase letters, numbers, and hyphens only.">
        <Input name="username" placeholder="jane-doe" />
      </Field>
      <Field label="Display name" helperText="Shown next to your avatar across the app.">
        <Input name="display" placeholder="Jane Doe" />
      </Field>
    </div>
  );
}
