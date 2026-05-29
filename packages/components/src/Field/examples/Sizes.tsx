import { Field, Input } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Field label="Small" size="sm" helperText="Compact size — for dense forms.">
        <Input size="sm" name="sm" placeholder="size=sm" />
      </Field>
      <Field label="Medium" size="md" helperText="Default size.">
        <Input size="md" name="md" placeholder="size=md" />
      </Field>
      <Field label="Large" size="lg" helperText="Comfortable size — for hero forms.">
        <Input size="lg" name="lg" placeholder="size=lg" />
      </Field>
    </div>
  );
}
